<template>
  <NuxtLayout name="chat">
    <div class="align-column px-2">
      <UCard
        variant="subtle"
        :ui="{
          body: 'sm:py-2 py-2 sm:px-3 px-3 flex flex-row',
        }"
      >
        <UButton variant="ghost" class="flex items-center m-0 py-1 px-2" @click="onHeaderClick">
          <UAvatar :src="cachedChatroom?.avatarUrl" icon="i-lucide-user" />
          <ClientOnly>
            <div v-if="cachedChatroom">
              <h1 v-if="!hasOtherUserLeft" class="text-black dark:text-white">
                {{ chatroomPreview.name }}
              </h1>
              <h1 v-else class="text-muted italic">User has left</h1>
            </div>
          </ClientOnly>
        </UButton>
        <div class="grow" />
        <ClientOnly>
          <UButton
            v-if="!hasOtherUserLeft"
            label="Details"
            icon="i-lucide-external-link"
            variant="ghost"
            @click="onHeaderClick"
          />
          <UButton
            :label="hasOtherUserLeft ? 'Delete' : 'Leave'"
            :icon="hasOtherUserLeft ? 'i-lucide-trash-2' : 'i-lucide-log-out'"
            color="error"
            variant="ghost"
            @click="onLeaveChatroom"
          />
        </ClientOnly>
      </UCard>
      <div ref="messagesContainer" class="messages py-2 px-0 md:px-6">
        <!-- Group by Hours-Minute-Time -->
        <ChatroomMessage
          v-for="(message, index) in messages"
          :key="index"
          :message="message"
          :show-user-info="
            !!messages &&
            cachedChatroom?.type !== 'direct' &&
            (index === 0 || messages[index - 1]?.username !== message.username)
          "
          :show-date-marker="
            !!messages &&
            (index === 0 ||
              !areDatesSame(
                'day',
                messages[index - 1]?.created_at,
                message.created_at
              ))
          "
          :show-new-messages-marker="
            !!messages && index === messages.length - numberNewMessagesFrozen
          "
          :show-hm-time="
            !!messages &&
            (index >= messages.length - 1 ||
              !areDatesSame(
                'minute',
                messages[index + 1]?.created_at,
                message.created_at
              ))
          "
          :show-own-msg-popover="!scrolling"
          @delete="onDeleteMessage(message.id, index)"
          @update="onUpdateMessage(message.id, index, $event)"
        />
        <div>
          <UButton
          v-if="!isNearBottom"
          icon="i-lucide-arrow-down"
          :class="`absolute border-1 w-min bottom-28 right-5 md:right-10 rounded-full shadow-lg z-50 ${numberUnseenMessagesAtBottom ? 'animate-bounce' : ''}`"
          :size="isMobile ? 'xl' : 'lg'"
          @click="onScrollToBottomClicked"
        >
          <template #trailing>
            <div v-if="!!numberUnseenMessagesAtBottom" class="mr-1 animate-pulse">{{ numberUnseenMessagesAtBottom }}</div>
          </template>
        </UButton>
        </div>
      </div>
      <div v-if="isViewer !== undefined && !isViewer" class="write">
        <UTextarea
          ref="newMessageArea"
          v-model="newMessage"
          variant="subtle"
          class="w-full glassBG"
          placeholder="Write a message..."
          size="xl"
          autoresize
          :rows="1"
          :maxrows="7"
          :maxlength="messageLimits.content"
          :ui="{
            trailing: 'flex flex-col justify-center',
          }"
          @click="saveCaret"
          @keyup="saveCaret"
        >
          <template #trailing>
            <UPopover
              arrow
              :content="{
                align: 'center',
                side: 'top',
              }"
            >
              <UButton
                icon="i-lucide-smile"
                variant="ghost"
                size="lg"
                class="text-muted"
              />
              <template #content>
                <EmojiPicker
                  :native="true"
                  :theme="isLight ? 'light' : 'dark'"
                  @select="onSelectEmoji"
                />
              </template>
            </UPopover>
          </template>
        </UTextarea>
        <UButton :class="`${themedSendButtonColor}`" @click="onSendMessage">
          <UIcon name="i-lucide-send-horizontal" size="xs" />
        </UButton>
      </div>
      <div
        v-else-if="isViewer"
        class="flex flex-row flex-wrap justify-center items-center gap-x-2 dark:bg-neutral-800 light:bg-neutral-200 rounded-xl"
      >
        <UIcon :name="chatroomRolesVis.viewer.icon" class="text-xl" />
        <div class="text-muted text-xl">You are a Viewer</div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import EmojiPicker from "vue3-emoji-picker";
import "vue3-emoji-picker/css";
import type { EmojiExt } from "vue3-emoji-picker";
import { logPostgrestError } from "~~/errors/postgrestErrors";
import { messageLimits } from "~~/validation/commonLimits";
import chatroomRolesVis from "~/visualization/chatroomRoles";
import { ModalChatroomLeave } from "#components";
import type { CachedChatroomsAvatarUrlMap, CachedChatroomsMap } from "~/types/chatroom";
import type { Message } from "~/types/messages/messageLoading";

