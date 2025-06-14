<template>
  <UButton variant="ghost" class="w-full p-1" @click="onUserSelect()">
    <div class="flex max-w-full w-full">
      <UAvatar :src="avatarUrl" icon="i-lucide-user" size="md" />
      <div class="pl-3 flex flex-col flex-grow justify-center items-start">
        <div
          class="font-bold w-full text-left text-neutral-600 dark:text-neutral-300 overflow-hidden line-clamp-1 text-ellipsis"
        >
          {{ name }}
        </div>
        <div
          v-if="lastMsg"
          class="font-light w-full text-wrap text-left text-neutral-500 overflow-hidden line-clamp-1 text-ellipsis"
        >
          {{ lastMsg }}
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

const drawerOpen = useOpenDrawer();

// Handle user selection in the command palette
async function onUserSelect() {
  drawerOpen.value = false;
  navigateTo(`/chat/${props.chatroomId}`);
}
</script>

<style></style>
