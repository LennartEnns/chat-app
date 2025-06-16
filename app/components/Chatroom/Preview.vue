<template>
  <UButton variant="ghost" class="w-full p-1" @click="onChatroomSelect()">
    <div class="flex items-center max-w-full w-full">
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
      <UChip
        v-if="numberNewMessages > 0"
        :text="numberNewMessages"
        size="3xl"
        class="self-start mt-2 mr-2 light:text-error-500 dark:text-error-500"
        :ui="{
          base: 'px-1'
        }"
      />
    </div>
  </UButton>
</template>

<script lang="ts" setup>
const props = defineProps<{
  chatroomId: string,
  name: string,
  avatarUrl: string | undefined,
  lastMsg: string | null,
  numberNewMessages: number,
}>();

const drawerOpen = useOpenDrawer();
const cachedChatroomDataObject = useCachedChatroom(props.chatroomId);

async function onChatroomSelect() {
  // When opening the chatroom, reset unread messages to 0 in the local state
  setTimeout(() => {
    if (cachedChatroomDataObject.value) {
      console.log("Reset")
      cachedChatroomDataObject.value = { ...cachedChatroomDataObject.value, number_new_messages: 0 };
    }
  }, 1000);
  drawerOpen.value = false;
  navigateTo(`/chat/${props.chatroomId}`);
}
</script>

<style></style>
