<template>
  <div>
    <h1>Wise importer</h1>
    <input type="file" @change="onFileChange" />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

@Options({
  props: {
  },
  methods: {
    onFileChange(event: any) {
      const file = event.target.files[0];
      console.log(file);
      // const reader = new FileReader();
      // reader.onload = (e: any) => {
      //   console.log(e.target.result);
      // };
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
