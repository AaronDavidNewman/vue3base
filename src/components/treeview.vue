<template>
  <div class="form-group form-group-constrained">
    <label class="form-group-label" v-bind:for="uniqueId"> {{ label }} </label>
    <select v-bind:id="uniqueId" @change="selected" :disabled="isDisabled">
      <option value="default" style="display: none">Select a {{ label }}</option>
      <option v-for="item in items" :key="item.label" v-bind:value="item.id">
        {{ item.label }}
      </option>
    </select>
  </div>
</template>
<script>
import { defineComponent } from "vue";
export default defineComponent({
  name: "treeview",
  setup(props) {
    const id = props.id;
    const label = props.label;
    const items = props.items;
    const level = props.level;
    const domId = props.domId;
    return { id, label, items, level, domId };
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
    domId: String
  },
  computed: {
    isDisabled() {
      return this.items.length < 1;
    },
    uniqueId() {
      return this.domId + '-' + this.level;
    }
  },
  methods: {
    selected(ev) {
      this.currentValue = ev.currentTarget.value;
      this.$emit("level-selected", { value: this.currentValue, level: this.level });
    },
  },
});
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
.itemPropertiesContainer select{
  max-width: 100%;
  min-width: 90%;
  width: 100%;
  min-height: 2em;
}
.itemPreferences label {
  display: inline-block;
  min-width: 49%;
  margin-bottom: 3px;
}
</style>
