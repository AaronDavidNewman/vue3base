<template> 
  <ul id="parent">
    <li  v-for="(item) in items" :key="item.label">
        {{ item.label }}
    </li>
    </ul>
</template>
<script>
export default  {
  name: 'SubComp',
  props: {
      items: Object 
  }
}
</script>
