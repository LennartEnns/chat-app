<template>
  <UButton variant="subtle">
    <UAvatar :src="avatarUrl" icon="i-lucide-user" size="md" />
    <div class="ml-2">
      <span class="font-bold">{{ name }}</span>
    </div>
  </UButton>
</template>

<script lang="ts" setup>
console.log("loaded");
const props = defineProps<{
  name: string;
  avatarUrl: string | undefined;
}>();
console.log("Preview component loaded with props:", props.avatarUrl);
</script>

<style></style>
