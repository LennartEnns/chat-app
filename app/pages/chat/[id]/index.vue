<template>
  <NuxtLayout name="chat">
    <!--Messaging column-->
    <div class="align-column">
      <UCard class="profile-bar" variant="subtle">
        <div class="flex items-center gap-2">
          <UAvatar src="https://github.com/nuxt.png" />
          <h1 class="text-black dark:text-white">Florian Steckchen</h1>
        </div>
      </UCard>
      <div ref="messagesContainer" class="messages">
        <div
          v-for="(message, index) in userMessages"
          :key="index"
          :class="`message ${
            message.isOwnMsg
              ? 'user ' + themedUserMessageColor
              : 'partner ' + themedPartnerMessageColor
          }  whitespace-pre-line wrap-anywhere`"
        >
          <UAvatar class="justify-self-center" :src="userData.avatarUrl" />
          <div class="message-content">
            <p>{{ message.text }}</p>
            <span class="message-time">{{ message.timestamp }}</span>
          </div>
        </div>
      </div>
      <!--Text Input for new messages-->
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
        <UButton :class="`${themedUserMessageColor}`" @click="onSendMessage"
          ><Icon name="ic:baseline-send"
        /></UButton>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const newMessage = ref<string>("");
const messagesContainer = ref<HTMLElement | null>(null);
const containerScrollTop = ref(Infinity);

useFirstLoginDetector();
const { isLight } = useSSRSafeTheme();
const userData = useUserData();
const route = useRoute();
const routeChatroomId = computed(() => {
  const params = route.params;
  return params.id as string;
});
const { messages, sendMessage } = useLazyFetchedMessages(routeChatroomId, containerScrollTop);

const themedUserMessageColor = computed(() =>
  isLight.value ? "user-light" : "user-dark"
);

const themedPartnerMessageColor = computed(() =>
  isLight.value ? "partner-light" : "partner-dark"
);

async function updateScrollTop() {
  if (messagesContainer.value) {
    containerScrollTop.value = messagesContainer.value.scrollTop;
  }
}

// Push written message to Chat UI & insert in db
async function onSendMessage() {
  const msgTrimmed = newMessage.value.trim();
  if (!isFalsy(msgTrimmed)) {
    sendMessage(msgTrimmed);
    newMessage.value = "";
  }
}

// Enable using enter for sending a message
async function handleKeyDown(event: KeyboardEvent) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    onSendMessage();
  }
}

// Scroll to the newest message
async function scrollToBottom() {
  await nextTick();
  const component = messagesContainer.value;
  if (component) {
    component.scrollTop = component.scrollHeight;
  }
}

watch(
  messages,
  () => {
    scrollToBottom();
  },
  { deep: true }
);

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
  scrollToBottom();
  if (messagesContainer.value) {
    messagesContainer.value.addEventListener('scroll', updateScrollTop);
  }
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});
</script>

<style>
@import url("~/assets/css/chat.css");
</style>
