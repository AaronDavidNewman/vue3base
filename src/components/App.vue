<template>
<div>
<sub><a href="https://github.com/AaronDavidNewman/vue3base">Github </a> site.
<a href="https://aarondavidnewman.github.io/vue3base/">Readme</a> documentation</sub>
</div>
<div>
          <select v-model='selectedList' >
            <option value="" style="display: none">Select a list</option>
            <option v-for="list in lists" :key="list" v-bind:value="list"> {{ list }}  </option>
          </select>
          <div><h2>{{ selectedList }} </h2></div>
          <select v-model="selectedItem">
            <option value="" style="display: none">Select an item</option>
            <option v-for="item in selectedItems" :key="item" v-bind:value="item">  {{ item }}  </option>
          </select>
          <div><h2>{{ selectedItem }} count {{ selectedItemCount }} </h2></div>
          </div>
</template>
<script>
import { ref, watch } from 'vue';

export default {
  setup() {
    const listData = {
      "list1": ["value1-1", "value1-2", "value1-3"],
      "list2": ["value2-1"]
    }
    const lists = ["list1", "list2"];
    const selectedList = ref('');
    const selectedItem = ref('');
    const selectedItems = ref([]);
    const selectedItemCount = ref(0);
    watch (selectedList, (value, oldValue) => {
      if (oldValue !== value) {
        selectedItems.value = listData[value];
        if (selectedItems.value.length === 1) {
            selectedItem.value = selectedItems.value[0];
          } else {
            selectedItem.value = '';
          }       
      }
    });
    watch (selectedItem, (value, oldValue) => {
      if (value !== oldValue) {
        selectedItemCount.value += 1;
      }
    });
    return { selectedList, selectedItems, selectedItem, lists, selectedItemCount };
  },
  
};
</script>
<style>
select {
  margin-top: 10px;
  margin-left: 5px;
}
option {
   width: 300px;
}
</style>