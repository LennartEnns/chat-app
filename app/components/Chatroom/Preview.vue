<template>
  <UButton :label="name"> </UButton><UAvatar :src="avatarUrl" size="md" />
</template>

<script lang="ts" setup>
console.log("loaded");
const props = defineProps<{
  name: string;
  avatarUrl: string | undefined;
}>();
console.log("Preview component loaded with props:", props);
</script>

<style></style>
