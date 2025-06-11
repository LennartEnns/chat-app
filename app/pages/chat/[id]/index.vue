<template>
  <NuxtLayout name="chat">
    <div class="align-column">
      <UCard class="profile-bar" variant="subtle">
        <div class="flex items-center gap-2">
          <UAvatar src="https://github.com/nuxt.png" />
          <h1 class="text-black dark:text-white">Florian Steckchen</h1>
        </div>
      </UCard>
      <div ref="messagesContainer" class="messages">
        <div
          :class="`message partner ${themedPartnerMessageColor}`"
          @contextmenu.prevent="
            handleContextMenu($event, {
              text: 'Partner message content',
              timestamp: '12:48',
            })
          "
        >
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
            <UDropdownMenu
              :items="dropdownItems"
              :ui="{
                content: 'w-48',
              }"
            >
              <UButton
                icon="i-heroicons-ellipsis-horizontal"
                variant="ghost"
                class="message-options-button"
              />
            </UDropdownMenu>
          </div>
        </div>

        <div
          v-for="(message, index) in userMessages"
          :key="index"
          :class="`message user ${themedUserMessageColor} whitespace-pre-line wrap-anywhere`"
          @contextmenu.prevent="handleContextMenu($event, message)"
        >
          <UAvatar class="justify-self-center" :src="userData.avatarUrl" />
          <div class="message-content">
            <p>{{ message.text }}</p>
            <span class="message-time">{{ message.timestamp }}</span>
            <UDropdownMenu
              :items="dropdownItems"
              :ui="{
                content: 'w-48',
              }"
            >
              <UButton
                icon="i-heroicons-ellipsis-horizontal"
                variant="ghost"
                class="message-options-button"
              />
            </UDropdownMenu>
          </div>
        </div>
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
        <UButton :class="`${themedUserMessageColor}`" @click="sendMessage"
          ><Icon name="ic:baseline-send"
        /></UButton>
      </div>
    </div>

    <UContextMenu
      ref="contextMenuRef"
      v-model:show="isContextMenuOpen"
      :items="contextMenuItems"
    />
  </NuxtLayout>
</template>

<script setup lang="ts">
import {
  getPostgrestErrorMessage,
  logPostgrestError,
} from "~~/errors/postgrestErrors";
import type { DropdownMenuItem } from "@nuxt/ui";

useFirstLoginDetector();
const { isLight } = useSSRSafeTheme();
const operationFeedbackHandler = useOperationFeedbackHandler();
const userData = useUserData();
const supabase = useSupabaseClient();

const route = useRoute();
const routeChatroomId = computed(() => {
  const params = route.params;
  return params.id as string;
});

const themedUserMessageColor = computed(() =>
  isLight.value ? "user-light" : "user-dark"
);

const themedPartnerMessageColor = computed(() =>
  isLight.value ? "partner-light" : "partner-dark"
);

const dropdownItems = ref<DropdownMenuItem[]>([
  {
    label: "Delete",
    icon: "i-lucide-trash",
    click: () => {
      console.log("Delete clicked from dropdown!");
    },
  },
  {
    label: "Edit",
    icon: "i-lucide-edit",
    click: () => {
      console.log("Edit clicked from dropdown!");
    },
  },
]);

interface UContextMenuInstance {
  open: (event: MouseEvent) => void;
}

const contextMenuRef = ref<UContextMenuInstance | null>(null);
const isContextMenuOpen = ref(false);
const activeMessage = ref<DisplayedMessage | null>(null);

/**
 * @param event
 * @param message
 */
const handleContextMenu = (
  event: MouseEvent | TouchEvent,
  message: DisplayedMessage
) => {
  activeMessage.value = message;
  console.log("handleContextMenu triggered (contextmenu event)", event);
  if (contextMenuRef.value) {
    contextMenuRef.value.open(event as MouseEvent);
    isContextMenuOpen.value = true;
    console.log("Context menu open call attempted via contextmenu event.");
  } else {
    console.log("contextMenuRef.value is null, cannot open context menu.");
  }
};

const contextMenuItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: "Delete",
      icon: "i-lucide-trash",
      click: () => {
        if (activeMessage.value) {
          console.log(
            "Nachricht löschen (Context Menu):",
            activeMessage.value.text
          );
        }
        isContextMenuOpen.value = false;
      },
    },
    {
      label: "Edit",
      icon: "i-lucide-edit",
      click: () => {
        if (activeMessage.value) {
          console.log(
            "Nachricht bearbeiten (Context Menu):",
            activeMessage.value.text
          );
        }
        isContextMenuOpen.value = false;
      },
    },
  ],
]);

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
      chatroom_id: routeChatroomId.value,
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
