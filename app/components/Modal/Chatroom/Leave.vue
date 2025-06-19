<template>
  <UModal
    title="Leave Chatroom"
    description="This will remove you from the chatroom! You will only be able to rejoin with an invitation."
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
          @click="onLeaveChatroom"
        />
        <UButton class="flex-1 flex justify-center" variant="outline" @click="onCancel">
          Cancel
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
const props = defineProps<{
  chatroomId: string,
}>();
const emit = defineEmits<{ close: [success: boolean] }>();

const { leaveChatroom } = useChatroomActions();

async function onLeaveChatroom() {
  const success = await leaveChatroom(props.chatroomId);
  emit("close", success);
}
function onCancel() {
  emit("close", false);
}
</script>
