<template>
  <h1>Wise importer</h1>
  <ol>
    <li>
      <label for="wiseApiKey">Wise API key</label>
      <input id="wiseApiKey" v-model="wiseApiKey" />
      <span>(Find the key in LastPass under "YNAB importer")</span>
    </li>
    <li>
      <label for="upload">Upload Wise CSV</label>
      <input id="upload" type="file" @change="upload" :disabled="!wiseApiKey" />
    </li>
    <li>
      <button @click="download" :disabled="transactions.length === 0">Download YNAB CSV</button>
    </li>
  </ol>
  <div>
    <table>
      <thead>
        <tr>
          <th>Index</th>
          <th>Date</th>
          <th>Payee</th>
          <th>Memo</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(transaction, index) in transactions" :key="transaction.id">
          <td class="index">{{ index + 1 }}</td>
          <td>{{ transaction.date.toLocaleDateString() }}</td>
          <td>{{ transaction.payee }}</td>
          <td>{{ transaction.memo }}</td>
          <td class="amount">{{ transaction.amount.toFixed(2) }} HUF</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import * as Papa from 'papaparse';
import { saveAs } from 'file-saver';
import axios from 'axios';
import { Options, Vue } from 'vue-class-component';
import Transaction from './Transaction';

type FileEventTarget = EventTarget & { files: FileList };

function parseWiseDate(date: string): Date {
  const matcher = /(\d\d)-(\d\d)-(\d{4})/.exec(date);
  if (!matcher) {
    throw new Error(`Invalid date: ${date}`);
  }
  return new Date(+matcher[3], +matcher[2] - 1, +matcher[1]);
}

async function calculateHufAmount(date: Date, row: unknown[], wiseApiKey: string) {
  const originalAmount = row[2] as number;
  const currency = row[3] as string;
  // Has the transaction happen in HUF?
  if (currency === 'HUF') {
    return originalAmount;
  }
  const exchangeTo = row[8] as string;
  // Has the transaction happen in HUF?
  if (exchangeTo === 'HUF') {
    // Exchanging to HUF
    if ((row[0] as string).startsWith('CARD-')) {
      // This is a card transaction
      const matcher = (row[4] as string).match(/Card transaction of ([\d.]+) HUF issued by .*/);
      if (matcher) {
        return +matcher[1] * Math.sign(originalAmount);
      }
    }
    const exchangeRate = row[9] as number;
    return originalAmount * exchangeRate;
  }
  // The transaction hasn't happened in HUF, nor was it converted to HUF
  // We need to look up the conversion rate
  const url = `https://api.wise.com/v1/rates?source=${currency}&target=HUF&time=${Transaction.toYnabDate(date)}`;
  const rate = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${wiseApiKey}`,
    },
  })
    .then((response: any) => response.data[0].rate)
    .catch((error: any) => {
      console.error(error);
    });
  console.log(rate);
  return originalAmount * rate;
}

@Options({
  data() {
    return {
      wiseApiKey: '',
      transactions: [],
    };
  },
  props: {
  },
  methods: {
    upload(event: Event) {
      const target = event.target as FileEventTarget;
      const file = target.files[0];
      console.log(file);
      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const text = e.target?.result as string;
        Papa.parse(text, {
          delimiter: ',',
          dynamicTyping: true,
          complete: (csv: Papa.ParseResult<unknown[][]>) => {
            const csvRows = csv.data;
            csvRows.shift();
            const transactionPromises: Promise<Transaction>[] = csvRows
              .filter((row: unknown[]) => row[0] !== null && row[0] as string !== '')
              .map((row: unknown[], index: number) => {
                // 0: "TransferWise ID"
                // 1: "Date"
                // 2: "Amount"
                // 3: "Currency"
                // 4: "Description"
                // 5: "Payment Reference"
                // 6: "Running Balance"
                // 7: "Exchange From"
                // 8: "Exchange To"
                // 9: "Exchange Rate"
                // 10: "Payer Name"
                // 11: "Payee Name"
                // 12: "Payee Account Number"
                // 13: "Merchant"
                // 14: "Card Last Four Digits"
                // 15: "Total fees"
                console.log(index, row);
                const date = parseWiseDate(row[1] as string);
                return calculateHufAmount(date, row, this.wiseApiKey)
                  .then((amount: number) => {
                    const payee = [
                      row[10] as string,
                      row[11] as string,
                      row[12] as string,
                      row[13] as string,
                    ]
                      .filter((item: string) => item)
                      .join(' / ') || 'Wise internal';
                    const cardNo = row[14] as string;
                    const description = [
                      row[4] as string,
                      row[5] as string,
                      cardNo ? `(Card: ***${cardNo})` : '',
                    ]
                      .filter((item: string) => item)
                      .join(' / ');
                    return new Transaction(date, payee, '', description, amount);
                  });
              });
            Promise.all(transactionPromises)
              .then((transactions: Transaction[]) => {
                this.transactions = transactions;
              });
          },
        });
      };
    },
    download() {
      const ynabTransactions = this.transactions
        .map((transaction: Transaction) => transaction.toYnab());
      ynabTransactions.unshift(['Date', 'Payee', 'Category', 'Memo', 'Outflow', 'Inflow']);
      const csvText = Papa.unparse(ynabTransactions, {
        delimiter: ',',
      });
      const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8' });
      saveAs(blob, 'ynab-import.csv');
    },
  },
})
export default class HelloWorld extends Vue {
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
td.index {
  text-align: right;
}

td.amount {
  text-align: right;
}
</style>
