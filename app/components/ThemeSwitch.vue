<template>
  <USwitch
    v-model="isLight"
    :class="`self-center rounded-full outline-1 ${switchOutlineColor}`"
    unchecked-icon="i-lucide-moon"
    checked-icon="i-lucide-sun"
    size="lg"
  />
</template>

<script lang="ts" setup>
const isLight = useSSRSafeTheme()
const switchOutlineColor = computed(() => isLight.value ? 'outline-neutral-800' : 'outline-neutral-100')
</script>

<style>

</style>