<template>
    <div>
      <cropper
        :src="imageUrl"
        :stencil-component="CircleStencil"
        :auto-zoom="true"
        class="max-w-xs border rounded"
        @change="onCrop"
      />
      <UButton class="" @click="uploadCroppedImage">
        Upload Avatar
      </UButton>
    </div>
</template>

<script setup lang="ts">
import { CircleStencil, Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';

defineProps<{
  imageUrl: string,
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
        cacheControl: 'no-cache',
      });
    if (error) {
      console.log(`Error uploading avatar: ${error}`);
      operationFeedbackHandler.displayError('Could not upload avatar.');
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
