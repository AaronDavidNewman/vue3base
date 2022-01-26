<template>
<div id="counter">
Counter: {{ counter }}
</div>
<div id="button">
  <button @click="handleClick">Click me</button>
</div>
<subcomp :items="items"></subcomp>
</template>
<script>
import { default as subcomp } from './subcomp.vue';
export default {
  components: { subcomp },
  data() {
    return {
      counter: 0,
      items: []
    }
  }, methods: {
    handleClick() {
      this.counter += 1;
      this.items.push({ label: 'list ' + this.counter });
    }
  }
}
</script>