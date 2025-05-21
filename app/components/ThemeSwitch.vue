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
const isLight = useSSRSafeTheme();
const switchOutlineColor = computed(() => "outline-neutral");
</script>

<style></style>
