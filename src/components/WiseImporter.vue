<template>
  <div>
    <h1>Wise importer</h1>
    <input type="file" @change="onFileChange" />
  </div>
  <div>
    <table>
      <thead>
        <tr>
          <th>Index</th>
          <th>Date</th>
          <th>Payee</th>
          <th>Category</th>
          <th>Memo</th>
          <th>Outflow</th>
          <th>Inflow</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(transaction, index) in transactions" :key="transaction.id">
          <td>{{ index + 1 }}</td>
          <td>{{ transaction.date }}</td>
          <td>{{ transaction.payee }}</td>
          <td>{{ transaction.category }}</td>
          <td>{{ transaction.memo }}</td>
          <td>{{ transaction.outflow }}</td>
          <td>{{ transaction.inflow }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import * as Papa from 'papaparse';
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

@Options({
  data() {
    return {
      transactions: [],
    };
  },
  props: {
  },
  methods: {
    onFileChange(event: Event) {
      const target = event.target as FileEventTarget;
      const file = target.files[0];
      console.log(file);
      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const text = e.target?.result as string;
        Papa.parse(text, {
          delimiter: ',',
          complete: (csv: Papa.ParseResult<unknown[][]>) => {
            const csvRows = csv.data;
            csvRows.shift();
            this.transactions = csvRows
              .filter((row: unknown[]) => row[0] as string !== '')
              .map((row: unknown[]) => {
                console.log(row);
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
                const amount = row[2] as number;
                return new Transaction(
                  parseWiseDate(row[1] as string),
                  [
                    row[10] as string,
                    row[11] as string,
                    row[13] as string,
                    'Wise',
                  ].find((item: string) => item) as string,
                  '',
                  row[4] as string,
                  amount < 0 ? -amount : 0,
                  amount >= 0 ? amount : 0,
                );
              });
          },
        });
      };
    },
  },
})
export default class HelloWorld extends Vue {
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
