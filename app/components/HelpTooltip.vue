<template>
  <UTooltip v-model:open="open" :text="text">
    <UButton
      color="neutral"
      variant="link"
      icon="i-heroicons-question-mark-circle"
      size="sm"
      class="w-4 h-4 text-gray cursor-pointer"
      @click="open = true"
    />
  </UTooltip>
</template>

<script lang="ts" setup>
defineProps<{ text: string }>();
const open = ref(false);
</script>

<style></style>