const newMessage = ref<string>("");
const messagesContainer = ref<HTMLElement | null>(null);
const isNearBottom = ref(true);
const bottomDetectionThreshold = 175;

const scrolling = ref(false);
const minTimeAfterScrolling = 100;
let scrollingTimeout: NodeJS.Timeout | null = null;

const newMessageArea = ref<{ $el: HTMLElement } | null>(null);
const newMsgSelectionStart = ref(0);
const newMsgSelectionEnd = ref(0);

const isMobile = useMobileDetector();
const { isLight } = useSSRSafeTheme();
const themedSendButtonColor = computed(() =>
  isLight.value ? "user-light" : "user-dark"
);

const overlay = useOverlay();
const leaveModal = overlay.create(ModalChatroomLeave);
const supabase = useSupabaseClient();
const operationFeedbackHandler = useOperationFeedbackHandler();
const lastChatroomState = useState<string | undefined>("lastOpenedChatroomId");
const routeChatroomId = useRouteIdParam() as Ref<string>; // ID will always be given in this route

// Show number of new messages at the bottom on the "scroll to bottom" button if not at the bottom
const numberUnseenMessagesAtBottom = ref(0);

// Save as last opened chatroom in shared state
lastChatroomState.value = routeChatroomId.value;

const isViewer = ref<boolean | undefined>(undefined);

const cachedChatrooms = useState<CachedChatroomsMap | undefined>('chatrooms');
const cachedChatroomsAvatarUrlMap = useState<CachedChatroomsAvatarUrlMap | undefined>('chatroom-avatar-urls');
const cachedChatroom = computed(() => {
  if (cachedChatrooms.value) {
    const cr = cachedChatrooms.value[routeChatroomId.value];
    if (!cr) return undefined;
    return {
      ...cr,
      avatarUrl: cachedChatroomsAvatarUrlMap.value?.[routeChatroomId.value],
    };
  }
  return undefined;
});
watchEffect(() => {
  if (cachedChatroom.value) {
    if (!isViewer.value) scrollToBottom(true);
    isViewer.value = cachedChatroom.value.current_user_role === "viewer";
  };
});

const hasOtherUserLeft = computed(
  () =>
    !!cachedChatroom.value &&
    cachedChatroom.value.type === "direct" &&
    !cachedChatroom.value.other_user_id
);

const notFoundError = {
  statusCode: 404,
  message: "This chatroom does not exist",
  data: {
    headline: "No Yapping Here!",
  },
};
// If the chatroom does not exist, show error page
async function checkExistsChatroom() {
  const { count } = await supabase
    .from("chatrooms")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("id", routeChatroomId.value);
  if (!count) {
    // Remove from chatrooms list and show 404 page
    if (cachedChatrooms.value) {
      cachedChatrooms.value[routeChatroomId.value] = undefined;
    }
    lastChatroomState.value = undefined;
    showError(notFoundError);
  }
}

// Freeze number of messages in time before setting it to 0 for the new messages marker to not disappear
const numberNewMessagesFrozen = ref(
  cachedChatroom.value?.number_new_messages ?? 0
);
async function removeNewMessagesMarker() {
  // Make new messages marker disappear
  numberNewMessagesFrozen.value = 0;
}

const chatroomPreview = computed(() => {
  if (!cachedChatroom.value) return {
    name: 'Chatroom',
  };
  const cpData = cachedChatroom.value;
  return {
    name: cpData.name!,
  };
});

// Indicates whether the realtime connection is not up.
// If it is down, fallback to immediate insert.
// Otherwise, the handler will take care of the insert instead.
const immediateOwnMessageManipulation = ref(false);
const { messages, sendMessage, deleteMessage, updateMessage } =
  useMessagesManager(routeChatroomId.value, messagesContainer, immediateOwnMessageManipulation);
watch(messages, (newMsgs, oldMsgs) => {
  if (newMsgs && !oldMsgs && newMsgs.length > 0) {
    scrollToBottom(true);
  }
});

async function onScrollToBottomClicked() {
  scrollToBottom();
}
async function onNewMessage(msg: Message) {
  if (msg.is_own || isNearBottom.value) {
    scrollToBottom();
  } else {
    numberUnseenMessagesAtBottom.value++;
  }
}
watch(isNearBottom, (isNear) => {
  if (isNear) {
    numberUnseenMessagesAtBottom.value = 0;
  }
});

