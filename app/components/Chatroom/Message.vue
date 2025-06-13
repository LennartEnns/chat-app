<template>
  <div :class="`max-w-[90%] min-w-20 mt-2.5 flex flex-col items-center gap-2 ${messagePosition}`">
    <div class="flex flex-row gap-1 w-full">
      <UPopover
        v-if="isOwnMsg && showOwnMsgPopover && !editingMessage"
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
        <div
          :class="`whitespace-pre-line wrap-anywhere py-2 px-3 rounded-md w-full ${speechBubbleLook} ${themedMessageColor}`"
          @touchstart="popoverOpen = true"
        >
          {{ message.content }}
        </div>

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
        :class="`whitespace-pre-line wrap-anywhere py-2 px-3 rounded-md w-full ${speechBubbleLook} ${themedMessageColor}`"
      >
        {{ message.content }}
      </div>
      <UAvatar v-if="!isOwnMsg" class="justify-self-center" :src="avatarUrl" />
    </div>
    <div v-if="showHmTime" :class="`text-xs text-muted px-2 ${isOwnMsg ? 'self-end' : 'self-start'}`">{{ displayedTime }}</div>
  </div>
</template>

<script lang="ts" setup>
import type { Message } from "~/types/messages/messageLoading";

const props = defineProps<{
  message: Message,
  showHmTime: boolean,
  showOwnMsgPopover: boolean,
}>();

const emit = defineEmits<{
  delete: [],
  update: [value: string],
}>();

const editMsgButtonArea = ref<HTMLElement | null>(null);
const popoverOpen = ref(false);
const editingMessage = ref(false);
const newMessage = ref("");
const newMessageSanitized = computed(() => newMessage.value.trim());
const messageContentChanged = computed(() => newMessageSanitized.value !== props.message.content);
const disableMessageUpdate = computed(() => newMessageSanitized.value.length === 0 || !messageContentChanged.value);

// If not user ID is given, we will assume this is the user's own message
const isOwnMsg = computed(() => !props.message.user_id);
const avatarUrl = computed(() => props.message.user_id ? getAvatarUrl(props.message.user_id) : undefined);

const { isLight } = useSSRSafeTheme();
const messagePosition = computed(() => isOwnMsg.value ? 'user' : 'partner')
const themedMessageColor = computed(() => {
  if (isLight.value) {
    return isOwnMsg.value ? 'user-light' : 'partner-light';
  }
  return isOwnMsg.value ? 'user-dark' : 'partner-dark';
});
const speechBubbleLook = computed(() => isOwnMsg.value ? 'rounded-tl-xs' : 'rounded-tr-xs');
const displayedTime = computed(() => dateToHMTime(props.message.created_at));

async function onEditMessage() {
  popoverOpen.value = false;
  newMessage.value = props.message.content;
  editingMessage.value = true;
}
async function onUpdateMessage() {
  editingMessage.value = false;
  emit('update', newMessageSanitized.value);
}

// Some hacky solutions
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
      }
    }, {
      once: false,
    });
}
</script>

<style>
@import url('~/assets/css/chat.css');
</style>
