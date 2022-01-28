<template>
  <select v-bind:id="currentTree" @change="selected" class="astAttrSelect">
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
.tabOpen-Items select.astAttrSelect {
    min-height: 2em;
}
.itemPropertiesContainer select{
  max-width: 100%;
  min-width: 90%;
  width: 100%;
  min-height: 2em;
}
</style>
