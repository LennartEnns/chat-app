<template>
  <div class="avatar">
    <div class="avatar-container">
      <UAvatar
        :src="srcModified"
        :icon="defaultIcon"
        :class="props.styling"
        :ui="{ root: props.rootStyling, icon: props.iconStyling }"
      />
      <div v-if="editable" class="avatar-overlay">
        <UIcon name="i-lucide-camera" size="xx-large" />
        Edit Picture
        <input
          type="file"
          style="position: absolute; width: 100%; height: 100%; opacity: 0"
          accept="image/*"
          @change="startCroppingAvatar"
        >
      </div>
    </div>
    <UButton
      v-if="clearable && existsAvatarImage"
      label="Clear Avatar"
      variant="ghost"
      class="cursor-pointer mt-1"
      color="error"
      @click="clearAvatar"
    />
  </div>
</template>

<script lang="ts" setup>
import CropAvatar from "./Modal/CropAvatar.vue";

const props = defineProps<{
  src: string | undefined;
  bucketName: string;
  filepath: string;
  defaultIcon: string;
  editable: boolean;
  clearable: boolean;
  styling: string;
  rootStyling: string;
  iconStyling: string;
}>();

const emit = defineEmits<{
  clear: [];
}>();

const supabase = useSupabaseClient();
const operationFeedbackHandler = useOperationFeedbackHandler();
const overlay = useOverlay();
const croppingModal = overlay.create(CropAvatar);

const existsAvatarImage = ref(false);
const checkedExists = ref(false);
const srcModified = ref(props.src);

// Value only needed if image might be updated/cleared by the user
watch(() => props.editable || props.clearable, async (val) => {
  if (val && !checkedExists.value) {
    existsAvatarImage.value = props.src ? await existsSrc(props.src) : false;
    checkedExists.value = true;
  }
}, {
  immediate: true,
});
watch(
  () => props.src,
  (newVal) => {
    srcModified.value = newVal;
  }
);

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
    const success = await uploadAvatarBlob(
      result,
      props.bucketName,
      props.filepath
    );
    if (success) {
      existsAvatarImage.value = true;
      srcModified.value = URL.createObjectURL(result);
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
    existsAvatarImage.value = false;
    srcModified.value = undefined;
    emit("clear");
  }
}
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
