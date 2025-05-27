<template>
  <UCard
    variant="subtle" class="border-1 border-gray-500 w-sm xl:w-md"
    :ui="{
      header: 'border-none pb-1 text-lg'
  }">
    <template #header>
      <p class="font-bold text-center">{{ operationTitle }}</p>
    </template>

    <slot />
  </UCard>
</template>

<script lang="ts" setup>
defineProps<{
  operationTitle: string,
}>();
</script>

<style>

</style>