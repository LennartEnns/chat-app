<template>
  <UButton variant="ghost" class="w-full p-1" @click="onChatroomSelect()">
    <div class="flex items-center max-w-full w-full">
      <UAvatar :src="avatarUrl" icon="i-lucide-user" size="md" />
      <div class="pl-3 flex flex-col flex-grow justify-center items-start">
        <div
          v-if="!hasOtherUserLeft"
          class="font-bold w-full text-left text-neutral-600 dark:text-neutral-300 overflow-hidden line-clamp-1 text-ellipsis"
        >
          {{ name }}
        </div>
        <div v-else class="italic w-full text-left text-muted">
          User has left
        </div>
        <div
          class="font-light w-full text-left text-neutral-500 overflow-hidden line-clamp-1 text-ellipsis"
        >
          {{ lastMsg }}<br v-if="!lastMsg" />
        </div>
      </div>
      <UChip
        v-if="numberNewMessages > 0"
        :text="numberNewMessages"
        size="3xl"
        inset
        class="self-start light:text-error-500 dark:text-error-500"
        :ui="{
          base: 'px-1',
        }"
      />
    </div>
  </UButton>
</template>

<script lang="ts" setup>
const props = defineProps<{
  chatroomId: string;
  name: string | undefined;
  hasOtherUserLeft: boolean;
  avatarUrl: string | undefined;
  lastMsg: string | null;
  numberNewMessages: number;
}>();

const drawerOpen = useOpenDrawer();
const cachedChatroomDataObject = useCachedChatroom(props.chatroomId);
const route = useRoute();

async function onChatroomSelect() {
  // Avoid page reload if chatroom is already selected
  if (
    route.name === "chat-id" &&
    (route.params.id as string) === props.chatroomId
  )
    return;

  // When opening the chatroom, reset unread messages to 0 in the local state
  setTimeout(() => {
    if (cachedChatroomDataObject.value && cachedChatroomDataObject.value.number_new_messages !== 0) {
      cachedChatroomDataObject.value = { ...cachedChatroomDataObject.value, number_new_messages: 0 };
    }
  }, 500);
  drawerOpen.value = false;
  navigateTo(`/chat/${props.chatroomId}`);
}
</script>

<style></style>
