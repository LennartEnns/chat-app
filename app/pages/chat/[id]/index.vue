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
            trailing: 'flex justify-center items-center'
          }"
          @click="saveCaret"
          @keyup="saveCaret"
        >
          <template #trailing>
              <div>
                <input
                  ref="imageInput"
                  type="file"
                  accept="image/*"
                  @change="handleImageSelect"
                  class="hidden"
                />
                
                <input
                  ref="audioInput"
                  type="file"
                  accept="audio/*"
                  @change="handleAudioSelect"
                  class="hidden"
                />

                <!-- Popover with Media Buttons -->
                <UPopover
                  arrow
                  :content="{
                    align: 'center',
                    side: 'top'
                  }"
                >
                  <UButton icon="i-lucide-paperclip" variant="ghost" class="text-muted"/>
                  <template #content>
                    <div class="flex gap-4 p-3">
                      <!-- Image Button -->
                      <div class="flex flex-col items-center gap-1">
                        <UButton 
                          icon="i-lucide-image" 
                          variant="ghost" 
                          class="text-muted"
                          @click="openImageUpload"
                          :disabled="uploading"
                        />
                        <span class="text-xs text-muted-foreground">Bild</span>
                      </div>
                      
                      <!-- Audio Button -->
                      <div class="flex flex-col items-center gap-1">
                        <UButton 
                          icon="i-lucide-headphones" 
                          variant="ghost" 
                          class="text-muted"
                          @click="openAudioUpload"
                          :disabled="uploading"
                        />
                        <span class="text-xs text-muted-foreground">Audio</span>
                      </div>
                    </div>
                  </template>
                </UPopover>
              </div>
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
      <!-- UModal for Image Preview -->
      <UModal v-model:open="showImagePreview" v-if="selectedImage" class="z-[1000]">
        <template #content>
          <div class="p-6">
        <h3 class="text-lg font-semibold mb-4">Bild senden</h3>
        
        <!-- Image Preview -->
        <div class="mb-4">
          <img 
            :src="imagePreviewUrl" 
            :alt="selectedImage.name"
            class="max-w-full max-h-64 object-contain rounded-lg mx-auto"
          />
        </div>
        
        <!-- Caption Input -->
        <UTextarea
          v-model="imageCaption"
          placeholder="Bildunterschrift hinzufügen..."
          class="mb-4"
          :rows="2"
        />
        
        <!-- Actions -->
        <div class="flex justify-end gap-2">
          <UButton 
            variant="ghost" 
            @click="cancelImageSelection"
          >
            Abbrechen
          </UButton>
          <UButton 
            @click="sendImage"
            :loading="uploading"
          >
            Senden
          </UButton>
        </div>
      </div>
        </template>
      </UModal>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import EmojiPicker from 'vue3-emoji-picker';
import 'vue3-emoji-picker/css'
import type { EmojiExt } from 'vue3-emoji-picker';
import { logPostgrestError } from '~~/errors/postgrestErrors';
import type { Message } from '~/types/messages/messageLoading';

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
const user = useSupabaseUser();
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

