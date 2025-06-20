<template>
  <UModal
    title="Delete Chatroom"
    description="This will delete the chatroom! This action cannot be undone."
    :ui="{
      footer: 'flex flex-row',
    }"
  >
    <template #footer>
      <div class="flex gap-3 grow">
        <UButton
          class="flex-1 flex justify-center"
          color="error"
          type="submit"
          label="Confirm"
          @click="onDeleteChatroom"
        />
        <UButton
          class="flex-1 flex justify-center"
          variant="outline"
          @click="onCancel"
        >
          Cancel
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
const props = defineProps<{
  chatroomId: string;
}>();
const emit = defineEmits<{ close: [success: boolean] }>();

const { deleteChatroom } = useChatroomActions();

async function onDeleteChatroom() {
  const success = await deleteChatroom(props.chatroomId);
  emit("close", success);
}
function onCancel() {
  emit("close", false);
}
</script>
