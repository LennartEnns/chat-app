<template>
    <div class="space-y-4">
      <cropper
        :src="imageUrl"
        :canvas="{
          minWidth: 0,
          minHeight: 0,
          maxWidth: 600,
          maxHeight: 600,
        }"
        :stencil-component="CircleStencil"
        :auto-zoom="true"
        @change="onCrop"
      />
      <div class="flex justify-center">
        <UButton variant="ghost" @click="uploadCroppedImage">
          Upload Avatar
        </UButton>  
      </div>
    </div>
</template>

<script setup lang="ts">
import { CircleStencil, Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';
import { getStorageErrorMessage, logStorageError } from '~~/errors/storageErrors';

defineProps<{
  imageUrl: string,
}>();
const emit = defineEmits<{
  upload: [],
}>();

const supabase = useSupabaseClient();
const userData = useUserData();
const operationFeedbackHandler = useOperationFeedbackHandler();

const croppedCanvas = ref<HTMLCanvasElement | null>(null);

function onCrop({ canvas }: { canvas: HTMLCanvasElement }) {
  croppedCanvas.value = canvas;
}

async function uploadCroppedImage() {
  if (!croppedCanvas.value) return

  // Convert canvas to Blob
  croppedCanvas.value.toBlob(async (blob) => {
    if (!blob) {
      console.log('Avatar upload error: No BLOB returned from canvas');
      return;
    }
    const { error } = await supabase.storage
      .from('avatars')
      .upload(userData.avatarPath, blob, {
        upsert: true,
        contentType: 'image/jpeg',
        cacheControl: 'no-cache',
      });
    emit('upload');
    if (error) {
      logStorageError(error, 'avatar upload');
      operationFeedbackHandler.displayError(getStorageErrorMessage(error, 'Unknown error uploading avatar'));
      return;
    } else {
      userData.existsAvatarAtUrl = true;
      operationFeedbackHandler.displaySuccess('Your avatar has been updated. You may need to reload the page.');
    }
  }, 'image/jpeg');
}
</script>

<style scoped>

</style>
