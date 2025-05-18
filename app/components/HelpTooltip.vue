<template>
  <UTooltip v-model:open="open" :text="text">
    <UButton color="neutral" variant="link" icon="i-heroicons-question-mark-circle" size="sm" class="w-4 h-4 text-gray-400 cursor-pointer" @click="open = true" />
  </UTooltip>
</template>

<script lang="ts" setup>
defineProps({
  text: {
    type: String,
    required: true,
  },
})
const open = ref(false)
</script>

<style>

</style>