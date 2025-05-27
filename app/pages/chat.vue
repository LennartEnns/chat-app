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
            <p>
              User messages are now saved to the database and loaded on
              page-reload. Start messaging today! User messages are now saved to
              the database and loaded on page-reload. Start messaging today!
            </p>
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
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import type { Database } from "@@/database.types";

const isMobile = useMobileDetector();
useFirstLoginDetector();

const open = ref<boolean>(false); //placeholder for command pallette (search bar)
const users = ref<any[]>([]); //placeholder for command pallette (search bar)
const newMessage = ref<string>("");
const userMessages = ref<any[]>([]);
const messagesContainer = ref<any>(null);

const drawerOpen = useOpenDrawer();
const { isLight } = useSSRSafeTheme();

const supabase = useSupabaseClient<Database>();

const themedUserMessageColor = computed(() =>
  isLight.value ? "user-light" : "user-dark"
);

const themedPartnerMessageColor = computed(() =>
  isLight.value ? "partner-light" : "partner-dark"
);

function sendMessage(): void {
  if (newMessage.value.trim()) {
    saveToDatabase(newMessage.value.trim());
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const timestamp = `${hours}:${minutes}`;

    userMessages.value.push({
      text: newMessage.value.trim(),
      timestamp: timestamp,
    });
    newMessage.value = "";
  }
}

const user_id = "bd988169-4773-44b2-94a9-1819d8052992";

async function saveToDatabase(message: string) {
  const { data, error } = await supabase
    .from("messages")
    .insert([
      {
        user_id: user_id,
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

async function loadFromDatabase() {
  const { data, error } = (await supabase.from("messages").select("*")) as any;

  if (error) {
    console.error("Error loading messages:", error);
    return null;
  }
  data.forEach((element: any) => {
    userMessages.value.push(element["content"]);
  });
  return null;
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
  loadFromDatabase();
  window.addEventListener("keydown", handleKeyDown);
  scrollToBottom();
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});

// place actual user-avatar in message copied from profile page [composable needed] | changed null -> undefinied to fix error

const user = useSupabaseUser();
const avatarUrl = ref<string | undefined>(undefined);

async function checkAvatarExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
}

onMounted(async () => {
  if (user.value) {
    const avatarUrlData = supabase.storage
      .from("avatars")
      .getPublicUrl(`public/${user.value.id}.jpg`);
    const url = avatarUrlData.data.publicUrl;
    if (url && (await checkAvatarExists(url))) {
      avatarUrl.value = url;
    } else {
      avatarUrl.value = undefined;
    }
  } else {
    avatarUrl.value = undefined;
  }
});

watch(user, async (newUser) => {
  if (newUser) {
    const avatarUrlData = supabase.storage
      .from("avatars")
      .getPublicUrl(`public/${newUser.id}.jpg`);
    const url = avatarUrlData.data.publicUrl;
    if (url && (await checkAvatarExists(url))) {
      avatarUrl.value = url;
    } else {
      avatarUrl.value = undefined;
    }
  } else {
    avatarUrl.value = undefined;
  }
});
</script>

<style>
@import url("~/assets/css/chat.css");
</style>
