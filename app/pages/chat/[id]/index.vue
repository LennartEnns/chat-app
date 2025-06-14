<template>
  <NuxtLayout name="chat">
    <div class="align-column">
      <UCard
        class="profile-bar"
        variant="subtle"
        :ui="{
          body: 'sm:py-2 py-2 sm:px-3 px-3',
        }">
        <UButton variant="ghost" class="flex items-center gap-2 m-0 p-1" @click="onHeaderClick">
          <UAvatar :src="chatroomPreview.avatarUrl" icon="i-lucide-user" />
          <h1 class="text-black dark:text-white">{{ chatroomPreview.name }}</h1>
        </UButton>
      </UCard>
      <div ref="messagesContainer" class="messages py-2 px-2 md:px-4">
        <!-- Group by Hours-Minute-Time -->
        <ChatroomMessage
          v-for="(message, index) in messages"
          :key = "index"
          :message = "message"
          :show-hm-time="!!messages && (index === (messages.length - 1) || messages[index + 1]?.created_at.getMinutes() !== message.created_at.getMinutes())"
          :show-own-msg-popover="!scrolling"
          @delete="onDeleteMessage(message.id, index)"
          @update="onUpdateMessage(message.id, index, $event)"
        />
        <UButton
          v-if="!isAtBottom"
          icon="i-lucide-arrow-down"
          class="absolute w-min bottom-28 right-5 md:right-10 lg:right-20 rounded-full shadow-lg z-50"
          @click="scrollToBottom()" />
      </div>
      <div class="write">
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
          :ui="{
            trailing: 'flex flex-col justify-center'
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
              <UButton icon="i-lucide-smile" variant="ghost" size="lg" class="text-muted" />
              <template #content>
                <EmojiPicker :native="true" :theme="isLight ? 'light' : 'dark'" @select="onSelectEmoji" />
              </template>
            </UPopover>
          </template>
        </UTextarea>
        <UButton :class="`${themedSendButtonColor}`" @click="onSendMessage">
          <UIcon name="i-lucide-send-horizontal" size="xs" />
        </UButton>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import EmojiPicker from 'vue3-emoji-picker';
import 'vue3-emoji-picker/css'
import type { EmojiExt } from 'vue3-emoji-picker';
import { logPostgrestError } from '~~/errors/postgrestErrors';

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
const themedSendButtonColor = computed(() => isLight.value ? 'user-light' : 'user-dark')

const supabase = useSupabaseClient();
const operationFeedbackHandler = useOperationFeedbackHandler();
const route = useRoute();
const routeChatroomId = computed(() => {
  const params = route.params;
  return params.id as string;
});
const lastChatroomState = useState<string | undefined>('lastOpenedChatroomId');
lastChatroomState.value = routeChatroomId.value;

const notFoundError = {
  statusCode: 404,
  message: "This chatroom does not exist",
  data: {
    headline: 'No Yapping Here!',
  },
}
const unknownError = {
  statusCode: 500,
  message: "Unknown error loading your chatroom",
  data: {
    headline: 'Oh no!',
  },
}
const { data: chatroomPreviewData, error: chatroomPreviewError } = useAsyncData(`chatroomPreviewData-${routeChatroomId.value}`, async () => {
  const { data, error } = await supabase.from('chatrooms_preview')
    .select('name, type, other_user_id')
    .eq('id', routeChatroomId.value)
    .maybeSingle();

  if (error) {
    throw createError(error.code === '22P02' ? notFoundError : unknownError);
  }
  else if (!data) throw createError(notFoundError);
  return data;
});
const chatroomPreview = computed(() => {
  if (!chatroomPreviewData.value) return {
    name: 'Chatroom',
    avatarUrl: undefined,
  };
  const cpData = chatroomPreviewData.value;
  return {
    name: cpData.name!,
    avatarUrl: getAbstractChatroomAvatarUrl(cpData.type!, routeChatroomId.value, cpData.other_user_id),
  };
});
watch(chatroomPreviewError, (error) => {
  if (error) {
    showError(error);
  }
}, {
  immediate: true,
});

const { messages, sendMessage, deleteMessage, updateMessage } = useLazyFetchedMessages(routeChatroomId.value, messagesContainer);
watch(messages, (_, old) => {
  if (!old) {
    scrollToBottom(true);
  }
});

async function onHeaderClick() {
  if (!chatroomPreviewData.value?.type) return;
  const type = chatroomPreviewData.value.type;
  if (type === 'direct') {
    // Handle direct chatroom redirect
    if (!chatroomPreviewData.value.other_user_id) return;
    const otherUserId = chatroomPreviewData.value.other_user_id;

    // Fetch other user name based on other_user_id
    const { data, error } = await supabase.from('profiles')
      .select('username')
      .eq('user_id', otherUserId)
      .maybeSingle();
    if (error) {
      logPostgrestError(error, 'username fetching');
    }
    if (!data) {
      operationFeedbackHandler.displayError('Could not open user profile');
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
  return newMessageArea.value?.$el.querySelector('textarea') || null;
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

  const newCaret = before.length + unicode.length
  newMsgSelectionStart.value = newCaret;
  newMsgSelectionEnd.value = newCaret;
  nextTick(() => {
    el.focus();
    el.setSelectionRange(newCaret, newCaret);
  })
}
async function onSelectEmoji(emoji: EmojiExt) {
  insertEmoji(emoji.i);
}

//////////////////////// <Message Operations /> ////////////////////////
async function onSendMessage() {
  const msgTrimmed = newMessage.value.trim();
  if (!isFalsy(msgTrimmed)) {
    await sendMessage(msgTrimmed);
    newMessage.value = '';
    scrollToBottom();
  }
}
async function onDeleteMessage(id: string | null, index: number) {
  if (!id) return;
  deleteMessage(id, index);
}
async function onUpdateMessage(id: string | null, index: number, newContent: string) {
  if (!id) return;
  updateMessage(id, index, newContent);
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
        behavior: instant ? 'instant' : 'smooth',
      });
    }
  });
}
async function onContainerScroll() {
  const el = messagesContainer.value;
  if (!el) return;
  isAtBottom.value = (el.scrollHeight - el.scrollTop - el.clientHeight) < bottomDetectionThreshold;
  if (scrollingTimeout) clearTimeout(scrollingTimeout);
  scrolling.value = true;
  scrollingTimeout = setTimeout(() => {
    scrolling.value = false;
  }, minTimeAfterScrolling);
}

onMounted(() => {
  messagesContainer.value?.addEventListener('scroll', onContainerScroll);
  window.addEventListener("keydown", handleKeyDown);
  scrollToBottom(true);
});

onUnmounted(() => {
  messagesContainer.value?.removeEventListener('scroll', onContainerScroll);
  window.removeEventListener("keydown", handleKeyDown);
});
</script>

<style>
@import url("~/assets/css/chat.css");
</style>
