<template>
  <NuxtLayout name="chat">
    <div class="align-column">
      <UCard
        variant="subtle"
        :ui="{
          body: 'sm:py-2 py-2 sm:px-3 px-3 flex flex-row',
        }"
      >
        <UButton variant="ghost" class="flex items-center m-0 py-1 px-2" @click="onHeaderClick">
          <UAvatar :src="cachedChatroomDataObject?.avatarUrl" icon="i-lucide-user" />
          <ClientOnly>
            <div v-if="cachedChatroomDataObject">
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
      <div ref="messagesContainer" class="messages py-2 px-4 md:px-6">
        <!-- Group by Hours-Minute-Time -->
        <ChatroomMessage
          v-for="(message, index) in messages"
          :key="index"
          :message="message"
          :show-user-info="
            !!messages &&
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
        <UButton
          v-if="!isAtBottom"
          icon="i-lucide-arrow-down"
          class="absolute w-min bottom-20 right-5 md:right-10 lg:right-20 rounded-full shadow-lg z-50"
          @click="scrollToBottom()"
        />
      </div>
      <div v-if="!isViewer" class="write">
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
        v-else
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

const newMessage = ref<string>("");
const messagesContainer = ref<HTMLElement | null>(null);
const isAtBottom = ref(true);
const bottomDetectionThreshold = 10;

const scrolling = ref(false);
const minTimeAfterScrolling = 100;
let scrollingTimeout: NodeJS.Timeout | null = null;

const newMessageArea = ref<{ $el: HTMLElement } | null>(null);
const newMsgSelectionStart = ref(0);
const newMsgSelectionEnd = ref(0);

const { isLight } = useSSRSafeTheme();
const themedSendButtonColor = computed(() =>
  isLight.value ? "user-light" : "user-dark"
);

const overlay = useOverlay();
const leaveModal = overlay.create(ModalChatroomLeave);
const supabase = useSupabaseClient();
const operationFeedbackHandler = useOperationFeedbackHandler();
const route = useRoute();
const routeChatroomId = computed(() => {
  const params = route.params;
  return params.id as string;
});
const isViewer = ref(false);
const lastChatroomState = useState<string | undefined>("lastOpenedChatroomId");
lastChatroomState.value = routeChatroomId.value;
const cachedChatroomDataObject = useCachedChatroom(routeChatroomId.value);
const hasOtherUserLeft = computed(
  () =>
    !!cachedChatroomDataObject.value &&
    cachedChatroomDataObject.value.type === "direct" &&
    !cachedChatroomDataObject.value.other_user_id
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
  if (!count) showError(notFoundError);
}
await checkExistsChatroom();

// Freeze number of messages in time before setting it to 0 for the new messages marker to not disappear
const numberNewMessagesFrozen = ref(
  cachedChatroomDataObject.value?.number_new_messages ?? 0
);
async function removeNewMessagesMarker() {
  // Make new messages marker disappear
  numberNewMessagesFrozen.value = 0;
}

const chatroomPreview = computed(() => {
  if (!cachedChatroomDataObject.value) return {
    name: 'Chatroom',
  };
  const cpData = cachedChatroomDataObject.value;
  return {
    name: cpData.name!,
  };
});

const { messages, sendMessage, deleteMessage, updateMessage } =
  useLazyFetchedMessages(routeChatroomId.value, messagesContainer);
watch(messages, (newMsgs, oldMsgs) => {
  if (newMsgs && !oldMsgs && newMsgs.length > 0) {
    scrollToBottom(true);
  }
});

async function onHeaderClick() {
  if (!cachedChatroomDataObject.value?.type) return;
  const type = cachedChatroomDataObject.value.type;
  if (type === "direct") {
    // Handle direct chatroom redirect
    if (!cachedChatroomDataObject.value.other_user_id) return;
    const otherUserId = cachedChatroomDataObject.value.other_user_id;

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
    scrollToBottom();
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
  isAtBottom.value =
    el.scrollHeight - el.scrollTop - el.clientHeight < bottomDetectionThreshold;
  if (scrollingTimeout) clearTimeout(scrollingTimeout);
  scrolling.value = true;
  scrollingTimeout = setTimeout(() => {
    scrolling.value = false;
  }, minTimeAfterScrolling);
}

const testChannel = supabase
  .channel('messages-insert')
  .on('postgres_changes',
    {
      event: '*',
      schema: 'public,',
      table: 'messages',
    },
    (payload) => console.log(payload)
  )
  .subscribe();

onMounted(() => {
  isViewer.value =
    cachedChatroomDataObject.value?.current_user_role === "viewer";
  messagesContainer.value?.addEventListener("scroll", onContainerScroll);
  window.addEventListener("keydown", handleKeyDown);
  scrollToBottom(true);
});

onUnmounted(() => {
  messagesContainer.value?.removeEventListener("scroll", onContainerScroll);
  window.removeEventListener("keydown", handleKeyDown);
  testChannel.unsubscribe();
});
</script>

<style>
@import url("~/assets/css/chat.css");
</style>
