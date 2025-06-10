<template>
  <UModal
    :close="{ onClick: onCancel }"
    title="Crop Avatar"
    :ui="{
      header: 'justify-center border-none',
      body: 'p-0 sm:p-0',
      footer: 'flex flex-row justify-center',
    }"
  >
    <template #body>
      <cropper
        :src="avatarUrl"
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
    </template>

    <template #footer>
      <UButton icon="i-lucide-upload" label="Upload" variant="ghost" @click="onUpload" />
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import { CircleStencil, Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';

const croppedCanvas = ref<HTMLCanvasElement | null>(null);

defineProps<{
  avatarUrl: string,
}>();

const emit = defineEmits<{
  close: [Blob | null],
}>();

function onCrop({ canvas }: { canvas: HTMLCanvasElement }) {
  croppedCanvas.value = canvas;
}
async function onCancel() {
  emit('close', null);
}
async function onUpload() {
  if (!croppedCanvas.value) return

  // Convert canvas to Blob
  croppedCanvas.value.toBlob(async (blob) => {
    if (!blob) {
      console.log('Avatar upload error: No BLOB returned from canvas');
      emit('close', null);
      return;
    }
    emit('close', blob);
  }, 'image/jpeg');
}
</script>

<style>

</style>