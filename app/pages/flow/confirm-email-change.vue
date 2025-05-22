<template>
  <div>
    
  </div>
</template>

<script setup lang="ts">
const route = useRoute();

onMounted(async () => {
  console.log(route.params, route.hash, route.query);
})
</script>