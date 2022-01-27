<template>
  <select v-bind:id="currentTree" @change="selected">
    <option value="" disabled="" selected="">Select a tree</option>
    <option v-for="tree in treelist" :key="tree.id" v-bind:value="tree.id">
      {{ tree.label }}
    </option>
  </select>
</template>
<script>
import { defineComponent } from "vue";
// import { default as treeview } from "./treeview.vue";
export default defineComponent({
  //   components: { treeview },
  props: {
    treelist: Array,
  },
  setup(props) {
    return {
      treelist: props.treelist,
    };
  },
  data() {
    return { currentTree: "" };
  },
  emits: ["tree-selected"],
  methods: {
    selected(ev) {
      this.currentTree = ev.currentTarget.value;
      this.$emit("tree-selected", { value: this.currentTree });
    },
  },
});
</script>


<style>
.greeting {
  color: red;
  font-weight: bold;
}
</style>
