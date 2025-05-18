<template>
  <USwitch
    v-model="isLight"
    :class="`self-center rounded-full border-1 ${switchBorderColor}`"
    unchecked-icon="i-lucide-moon"
    checked-icon="i-lucide-sun"
  />
</template>

<script lang="ts" setup>
const isLight = useSSRSafeTheme()
const switchBorderColor = computed(() => isLight.value ? 'border-neutral-800' : 'border-neutral-100')
</script>

<style>

</style>