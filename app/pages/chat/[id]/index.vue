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

const chatroom = ref<any>(null);

onMounted(async () => {
  await fetchChatroomDetails();
});

async function fetchChatroomDetails() {
  if (!routeChatroomId.value) return;

  const { data, error } = await supabase
    .from("chatrooms_preview")
    .select("*")
    .eq("id", routeChatroomId.value)
    .single();

  if (error) {
    logPostgrestError(error, "chatroom details fetching");
    operationFeedbackHandler.displayError("Could not load chatroom details");
    return;
  }

  chatroom.value = data;
}

const chatroomDisplayName = computed(() => {
  if (!chatroom.value) return "Loading...";
  if (chatroom.value.type === "direct") {
    return chatroom.value.other_user_name || "Direct Chat";
  } else {
    return chatroom.value.name || "Group Chat";
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

type DisplayedMessage = {
  text: string;
  timestamp: string;
};
const newMessage = ref<string>("");
const userMessages = ref<DisplayedMessage[]>([]);
const messagesContainer = ref<HTMLElement | null>(null);

async function loadFromDatabase() {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chatroom_id", routeChatroomId.value);

  if (error) {
    logPostgrestError(error, "message fetching");
    operationFeedbackHandler.displayError(
      getPostgrestErrorMessage(error, "Unknown message fetching error")
    );
    return;
  }
  userMessages.value = data.map((element) => ({
    text: element.content,
    timestamp: dateToHMTime(new Date(element.created_at)),
  }));
}

async function saveToDatabase(message: string) {
  const { error } = await supabase.from("messages").insert([
    {
      chatroom_id: routeChatroomId.value,
      content: message,
      sender_id: userData.id,
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

async function sendMessage() {
  if (newMessage.value.trim()) {
    const timestamp = dateToHMTime(new Date());
    await saveToDatabase(newMessage.value.trim());
    newMessage.value = "";
    await loadFromDatabase();
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
