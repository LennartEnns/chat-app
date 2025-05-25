<template>
  <NuxtLayout name="logged-in">
    <div class="main-layout grow">
      <!--Mobile UI drawer for choosing chats-->
      <UDrawer v-model:open="drawerOpen" direction="bottom" v-if="isMobile">
        <template #body>
          <div class="align-column">
            <UModal v-model:open="open" class="mb-[10px]">
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
          </div>
        </template>
      </UDrawer>
      <!--Desktop column for choosing chats-->
      <div class="align-column" v-if="!isMobile">
        <UModal v-model:open="open" class="mb-[10px]">
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
      </div>
      <!--Messaging column-->
      <div class="align-column">
        <UCard class="profile-bar">
          <h1>Florian Steckchen</h1>
        </UCard>
        <div class="messages" ref="messagesContainer">
          <!--example messages-->
          <div :class="`message partner ${themedPartnerMessageColor}`">
            <UAvatar
              class="justify-self-center"
              src="https://github.com/nuxt.png"
            />
            <p>
              Ipsum is simply dummy an printer took a galley of type and
              scrambled it to make a type specimen book. It has survived not
              only five centuries, but also the leap into electronic
              typesetting, remaining essentially unchanged. It was popularised
              in the 1960s with the release of Letraset sheets containing Lorem
              Ipsum passages, and more recently wit fkjsdaklfjklasd jfkjsadkl
              jfkljsadklfj föajsklfjkladsjfkl
            </p>
          </div>
          <div :class="`message user ${themedUserMessageColor}`">
            <UAvatar
              class="justify-self-center"
              src="https://github.com/nuxt.png"
            />
            <p>
              Ipsum is simply dummy an printer took a galley of type and
              scrambled it to make a type specimen book. It has survived not
              only five centuries, but also the leap into electronic
              typesetting, remaining essentially unchanged. It was popularised
              in the 1960s with the release of Letraset sheets containing Lorem
              Ipsum passages, and more recently wit fkjsdaklfjklasd jfkjsadkl
              jfkljsadklfj föajsklfjkladsjfkl
            </p>
          </div>
          <div
            v-for="(message, index) in userMessages"
            :key="index"
            :class="`message user ${themedUserMessageColor}`"
          >
            <UAvatar
              class="justify-self-center"
              src="https://github.com/nuxt.png"
            />
            <p>{{ message }}</p>
          </div>
        </div>
        <!--Text Input for new messages-->
        <div class="write">
          <UTextarea
            v-model="newMessage"
            class="w-full"
            placeholder="Write a message..."
            autoresize
            :rows="4"
            :maxrows="4"
          />
          <UButton @click="sendMessage" :class="`${themedUserMessageColor}`"
            ><Icon name="ic:baseline-send"
          /></UButton>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";

const isMobile = useMobileDetector();
const open = ref<boolean>(false); //placeholder for command pallette (search bar)
const users = ref<any[]>([]); //placeholder for command pallette (search bar)
const newMessage = ref<string>("");
const userMessages = ref<string[]>([]);
const messagesContainer = ref<any>(null);

const drawerOpen = useOpenDrawer();
const isLight = useSSRSafeTheme();

const themedUserMessageColor = computed(() =>
  isLight.value ? "user-light" : "user-dark"
);

const themedPartnerMessageColor = computed(() =>
  isLight.value ? "partner-light" : "partner-dark"
);

function sendMessage(): void {
  if (newMessage.value.trim()) {
    saveToDatabase(newMessage.value.trim());
    userMessages.value.push(newMessage.value.trim());
    newMessage.value = "";
  }
}

import type { Database } from "../../database.types";

async function saveToDatabase(message: string) {
  const supabase = useSupabaseClient<Database>();

  const { data, error } = await supabase
    .from("messages")
    .insert([
      {
        user_id: "bd988169-4773-44b2-94a9-1819d8052992",
        chatroom_id: "c1714e5d-2c75-4efa-9f89-3820525bdfa8",
        content: message,
      } as any,
    ])
    .select();

  if (error) {
    console.error("Error inserting message:", error);
    return null;
  }

  return data ? data[0] : null;
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
  if (component && component) {
    component.scrollTop = component.scrollHeight;
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
