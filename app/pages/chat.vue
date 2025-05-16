<template>
  <NuxtLayout name="logged-in">
    <UContainer class="main-layout">
      <UContainer class="align-column quick-settings">
        <UButton
          to="/profile"
          class="profile-picture"
          :avatar="{
            src: 'https://avatars.githubusercontent.com/u/182207917?v=4',
          }"
          color="neutral"
          variant="outline"
        />
      </UContainer>
      <UContainer class="align-column">
        <UModal v-model:open="open" class="search-bar">
          <UButton
            label="Search users..."
            color="neutral"
            variant="subtle"
            icon="i-lucide-search"
          />
          <template #content>
            <UCommandPalette
              close
              :groups="[{ id: 'users', items: users }]"
              @update:open="open = $event"
            />
          </template>
        </UModal>
        <UButton
          class="chat"
          :avatar="{
            src: 'https://github.com/nuxt.png',
          }"
          color="primary"
          variant="outline"
          size="xl"
          >Florian Steckchen</UButton
        >
        <UButton
          class="chat"
          :avatar="{
            src: 'https://github.com/nuxt.png',
          }"
          color="primary"
          variant="outline"
          size="xl"
          >Johannes Weigel</UButton
        >
      </UContainer>
      <UContainer class="align-column">
        <UCard class="profile-bar">
          <h1>Florian Steckchen</h1>
        </UCard>
        <UContainer ref="messagesContainer" class="messages">
          <!--example messages-->
          <UTextarea
            :avatar="{
              src: 'https://github.com/nuxt.png',
            }"
            disabled
            class="message partner"
            autoresize
            model-value="Lorem Ipsum is simply dummy an printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
          />
          <UTextarea
            :avatar="{
              src: 'https://github.com/nuxt.png',
            }"
            disabled
            class="message user"
            autoresize
            model-value="Lorem fjdksj kljaskl jdkl jk"
          />
          <!---->
          <UTextarea
            v-for="(message, index) in userMessages"
            :key="index"
            :avatar="{ src: 'https://github.com/nuxt.png' }"
            disabled
            class="message user"
            autoresize
            :model-value="message"
          />
        </UContainer>
        <UContainer class="write">
          <UTextarea
            v-model="newMessage"
            class="full"
            placeholder="Write a message..."
            autoresize
            :rows="4"
            :maxrows="4"
          />
          <UButton @click="sendMessage"><Icon name="ic:baseline-send" /></UButton>
        </UContainer>
      </UContainer>
    </UContainer>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";

const open = ref<boolean>(false); //placeholder for command pallette (search bar)
const users = ref<any[]>([]); //placeholder for command pallette (search bar)
const newMessage = ref<string>("");
const userMessages = ref<string[]>([]);
const messagesContainer = ref<any>(null);

function sendMessage(): void {
  if (newMessage.value.trim()) {
    userMessages.value.push(newMessage.value.trim());
    newMessage.value = "";
  }
}

function handleKeyDown(event: KeyboardEvent): void {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

const scrollToBottom = async (): Promise<void> => {
  await nextTick();
  const component = messagesContainer.value;
  if (component && component.$el) {
    component.$el.scrollTop = component.$el.scrollHeight;
  }
};

watch(
  userMessages,
  () => {
    scrollToBottom();
  },
  { deep: true }
);

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});
</script>

<style>
@import url("~/assets/css/chat.css");
</style>
