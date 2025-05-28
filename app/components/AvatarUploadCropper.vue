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
          Upload Image
        </UButton>
      </div>
    </div>
</template>

<script setup lang="ts">
import { CircleStencil, Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';

defineProps<{
  imageUrl: string,
}>();
const emit = defineEmits<{
  upload: [Blob],
}>();

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
    emit('upload', blob);
  }, 'image/jpeg');
}
</script>

<style scoped>

</style>
