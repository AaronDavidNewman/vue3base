<template>
  <div class="form-group form-group-constrained">
    <label class="form-group-label" v-bind:for="id"> {{ label }} </label>
    <select v-bind:id="id" @change="selected">
      <option value="" disabled="" selected="">Select a {{ label }}</option>
      <option v-for="item in items" :key="item.label" v-bind:value="item.id">
        {{ item.label }}
      </option>
    </select>
  </div>
</template>
<script>
import { ref } from "vue";
export default {
  name: "treeview",
  setup(props) {
    const id = ref(props.id);
    const label = ref(props.label);
    const items = ref(props.items);
    const level = ref(props.level);
    return { id, label, items, level };
  },
  data() {
    return { currentValue: "" };
  },
  emits: ['level-selected'],
  props: {
    id: String,
    label: String,
    items: Array,
    level: Number,
  },
  methods: {
    selected(ev) {
      this.currentValue = ev.currentTarget.value;
      this.$emit("level-selected", { value: this.currentValue, level: this.level });
    },
  },
};
</script>
<style scoped>
.form-group {
  margin-bottom: 15px;
}
.form-group-label {
  display: inline-block;
  min-width: 49%;
  margin-bottom: 3px;
}
</style>
