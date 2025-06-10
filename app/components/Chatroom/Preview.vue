<template>
  <UButton variant="subtle" @click="onUserSelect()">
    <UAvatar :src="avatarUrl" icon="i-lucide-user" size="md" />
    <div class="ml-2">
      <span class="font-bold">{{ name }}</span>
    </div>
  </UButton>
</template>

<script lang="ts" setup>
import type { UserSearchResult } from "~/types/userSearch";
console.log("loaded");
const props = defineProps<{
  id: string;
  name: string;
  avatarUrl: string | undefined;
}>();
console.log("Preview component loaded with props:", props.avatarUrl);

// Handle user selection in the command palette
async function onUserSelect() {
  navigateTo(`/chat/${props.id}`);
}
</script>

<style></style>
