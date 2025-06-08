<template>
  <div class="avatar">
    <div class="avatar-container">
      <UAvatar
        class="border-2"
        :src="(editable || clearable) ? cacheBustedSrc : src"
        :icon="defaultIcon"
        :ui="{ root: 'size-35', icon: 'size-11/12' }"
      />
      <div v-if="editable" class="avatar-overlay">
        <UIcon name="i-lucide-camera" size="xx-large" />
        Edit Picture
        <input
          type="file"
          style="
            position: absolute;
            width: 100%;
            height: 100%;
            opacity: 0;
          "
          accept="image/*"
          @change="startCroppingAvatar"
        >
      </div>
    </div>
    <UButton
      v-if="clearable && existsSrc"
      label="Clear Avatar"
      variant="ghost"
      class="cursor-pointer mt-1"
      color="error"
      @click="clearAvatar"
    />
  </div>
</template>

<script lang="ts" setup>
import CropAvatar from './Modal/CropAvatar.vue';

const props = defineProps<{
  src: string | undefined,
  bucketName: string,
  filepath: string,
  defaultIcon: string,
  editable: boolean,
  clearable: boolean,
}>();

const emit = defineEmits<{
  clear: [],
}>();

const supabase = useSupabaseClient();
const operationFeedbackHandler = useOperationFeedbackHandler();
const overlay = useOverlay();
const croppingModal = overlay.create(CropAvatar);

const existsSrc = ref(false);
const srcCacheBuster = ref(Date.now());
const cacheBustedSrc = computed(() => props.src + `?t=${srcCacheBuster.value}`);

async function forceReload() {
  srcCacheBuster.value = Date.now();
}
async function startCroppingAvatar(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const newAvatarObjectUrl = URL.createObjectURL(file);
  const instance = croppingModal.open({
    avatarUrl: newAvatarObjectUrl,
  });
  const result = await instance.result;
  if (result) {
    const success = await uploadAvatarBlob(result, props.bucketName, props.filepath);
    if (success) {
      existsSrc.value = true;
      forceReload();
    }
  }
}
async function clearAvatar() {
  const { error } = await supabase.storage
    .from(props.bucketName)
    .remove([props.filepath]);
  if (error) {
    operationFeedbackHandler.displayError("Could not clear avatar.");
  } else {
    existsSrc.value = false;
    forceReload();
    emit('clear');
  }
}

onNuxtReady(async () => {
  // Value only needed if image might be updated by the user
  if (!props.editable && !props.clearable) return;
  const { data } = await supabase.storage
    .from(props.bucketName)
    .exists(props.filepath);
  existsSrc.value = data;
});
</script>

<style>
.avatar {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.avatar-container {
  position: relative;
  display: inline-block;
  user-select: none;
}
.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 50%;
  z-index: 20;
  cursor: pointer;
}
.avatar-container:hover .avatar-overlay {
  opacity: 1;
}
.avatar-container:hover .ava {
  filter: grayscale(40%);
}
</style>