// Initiate realtime listener, which can modify the reactive messages array.
// Tied to the lifecycle of this page (specific chatroom).
const realtimeStatus = useRealtimeRoomListener(routeChatroomId.value, messages, onNewMessage);
watch(realtimeStatus, (status) => {
  // Status is not resolved or not successful => Switch to immediate manipulation through messages manager
  if (status !== 'SUBSCRIBED') {
    immediateOwnMessageManipulation.value = true;
  }
  // Status is resolved and successful => Switch to realtime manipulation triggered by db events
  else {
    immediateOwnMessageManipulation.value = false;
  }
});

async function onHeaderClick() {
  if (!cachedChatroom.value?.type) return;
  const type = cachedChatroom.value.type;
  if (type === "direct") {
    // Handle direct chatroom redirect
    if (!cachedChatroom.value.other_user_id) return;
    const otherUserId = cachedChatroom.value.other_user_id;

    // Fetch other user name based on other_user_id
    const { data, error } = await supabase
      .from("profiles")
      .select("username")
      .eq("user_id", otherUserId)
      .maybeSingle();
    if (error) {
      logPostgrestError(error, "username fetching");
    }
    if (!data) {
      operationFeedbackHandler.displayError("Could not open user profile");
      return;
    }
    navigateTo(`/profile/${data.username}`);
    return;
  }

  // Handle group chatroom redirect
  navigateTo(`/chat/${routeChatroomId.value}/info`);
}

//////////////////////// <Logic for Emojis /> ////////////////////////
function getNewMsgTextarea(): HTMLTextAreaElement | null {
  return newMessageArea.value?.$el.querySelector("textarea") || null;
}
function saveCaret() {
  const el = getNewMsgTextarea();
  if (!el) return;
  newMsgSelectionStart.value = el.selectionStart;
  newMsgSelectionEnd.value = el.selectionEnd;
}
function insertEmoji(unicode: string) {
  const el = getNewMsgTextarea();
  if (!el) return;

  const before = newMessage.value.slice(0, newMsgSelectionEnd.value);
  const after = newMessage.value.slice(newMsgSelectionEnd.value);
  newMessage.value = before + unicode + after;

  const newCaret = before.length + unicode.length;
  newMsgSelectionStart.value = newCaret;
  newMsgSelectionEnd.value = newCaret;
  nextTick(() => {
    el.focus();
    el.setSelectionRange(newCaret, newCaret);
  });
}
async function onSelectEmoji(emoji: EmojiExt) {
  insertEmoji(emoji.i);
}

//////////////////////// <Message Operations /> ////////////////////////
async function onSendMessage() {
  removeNewMessagesMarker();
  const msgTrimmed = newMessage.value.trim();
  if (!isFalsy(msgTrimmed)) {
    await sendMessage(msgTrimmed);
    newMessage.value = "";
  }
}
async function onDeleteMessage(id: string | null, index: number) {
  if (!id) return;
  removeNewMessagesMarker();
  deleteMessage(id, index);
}
async function onUpdateMessage(
  id: string | null,
  index: number,
  newContent: string
) {
  if (!id) return;
  removeNewMessagesMarker();
  updateMessage(id, index, newContent);
}
async function onLeaveChatroom() {
  const instance = leaveModal.open({
    chatroomId: routeChatroomId.value,
  });
  const success = await instance.result;
  if (!success) return;
  // Clear last opened chatroom as this is invalid now
  lastChatroomState.value = undefined;
  navigateTo("/chat");
}

async function handleKeyDown(event: KeyboardEvent) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    onSendMessage();
  }
}

async function scrollToBottom(instant: boolean = false) {
  await nextTick(() => {
    const container = messagesContainer.value;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: instant ? "instant" : "smooth",
      });
    }
  });
}
async function onContainerScroll() {
  const el = messagesContainer.value;
  if (!el) return;
  isNearBottom.value =
    el.scrollHeight - el.scrollTop - el.clientHeight < bottomDetectionThreshold;
  if (scrollingTimeout) clearTimeout(scrollingTimeout);
  scrolling.value = true;
  scrollingTimeout = setTimeout(() => {
    scrolling.value = false;
  }, minTimeAfterScrolling);
}

watch(messagesContainer, (container) => {
  if (container) {
    container.addEventListener('scroll', onContainerScroll);
  }
}, {
  immediate: true,
});
onMounted(async () => {
  await checkExistsChatroom();
  window.addEventListener("keydown", handleKeyDown);

  // When opening the chatroom, reset unread messages to 0 in the local state
  setTimeout(() => {
    if (cachedChatroom.value && cachedChatroom.value.number_new_messages !== 0) {
      const cachedCrObject = cachedChatrooms.value ? cachedChatrooms.value[routeChatroomId.value] : undefined;
      if (cachedCrObject) cachedCrObject.number_new_messages = 0;
    }
  }, 500);
});

onUnmounted(() => {
  messagesContainer.value?.removeEventListener("scroll", onContainerScroll);
  window.removeEventListener("keydown", handleKeyDown);
});
</script>

<style>
@import url("~/assets/css/chat.css");
</style>
