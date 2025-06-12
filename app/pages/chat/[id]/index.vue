<template>
  <NuxtLayout name="chat">
    <div class="align-column">
      <UCard class="profile-bar" variant="subtle">
        <div class="flex items-center gap-2">
          <UAvatar :src="partnerAvatarUrl" icon="i-lucide-user" />
          <h1 class="text-black dark:text-white">{{ chatroomDisplayName }}</h1>
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
            :src="partnerAvatarUrl"
            icon="i-lucide-user"
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

import { useCachedSignedImageUrl } from "~/composables/useCachedSignedImageUrl";

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

const chatroom = ref<any>(null);

onMounted(async () => {
  await fetchChatroomDetails();
  loadFromDatabase();
  scrollToBottom();
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});

async function fetchChatroomDetails() {
  if (!routeChatroomId.value) {
    console.warn(
      "routeChatroomId ist null oder undefined. Chatroom-Details können nicht geladen werden."
    );
    return;
  }

  const { data, error } = await supabase
    .from("chatrooms_preview")
    .select("*")
    .eq("id", routeChatroomId.value)
    .single();

  if (error) {
    logPostgrestError(error, "chatroom details fetching");
    operationFeedbackHandler.displayError(
      "Konnte Chatroom-Details nicht laden."
    );
    return;
  }
  chatroom.value = data;

  console.log("Abgerufene Chatroom-Details:", chatroom.value);
  console.log("  Typ:", chatroom.value?.type);
  console.log("  Name (für Gruppen):", chatroom.value?.name);
  console.log(
    "  Name des anderen Benutzers (für direkte Chats):",
    chatroom.value?.other_user_name
  );
  console.log(
    "  ID des anderen Benutzers (für direkte Chats):",
    chatroom.value?.other_user_id
  );
}

const chatroomDisplayName = computed(() => {
  if (!chatroom.value) return "Wird geladen...";
  if (chatroom.value.type === "direct") {
    return chatroom.value.name || "Direkter Chat";
  } else {
    return chatroom.value.name || "Gruppenchat";
  }
});

const partnerAvatarUrl = computed(() => {
  if (!chatroom.value) return undefined;

  if (chatroom.value.type === "direct") {
    return chatroom.value.other_user_id
      ? getAvatarUrl(chatroom.value.other_user_id)
      : undefined;
  } else {
    return useCachedSignedImageUrl(
      "chatroom_avatars",
      getGroupAvatarPath(chatroom.value.id),
      true
    ).value;
  }
});

const themedUserMessageColor = computed(() =>
  isLight.value ? "user-light" : "user-dark"
);

const themedPartnerMessageColor = computed(() =>
  isLight.value ? "partner-light" : "partner-dark"
);

const dropdownItems = ref<DropdownMenuItem[]>([
  {
    label: "Löschen",
    icon: "i-lucide-trash",
    click: () => {
      console.log("Löschen geklickt vom Dropdown!");
      // Implementiere hier die Löschlogik
    },
  },
  {
    label: "Bearbeiten",
    icon: "i-lucide-edit",
    click: () => {
      console.log("Bearbeiten geklickt vom Dropdown!");
      // Implementiere hier die Bearbeitungslogik
    },
  },
]);

interface UContextMenuInstance {
  open: (event: MouseEvent) => void;
}

const contextMenuRef = ref<UContextMenuInstance | null>(null);
const isContextMenuOpen = ref(false);
const activeMessage = ref<DisplayedMessage | null>(null);
const handleContextMenu = (
  event: MouseEvent | TouchEvent,
  message: DisplayedMessage
) => {
  activeMessage.value = message;
  console.log("Kontextmenü ausgelöst (contextmenu event)", event);
  if (contextMenuRef.value) {
    contextMenuRef.value.open(event as MouseEvent);
    isContextMenuOpen.value = true;
    console.log("Kontextmenü-Öffnungsversuch über contextmenu event.");
  } else {
    console.log(
      "contextMenuRef.value ist null, kann Kontextmenü nicht öffnen."
    );
  }
};

const contextMenuItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: "Löschen",
      icon: "i-lucide-trash",
      click: () => {
        if (activeMessage.value) {
          console.log(
            "Nachricht löschen (Kontextmenü):",
            activeMessage.value.text
          );
          // Implementiere hier die Löschlogik
        }
        isContextMenuOpen.value = false;
      },
    },
    {
      label: "Bearbeiten",
      icon: "i-lucide-edit",
      click: () => {
        if (activeMessage.value) {
          console.log(
            "Nachricht bearbeiten (Kontextmenü):",
            activeMessage.value.text
          );
        }
        isContextMenuOpen.value = false;
      },
    },
  ],
]);

type DisplayedMessage = {
  text: string;
  timestamp: string;
  isOwnMsg: Boolean;
};
const newMessage = ref<string>("");
const userMessages = ref<DisplayedMessage[]>([]);
const messagesContainer = ref<HTMLElement | null>(null);

async function loadFromDatabase() {
  if (!routeChatroomId.value) {
    console.warn(
      "routeChatroomId ist null oder undefined. Nachrichten können nicht geladen werden."
    );
    return;
  }

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chatroom_id", routeChatroomId.value)
    .order("created_at", { ascending: true });
<
  if (data === null) {
    console.log("No messages found for chatroom_id:" + routeChatroomId.value);
    return;
  }

  if (error) {
    logPostgrestError(error, "message fetching");
    operationFeedbackHandler.displayError(
      getPostgrestErrorMessage(
        error,
        "Unbekannter Fehler beim Laden der Nachrichten."
      )
    );
    return;
  }
  userMessages.value = [];
  data.forEach((element) => {
    let isOwnMsg: Boolean = element.user_id === userData.id;

    // If the message is not from the current user, it is a partner message
    userMessages.value.push({
      text: element.content,
      timestamp: dateToHMTime(new Date(element.created_at)),
      isOwnMsg: isOwnMsg,
    });
    return;
  });
}
async function saveToDatabase(message: string) {
  console.log("Versuche Nachricht zu speichern (ursprüngliches Verhalten):");
  console.log("  chatroom_id:", routeChatroomId.value);
  console.log("  content:", message);

  const { error } = await supabase.from("messages").insert([
    {
      chatroom_id: routeChatroomId.value,
      content: message,
    },
  ]);

  if (error) {
    console.log(error);
    logPostgrestError(error, "message insert");
    operationFeedbackHandler.displayError(
      getPostgrestErrorMessage(
        error,
        `Nachricht konnte nicht gesendet werden: ${error.message}`
      )
    );
  }

  return null;
}

async function sendMessage() {
  if (newMessage.value.trim()) {
    const timestamp = dateToHMTime(new Date());

    saveToDatabase(newMessage.value.trim());
    userMessages.value.push({
      text: newMessage.value.trim(),
      timestamp: timestamp,
      isOwnMsg: true,
    });
    newMessage.value = "";
  }
}

async function handleKeyDown(event: KeyboardEvent) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

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
</script>

<style>
@import url("~/assets/css/chat.css");
</style>
