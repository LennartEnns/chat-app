<template>
  <NuxtLayout name="chat">
    <div class="align-column">
      <UCard class="profile-bar" variant="subtle">
        <div class="flex items-center gap-2">
          <UAvatar :src="chatroomPreview.avatarUrl" icon="i-lucide-user" />
          <h1 class="text-black dark:text-white">{{ chatroomPreview.name }}</h1>
        </div>
      </UCard>
      <div ref="messagesContainer" class="messages">
        <ChatroomMessage
          v-for="(message, index) in messages"
          :key = "index"
          :message = "message"
        />
      </div>
      <div class="write">
        <UTextarea
          v-model="newMessage"
          variant="subtle"
          class="w-full glassBG"
          placeholder="Write a message..."
          autoresize
          :rows="2"
          :maxrows="7"
        />
        <UButton :class="`${themedSendButtonColor}`" @click="onSendMessage">
          <UIcon name="i-lucide-send-horizontal" size="xs" />
        </UButton>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const newMessage = ref<string>("");
const messagesContainer = ref<HTMLElement | null>(null);

const { isLight } = useSSRSafeTheme();
const themedSendButtonColor = computed(() => isLight.value ? 'user-light' : 'user-dark')

const route = useRoute();
const supabase = useSupabaseClient();
const routeChatroomId = computed(() => {
  const params = route.params;
  return params.id as string;
});
const { messages, sendMessage } = useLazyFetchedMessages(routeChatroomId, messagesContainer);
const lastMessage = computed(() => messages.value.length > 0 ? messages.value[messages.value.length - 1] : null);
watch(lastMessage, (lastMsg) => {
  scrollToBottom();
})

const notFoundError = {
  statusCode: 404,
  message: "This chatroom does not exist",
  data: {
    headline: 'No Yapping Here!',
  },
}
const unknownError = {
  statusCode: 500,
  message: "Unknown error loading your chatroom",
  data: {
    headline: 'Oh no!',
  },
}
const { data: chatroomPreviewData, error: chatroomPreviewError } = useAsyncData(`chatroomPreviewData-${routeChatroomId.value}`, async () => {
  const { data, error } = await supabase.from('chatrooms_preview')
    .select('name, type, other_user_id')
    .eq('id', routeChatroomId.value)
    .maybeSingle();

  if (error) {
    throw createError(error.code === '22P02' ? notFoundError : unknownError);
  }
  else if (!data) throw createError(notFoundError);
  return data;
});
const chatroomPreview = computed(() => {
  if (!chatroomPreviewData.value) return {
    name: 'Chatroom',
    avatarUrl: undefined,
  };
  const cpData = chatroomPreviewData.value;
  return {
    name: cpData.name!,
    avatarUrl: getAbstractChatroomAvatarUrl(cpData.type!, routeChatroomId.value, cpData.other_user_id),
  };
});
watch(chatroomPreviewError, (error) => {
  if (error) {
    showError(error);
  }
}, {
  immediate: true,
});

// Push written message to Chat UI & insert in db
async function onSendMessage() {
  const msgTrimmed = newMessage.value.trim();
  if (!isFalsy(msgTrimmed)) {
    sendMessage(msgTrimmed);
  }
  newMessage.value = '';
}

async function handleKeyDown(event: KeyboardEvent) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    onSendMessage();
  }
}

async function scrollToBottom(instant: boolean = false) {
  await nextTick();
  const container = messagesContainer.value;
  if (container) {
    container.scrollTo({
      top: container.scrollHeight,
      behavior: instant ? 'instant' : 'smooth',
    });
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
  scrollToBottom(true);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});
</script>

<style>
@import url("~/assets/css/chat.css");
</style>
