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
              <template>
                <UAvatar src="https://github.com/benjamincanac.png" />
              </template>
              <template #content>
                <UCommandPalette
                  close
                  v-model:search-term="searchTerm"
                  :groups="groups"
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
              v-model:search-term="searchTerm"
              :groups="groups"
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
          <div class="flex items-center gap-2">
            <UAvatar src="https://github.com/nuxt.png" />
            <h1>Florian Steckchen</h1>
          </div>
        </UCard>
        <div class="messages" ref="messagesContainer">
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
                currently hardcoded chatroom_id to this chatroom's ID. Now you
                can use the database!
              </p>
              <span class="message-time">12:48</span>
            </div>
          </div>
          <div
            v-for="(message, index) in userMessages"
            :key="index"
            :class="`message user ${themedUserMessageColor}`"
          >
            <UAvatar class="justify-self-center" :src="avatarUrl" />
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
import { ref, onMounted, onUnmounted, watch, nextTick} from "vue";
import { useUserSearch } from '~/composables/useUserSearch'
import type { Database } from "@@/database.types";

const { searchTerm, groups } = useUserSearch()

const toast = useToast();
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const profileData = user.value?.user_metadata;
const username = profileData?.username || "";

const isMobile = useMobileDetector();
useFirstLoginDetector();

const open = ref<boolean>(false);
const newMessage = ref<string>("");
const userMessages = ref<any[]>([]);
const messagesContainer = ref<any>(null);

const drawerOpen = useOpenDrawer();
const { isLight } = useSSRSafeTheme();

const themedUserMessageColor = computed(() =>
  isLight.value ? "user-light" : "user-dark"
);

const themedPartnerMessageColor = computed(() =>
  isLight.value ? "partner-light" : "partner-dark"
);

function sendMessage(): void {
  if (newMessage.value.trim()) {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const timestamp = `${hours}:${minutes}`;
    saveToDatabase(newMessage.value.trim());
    userMessages.value.push({
      text: newMessage.value.trim(),
      timestamp: timestamp,
    });
    newMessage.value = "";
  }
}

const supabaseRead = useSupabaseClient<Database>();

const account = useUserData();

async function saveToDatabase(message: string) {
  const { data, error } = await supabaseRead
    .from("messages")
    .insert([
      {
        user_id: account.id,
        chatroom_id: "c1714e5d-2c75-4efa-9f89-3820525bdfa8",
        content: message,
      },
    ])
    .select();

  if (error) {
    console.error("Error inserting message:", error);
    return null;
  }

  return null;
}

const avatarUrl = getAvatarUrl(account.id);

async function loadFromDatabase() {
  const { data, error } = (await supabase.from("messages").select("*")) as any;

  if (error) {
    console.error("Error loading messages:", error);
    return null;
  }
  data.forEach((element: any) => {
    userMessages.value.push({
      text: element["content"],
      timestamp: parseTimeStamp(element["created_at"]),
    });
  });
  console.log(data);
  return null;
}

function parseTimeStamp(timestamp: string) {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const timestampDB = `${hours}:${minutes}`;
  return timestampDB;
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
  if (component) {
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
