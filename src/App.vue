<template>
  <wise-importer/>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import WiseImporter from './components/WiseImporter.vue';

@Options({
  components: {
    WiseImporter,
  },
})
export default class App extends Vue {}
</script>

<style>
#app {
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
