<template>
  <div :class="`max-w-[90%] min-w-20 mt-2.5 flex flex-col items-center gap-2 ${messagePosition}`">
    <div class="flex flex-row gap-1 w-full">
      <UPopover
        v-if="isOwnMsg && showOwnMsgPopover"
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
        >
          {{ message.content }}
        </div>

        <template #content>
          <div class="p-1 flex flex-col md:flex-row">
            <UTooltip text="Delete Message" arrow>
              <UButton icon="i-lucide-trash-2" variant="ghost" color="error" @click="emit('delete')" />
            </UTooltip>
            <UTooltip text="Edit Message" arrow>
              <UButton icon="i-lucide-edit" variant="ghost" color="primary" />
            </UTooltip>
          </div>
        </template>
      </UPopover>
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
}>();

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
</script>

<style>
@import url('~/assets/css/chat.css');
</style>
