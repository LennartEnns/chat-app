<template>
  <USeparator
    v-if="showNewMessagesMarker"
    label="New Messages"
    color="primary"
    class="w-full my-2"
  />
  <div
    v-if="showDateMarker"
    ref="dateMarker"
    class="text-muted text-sm border-1 rounded-xl self-center py-1 px-3"
  >
    {{ dateMarkerText }}
  </div>

  <div :class="`max-w-[90%] mt-2.5 flex flex-col gap-1 ${messagePosition}`">

    <template v-if="message.message_type === 'image'">
      <div class="flex flex-row gap-1 w-full justify-start">
        <UPopover
          v-if="message.is_own && showOwnMsgPopover && !editingMessage"
          v-model:open="popoverOpen"
          mode="hover"
          arrow
          :content="{
            align: 'center',
            side: 'right',
          }"
          :ui="{
            content: 'rounded-xl',
          }"
        >
          <div 
            :class="`flex flex-col gap-2 rounded-sm ${themedMessageColor} ${speechBubbleLook} p-0.5 ml-10`"
            @touchstart.passive="popoverOpen = true"
          >
            <template v-if="imageUrl">
              <!-- Loading placeholder -->
              <div 
                v-if="imageLoading" 
                class="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-32 w-48 flex items-center justify-center"
              >
                <div class="text-gray-400 text-sm">Loading...</div>
              </div>
              <img
                v-else-if="message.media && message.media[0] && message.media[0].url && message.media[0].url && !imageError"
                :src="imageUrl.value"
                :alt="message.content || 'Uploaded image'"
                class="chat-image object-contain cursor-pointer"
                @click="handleImageClick"
                @load="handleImageLoad" 
                @error="handleImageError"
              />
              <!-- Error placeholder -->
              <div 
                v-else-if="imageError" 
                class="bg-red-100 dark:bg-red-900 rounded h-32 w-48 flex items-center justify-center text-red-600 dark:text-red-300"
              >
                <div class="text-center">
                  <div class="text-sm">Failed to load image</div>
                </div>
              </div>
              <p v-if="message.content" class="text-sm">{{ message.content }}</p>
            </template>
          </div>
          <template #content>
            <div class="p-1 flex flex-row">
              <UButton
                icon="i-lucide-trash-2"
                variant="ghost"
                color="error"
                @click="handleDeleteClick"
              />
              <UButton
                icon="i-lucide-edit"
                variant="ghost"
                color="primary"
                @click="onEditMessage"
              />
            </div>
          </template>
        </UPopover>

        <!-- Fallback -->
        <div 
          v-else
          :class="`flex flex-col gap-2 rounded-sm ${themedMessageColor} ${speechBubbleLook} p-0.5 ${message.is_own ? '' : 'ml-10'}`"
        >
          <template v-if="imageUrl">
            <!-- Loading placeholder -->
            <div 
              v-if="imageLoading" 
              class="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-32 w-48 flex items-center justify-center"
            >
              <div class="text-gray-400 text-sm">Loading...</div>
            </div>
            <img
              v-else-if="message.media && message.media[0] && message.media[0].url && message.media[0].url && !imageError"
              :src="imageUrl.value"
              :alt="message.content || 'Uploaded image'"
              class="chat-image object-contain cursor-pointer"
              @click="handleImageClick"
              @load="handleImageLoad" 
              @error="handleImageError"
            />
            <!-- Error placeholder -->
            <div 
              v-else-if="imageError" 
              class="bg-red-100 dark:bg-red-900 rounded h-32 w-48 flex items-center justify-center text-red-600 dark:text-red-300"
            >
              <div class="text-center">
                <div class="text-sm">Failed to load image</div>
              </div>
            </div>
            <p v-if="message.content" class="text-sm">{{ message.content }}</p>
          </template>
        </div>
      </div>
    </template>

    <template v-else-if="message.is_own">
      <div class="flex flex-row gap-1 w-full justify-end">
        <UPopover
          v-if="showOwnMsgPopover && !editingMessage"
          v-model:open="popoverOpen"
          mode="hover"
          arrow
          :content="{
            align: 'center',
            side: 'left',
          }"
          :ui="{
            content: 'rounded-xl',
          }"
        >
          <div
            :class="`whitespace-pre-line wrap-anywhere py-2 px-3 rounded-md w-full ${speechBubbleLook} ${themedMessageColor} ${msgSize}`"
            @touchstart.passive="popoverOpen = true"
            v-html="contentLinkified"
          />
          <template #content>
            <div class="p-1 flex flex-row">
              <UButton
                icon="i-lucide-trash-2"
                variant="ghost"
                color="error"
                @click="handleDeleteClick"
              />
              <UButton
                icon="i-lucide-edit"
                variant="ghost"
                color="primary"
                @click="onEditMessage"
              />
            </div>
          </template>
        </UPopover>
        <div v-else-if="editingMessage" class="flex-grow">
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
          :class="`whitespace-pre-line wrap-anywhere py-2 px-3 rounded-xl w-fit ${speechBubbleLook} ${themedMessageColor} ${msgSize}`"
          v-html="contentLinkified"
        />
      </div>
    </template>

    <template v-else>
      <div class="grid items-start" :style="{ gridTemplateColumns: '40px 1fr' }">
        <div class="flex justify-center">
          <UButton
            v-if="showUserInfo && message.username"
            variant="ghost"
            class="p-0 h-fit"
            @click="onAvatarClick"
          >
            <UAvatar class="justify-self-center" size="sm" :src="avatarUrl" :alt="usernameInitials" />
          </UButton>
        </div>

        <div class="flex flex-col gap-1">
          <div
            v-if="showUserInfo && message.username"
            class="text-muted text-sm whitespace-nowrap select-none "
          >
            {{ message.username }}
          </div>
          <div
            :class="`whitespace-pre-line wrap-anywhere py-2 px-3 rounded-xl w-fit ${speechBubbleLook} ${themedMessageColor} ${msgSize}`"
            v-html="contentLinkified"
          />
        </div>
      </div>
    </template>

    <div
      v-if="showHmTime"
      :class="`text-xs text-muted px-2 ${
        message.is_own ? 'self-end' : 'self-start ml-9'
      }`"
    >
      {{ displayedTime }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Message} from "~/types/messages/messageLoading";
import { useCachedSignedImageUrl } from '~/composables/useCachedSignedImageUrl';

const dateMarker = ref<HTMLElement | null>(null);

const imageError = ref(false);

const props = defineProps<{
  message: Message;
  showUserInfo: boolean;
  showNewMessagesMarker: boolean;
  showDateMarker: boolean;
  showHmTime: boolean;
  showOwnMsgPopover: boolean;
}>();

const emit = defineEmits<{
  deleteMessageAndMedia: [messageId: string, storageFilePath: string | null];
  update: [value: string];
  imageLoaded: [];
  openFullImage: [string];
}>();

const dateMarkerText = computed(() =>
  getDateUserText(props.message.created_at)
);

const editMsgButtonArea = ref<HTMLElement | null>(null);
const popoverOpen = ref(false);
const editingMessage = ref(false);
const newMessage = ref("");
const newMessageSanitized = computed(() => newMessage.value.trim());
const messageContentChanged = computed(
  () => newMessageSanitized.value !== props.message.content
);
const disableMessageUpdate = computed(
  () => newMessageSanitized.value.length === 0 || !messageContentChanged.value
);
const avatarUrl = computed(() =>
  props.message.user_id ? getAvatarUrl(props.message.user_id) : undefined
);
// Used for displaying user's "initials" if they have no avatar image
const usernameInitials = computed(() => props.message.username?.slice(0, 2).split('').join(' '));
const contentLinkified = useLinkifiedText(
  computed(() => props.message.content)
);

const handleDeleteClick = () => {
  const messageId = props.message.id;
  const storageFilePath = props.message.media && props.message.media[0]?.url
                          ? props.message.media[0].url
                          : null;

  emit('deleteMessageAndMedia', messageId!, storageFilePath);

  setTimeout(() => {
    window.location.reload();
  }, 200);
};


// Make message bigger if it's just a single emoji
const singleEmojiRegex = /^[\p{Extended_Pictographic}\u200D]+$/u;
const msgSize = computed(() =>
  singleEmojiRegex.test(props.message.content) ? "text-4xl" : ""
);


// const imageUrl = computed(() => {
//   imageError.value = false;

//   if (props.message.message_type === 'image' && props.message.media && props.message.media.length > 0) {
//     const mediaItem = props.message.media[0];
//     if (mediaItem && mediaItem.url && mediaItem.url) {
//       const filePath = useCachedSignedImageUrl("messages_media", mediaItem?.url, true);
//       console.log(filePath);
//       return filePath;
//     }
//   }
//   return undefined; 
// });


const imageLoading = ref(true);

const imageUrl = computed(() => {
  imageError.value = false;

  if (props.message.message_type === 'image' && props.message.media && props.message.media.length > 0) {
    const mediaItem = props.message.media[0];
    if (mediaItem && mediaItem.url && mediaItem.url) {
      const filePath = useCachedSignedImageUrl("messages_media", mediaItem?.url, true);
      console.log(filePath);
      return filePath;
    }
  }
  return undefined; 
});

// Watch the imageUrl separately to handle loading state
watch(imageUrl, (newImageUrl) => {
  if (newImageUrl?.value) {
    imageLoading.value = false;
  } else if (props.message.message_type === 'image') {
    imageLoading.value = true;
  }
}, { immediate: true, deep: true });

const cachedImageUrl = ref();

watch(() => cachedImageUrl.value?.value, (newUrl) => {
  console.log('URL changed:', newUrl);
  if (newUrl) {
    imageLoading.value = false;
  }
}, { immediate: true });

const handleImageLoad = () => {
  imageLoading.value = false;
  emit('imageLoaded');
};


const handleImageError = () => {
  console.error(`Fehler beim Laden des Bildes für Nachricht ${props.message.id} an Pfad: ${props.message.media?.[0]}`);
  imageError.value = true;
};

const handleImageClick = () => {
  console.log("ChatroomMessage: Image clicked!");
  if (imageUrl.value) {
    console.log("ChatroomMessage: Emitting openFullImage with URL:", imageUrl.value.value);
    emit('openFullImage', imageUrl.value.value!);
  } else {
    console.log("ChatroomMessage: imageUrl.value is undefined, not emitting.");
  }
};

const { isLight } = useSSRSafeTheme();
const messagePosition = computed(() =>
  props.message.is_own ? "user" : "partner"
);
const themedMessageColor = computed(() => {
  if (isLight.value) {
    return props.message.is_own ? "user-light" : "partner-light";
  }
  return props.message.is_own ? "user-dark" : "partner-dark";
});
const speechBubbleLook = computed(() =>
  props.message.is_own ? "rounded-tr-xs" : "rounded-tl-xs"
);
const displayedTime = computed(() => dateToHMTime(props.message.created_at));

watch(() => props.showOwnMsgPopover, (show) => {
  if (!show) {
    popoverOpen.value = false;
  }
}
);
async function onEditMessage() {
  popoverOpen.value = false;
  newMessage.value = props.message.content;
  editingMessage.value = true;
}
async function onUpdateMessage() {
  editingMessage.value = false;
  emit("update", newMessageSanitized.value);
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
  });
}
async function attachEditAreaEventHandler() {
  document.getElementById("editArea")?.addEventListener(
    "keydown",
    (e: KeyboardEvent) => {
      if (e.code === "Enter") {
        newMessage.value += "\n";
      } else if (e.code === "Escape") {
        editingMessage.value = false;
      }
    },
    {
      once: false,
    }
  );
}
</script>

<style>
@import url("~/assets/css/chat.css");
</style>
