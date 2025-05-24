<template>
  <USwitch
    v-model="isLight"
    :class="`cursor-pointer self-center rounded-full outline-1 outline-neutral`"
    unchecked-icon="i-lucide-moon"
    checked-icon="i-lucide-sun"
    size="lg"
  />
</template>

<script lang="ts" setup>
const { isLight } = useSSRSafeTheme();
</script>

<style></style>
