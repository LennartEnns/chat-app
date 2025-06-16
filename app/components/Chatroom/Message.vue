<template>
  <USeparator v-if="showNewMessagesMarker" label="New Messages" color="primary" class="w-full my-2" />
  <div
    v-if="showDateMarker"
    ref="dateMarker"
    class="text-muted text-sm border-1 rounded-xl self-center py-1 px-3">
    {{ dateMarkerText }}
  </div>
  <div :class="`max-w-[90%] mt-2.5 flex flex-col items-center gap-2 ${messagePosition}`">
    <div class="flex flex-row gap-1 w-full">
      <UPopover
        v-if="message.is_own && showOwnMsgPopover && !editingMessage"
        v-model:open="popoverOpen"
        mode="hover"
        arrow
        :content="{
          align: 'center',
          side: 'left',
        }"
        :ui="{
          content: 'rounded-xl'
        }"
      >
        <!-- eslint-disable vue/no-v-html -->
         <div
          :class="`whitespace-pre-line wrap-anywhere py-2 px-3 rounded-md w-full ${speechBubbleLook} ${themedMessageColor} ${msgSize}`"
          @touchstart="popoverOpen = true"
          v-html="contentLinkified"
        />
        <!-- eslint-enable -->
        <template #content>
          <div class="p-1 flex flex-row">
            <UButton icon="i-lucide-trash-2" variant="ghost" color="error" @click="emit('delete')" />
            <UButton icon="i-lucide-edit" variant="ghost" color="primary" @click="onEditMessage" />
          </div>
        </template>
      </UPopover>
      <div v-else-if="editingMessage">
        <UTextarea
          id="editArea"
          v-model="newMessage"
          size="xl"
          variant="ghost"
          autofocus
          autoresize
          :ui="{
            trailing: 'pointer-events-none',
          }"
          @vue:mounted="attachEditAreaEventHandler"
          @blur="handleEditAreaBlur"
        >
          <template #trailing>
            <div ref="editMsgButtonArea">
              <UButton
                icon="i-lucide-check"
                variant="ghost"
                :class="{
                  'pointer-events-auto': !disableMessageUpdate,
                }"
                :disabled="disableMessageUpdate"
                @click="onUpdateMessage"
              />
            </div>
          </template>
        </UTextarea>
      </div>
      <div
        v-else
        :class="`whitespace-pre-line wrap-anywhere py-2 px-3 rounded-md w-full ${speechBubbleLook} ${themedMessageColor} ${msgSize}`"
        v-html="contentLinkified"
      />
      <UButton v-if="!message.is_own && showUserInfo && message.username" variant="ghost" class="ml-2 flex flex-row items-center gap-2 h-fit" @click="onAvatarClick">
        <UAvatar class="justify-self-center" size="sm" :src="avatarUrl" />
        <div class="text-muted whitespace-nowrap select-none">{{ message.username }}</div>
      </UButton>
    </div>
    <div v-if="showHmTime" :class="`text-xs text-muted px-2 ${message.is_own ? 'self-end' : 'self-start'}`">{{ displayedTime }}</div>
  </div>
</template>

<script lang="ts" setup>
import type { Message } from "~/types/messages/messageLoading";

const dateMarker = ref<HTMLElement | null>(null);

const props = defineProps<{
  message: Message,
  showUserInfo: boolean,
  showNewMessagesMarker: boolean,
  showDateMarker: boolean,
  showHmTime: boolean,
  showOwnMsgPopover: boolean,
}>();

const emit = defineEmits<{
  delete: [],
  update: [value: string],
}>();

const dateMarkerText = computed(() => getDateUserText(props.message.created_at));

const editMsgButtonArea = ref<HTMLElement | null>(null);
const popoverOpen = ref(false);
const editingMessage = ref(false);
const newMessage = ref("");
const newMessageSanitized = computed(() => newMessage.value.trim());
const messageContentChanged = computed(() => newMessageSanitized.value !== props.message.content);
const disableMessageUpdate = computed(() => newMessageSanitized.value.length === 0 || !messageContentChanged.value);
const avatarUrl = computed(() => props.message.user_id ? getAvatarUrl(props.message.user_id) : undefined);
const contentLinkified = useLinkifiedText(computed(() => props.message.content));

// Make message bigger if it's just a single emoji
const singleEmojiRegex = /^[\p{Extended_Pictographic}\u200D]+$/u;
const msgSize = computed(() => singleEmojiRegex.test(props.message.content) ? 'text-4xl' : '');

const { isLight } = useSSRSafeTheme();
const messagePosition = computed(() => props.message.is_own ? 'user' : 'partner')
const themedMessageColor = computed(() => {
  if (isLight.value) {
    return props.message.is_own ? 'user-light' : 'partner-light';
  }
  return props.message.is_own ? 'user-dark' : 'partner-dark';
});
const speechBubbleLook = computed(() => props.message.is_own ? 'rounded-tl-xs' : 'rounded-tr-xs');
const displayedTime = computed(() => dateToHMTime(props.message.created_at));

watch(() => props.showOwnMsgPopover, (show) => {
  if (!show) {
    popoverOpen.value = false;
  }
})
async function onEditMessage() {
  popoverOpen.value = false;
  newMessage.value = props.message.content;
  editingMessage.value = true;
}
async function onUpdateMessage() {
  editingMessage.value = false;
  emit('update', newMessageSanitized.value);
}
async function onAvatarClick() {
  if (!props.message.username) return;
  navigateTo(`/profile/${props.message.username}`);
}

// Some (more or less) hacky solutions
async function handleEditAreaBlur() {
  requestAnimationFrame(() => {
    const active = document.activeElement;
    if (!editMsgButtonArea.value?.contains(active)) {
      editingMessage.value = false;
    }
  })
}
async function attachEditAreaEventHandler() {
  document
    .getElementById("editArea")
    ?.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.code === "Enter") {
        newMessage.value += '\n';
      } else if (e.code === "Escape") {
        editingMessage.value = false;
      }
    }, {
      once: false,
    });
}
</script>

<style>
@import url('~/assets/css/chat.css');
</style>
