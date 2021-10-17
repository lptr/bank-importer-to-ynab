<template>
  <div>
    <h1>Wise importer</h1>
    <input type="file" @change="onFileChange" />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import * as Papa from 'papaparse';

@Options({
  props: {
  },
  methods: {
    onFileChange(event: any) {
      const file = event.target.files[0];
      console.log(file);
      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const text = e.target?.result as string;
        Papa.parse(text, {
          delimiter: ',',
          complete: (csv: Papa.ParseResult<any>) => {
            const csvRows = csv.data;
            csvRows.shift();
            console.log(csvRows);
            // const transactions: Transaction[] = [];
            // for (let csvRow of csvRows) {
            //   if (csvRow[0] === "") {
            //     break;
            //   }
            //   const transaction = new Transaction(
            //       csvRow, (amount: number, currency: string, date: string) => 1234);
            //   console.log(transaction);
            //   transactions.push(transaction);
            // }
            // this.transactions = transactions;
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
