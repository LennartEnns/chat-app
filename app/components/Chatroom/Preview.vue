<template>
  <UButton variant="ghost" class="w-full p-1" @click="onUserSelect()">
    <div class="flex max-w-full w-full">
      <UAvatar :src="avatarUrl" icon="i-lucide-user" size="md" />
      <div class="pl-3 flex flex-col flex-grow justify-start items-start">
        <div
          class="font-bold w-full text-left text-neutral-600 dark:text-neutral-300 overflow-hidden line-clamp-1 text-ellipsis"
        >
          {{ name }}
        </div>
        <div
          class="font-light w-full text-left text-neutral-500 overflow-hidden line-clamp-1 text-ellipsis"
        >
          {{ lastMsg }}‎
        </div>
      </div>
    </div>
  </UButton>
</template>

<script lang="ts" setup>
const props = defineProps<{
  chatroomId: string;
  name: string;
  avatarUrl: string | undefined;
  lastMsg: string | null;
}>();

// Handle user selection in the command palette
async function onUserSelect() {
  navigateTo(`/chat/${props.chatroomId}`);
}
</script>

<style></style>
