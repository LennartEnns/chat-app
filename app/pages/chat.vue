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
        <!--example messages-->
        <div :class="`message partner ${themedPartnerMessageColor}`">
          <UAvatar
            class="justify-self-center"
            src="https://github.com/nuxt.png"
          />
          <div class="message-content">
            <p>
              User messages are now saved to the database and loaded on
              page-reload. Start messaging today! **Note** If you want to test
              this create a local chatroom and add your logged in user's ID to
              it all via http://localhost:54323/. Afterwards change the
              currently hardcoded chatroom_id to this chatroom's ID. Now you can
              use the database!
            </p>
            <span class="message-time">12:48</span>
          </div>
        </div>
        <div
          v-for="(message, index) in userMessages"
          :key="index"
          :class="`message user ${themedUserMessageColor} whitespace-pre-line break-all`"
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
          :rows="4"
          :maxrows="4"
        />
        <UButton :class="`${themedUserMessageColor}`" @click="sendMessage"
          ><Icon name="ic:baseline-send"
        /></UButton>
      </div>
    </div>
  </NuxtLayout>
</template>
 
<script setup lang="ts">
import {
  getPostgrestErrorMessage,
  logPostgrestError,
} from "~~/errors/postgrestErrors";
 
useFirstLoginDetector();
const { isLight } = useSSRSafeTheme();
const operationFeedbackHandler = useOperationFeedbackHandler();
const userData = useUserData();
const supabase = useSupabaseClient();
 
const themedUserMessageColor = computed(() =>
  isLight.value ? "user-light" : "user-dark"
);
 
const themedPartnerMessageColor = computed(() =>
  isLight.value ? "partner-light" : "partner-dark"
);
 
// messages and writing
type DisplayedMessage = {
  text: string;
  timestamp: string;
};
const newMessage = ref<string>("");
const userMessages = ref<DisplayedMessage[]>([]);
const messagesContainer = ref<HTMLElement | null>(null);
 
// Load messages from database and push to chat UI
async function loadFromDatabase() {
  const { data, error } = await supabase.from("messages").select("*");
 
  if (error) {
    logPostgrestError(error, "message fetching");
    operationFeedbackHandler.displayError(
      getPostgrestErrorMessage(error, "Unknown message fetching error")
    );
    return;
  }
  data.forEach((element) => {
    userMessages.value.push({
      text: element.content,
      timestamp: dateToHMTime(new Date(element.created_at)),
    });
  });
}
 
// Save messages to database
async function saveToDatabase(message: string) {
  const { error } = await supabase.from("messages").insert([
    {
      chatroom_id: "c1714e5d-2c75-4efa-9f89-3820525bdfa8", // currently still hardcoded
      content: message,
    },
  ]);
 
  if (error) {
    logPostgrestError(error, "message insert");
    operationFeedbackHandler.displayError(
      getPostgrestErrorMessage(error, "Unknown message upload error")
    );
  }
 
  return null;
}
 
// Push written message to chat UI & database
async function sendMessage() {
  if (newMessage.value.trim()) {
    const timestamp = dateToHMTime(new Date());
    saveToDatabase(newMessage.value.trim());
    userMessages.value.push({
      text: newMessage.value.trim(),
      timestamp: timestamp,
    });
    newMessage.value = "";
  }
}
 
// Enable using enter for sending a message
async function handleKeyDown(event: KeyboardEvent) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
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
  userMessages,
  () => {
    scrollToBottom();
  },
  { deep: true }
);
 
// on reload
onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
  loadFromDatabase();
  scrollToBottom();
});
 
onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});
</script>
 
<style>
@import url("~/assets/css/chat.css");
</style>