//////////////////////// <Logic for Multimedia /> ////////////////////////

  const imageInput = ref<HTMLInputElement>()
  const audioInput = ref<HTMLInputElement>()
  const isPopoverOpen = ref(false)

  const selectedImage = ref<File | null>(null)
  const imagePreviewUrl = ref('')
  const imageCaption = ref('')
  const showImagePreview = ref(false)

  const selectedAudio = ref<File | null>(null)

  const uploading = ref(false)
  const openImageUpload = () => {
    isPopoverOpen.value = false
    imageInput.value?.click()
  }

  const handleImageSelect = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return
      }
      
      if (!file.type.startsWith('image/')) {
        return
      }
      
      selectedImage.value = file
      imagePreviewUrl.value = URL.createObjectURL(file)
      showImagePreview.value = true
    }
  }

  const sendImage = async () => {
    if (!selectedImage.value || !user.value) {return}
    
    uploading.value = true
    try {
      const mediaId = crypto.randomUUID()
      const fileExtension = '.jpg'
      const filePath = `${user.value.id}/image/${mediaId}${fileExtension}`
      
      const fileToUpload = await convertImageToJpg(selectedImage.value)
      
      const { error: uploadError } = await supabase
        .storage
        .from("messages_media")
        .upload(filePath, fileToUpload, {
          cacheControl: '3600',
          upsert: false
        })
      
      if (uploadError) throw uploadError

      const newId = crypto.randomUUID();
      
      //Einen Message Eintrag erstellen -> Problem hier
      const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        id: newId,
        chatroom_id: routeChatroomId.value,
        message_type: 'image',
        content: imageCaption.value || ''
      }).select().single()
      
        if (messageError) {
          logPostgrestError(messageError, "message insert");
          operationFeedbackHandler.displayError('Could not send the message');
          return;
        }
      
        console.log("helloooooo")
      
        const { error: mediaError } = await supabase
          .from('messages_to_media')
          .insert({
            message_id: message.id,
            media_id: mediaId,
            type: 'image'
          })
      
      if (mediaError) throw mediaError

      const newMessage: Message = {
        id: message.id,
        content: imageCaption.value || '',
        created_at: new Date(message.created_at),
        is_own: true,
        message_type: message.message_type,
        user_id: user.value.id,
        username: null,
        media: [{
          id: mediaId,
          type: 'image' as const,
          url: useCachedSignedImageUrl("messages_media", filePath, true),
        }]
      };
    
      if (messages.value) {
        messages.value.push(newMessage);
      }
      await nextTick(() => {
        scrollToBottom();
      });

      cancelImageSelection()
    } catch (error) {
      console.error('Error sending image:', error)
    } finally {
      uploading.value = false
    }
  }

  const cancelImageSelection = () => {
    selectedImage.value = null
    imageCaption.value = ''
    showImagePreview.value = false
    
    if (imagePreviewUrl.value) {
      URL.revokeObjectURL(imagePreviewUrl.value)
      imagePreviewUrl.value = ''
    }
    
    if (imageInput.value) {
      imageInput.value.value = ''
    }
  }

  // Audio Upload
  const openAudioUpload = () => {
    isPopoverOpen.value = false
    audioInput.value?.click()
  }

  const handleAudioSelect = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return
      }
      
      if (!file.type.startsWith('audio/')) {
        return
      }
      
      selectedAudio.value = file
      await sendAudio()
    }
  }

  const sendAudio = async () => {
    if (!selectedAudio.value || !user.value) return
    
    uploading.value = true
    
    try {
      const mediaId = crypto.randomUUID()
      const fileExtension = '.mp3'
      const filePath = `${user.value.id}/audio/${mediaId}${fileExtension}`
      
      const { error: uploadError } = await supabase.storage
        .from('messages_media')
        .upload(filePath, selectedAudio.value, {
          cacheControl: '3600',
          upsert: false
        })
      
      if (uploadError) throw uploadError
      
      // Erstelle Message-Eintrag
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert({
          chatroom_id: routeChatroomId.value,
          user_id: user.value.id,
          content: ''
        })
        .select()
        .single()
      
      if (messageError) throw messageError
      
      // Erstelle messages_to_media Eintrag
      const { error } = await supabase
        .from('messages_to_media')
        .insert({
          message_id: message.id,
          media_id: mediaId,
          type: 'audio'
        })
      
      if (error) throw error
      
      selectedAudio.value = null
      
      if (audioInput.value) {
        audioInput.value.value = ''
      }
    } catch (error) {
      console.error('Error sending audio:', error)
    } finally {
      uploading.value = false
    }
  }

  // Helper function to convert images to JPG
  const convertImageToJpg = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)
        
        canvas.toBlob((blob) => {
          if (blob) {
            const jpgFile = new File([blob], 'image.jpg', { type: 'image/jpeg' })
            resolve(jpgFile)
          }
        }, 'image/jpeg', 0.8)
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  const deleteMedia = async (filePath: string) => {
    if (!user.value) return false;

    try {
      const { error } = await supabase.storage
        .from("messages_media")
        .remove([filePath]);

      return !error;
    } catch (error) {
      console.error("Error deleting media:", error);
      return false;
    }
  };

  onUnmounted(() => {
    if (imagePreviewUrl.value) {
      URL.revokeObjectURL(imagePreviewUrl.value)
    }
  })


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
