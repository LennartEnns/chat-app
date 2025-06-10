<template>
  <div class="align-column p-0">
    <div class="flex mb-2 gap-4 justify-center items-center">
      <ModalSearchUser class="h-min" @close="onUserSelect">
        <UButton
          label="Search Users"
          color="neutral"
          variant="subtle"
          icon="i-lucide-search"
          class="flex-1"
        />
      </ModalSearchUser>
      <UButton
        class=""
        color="primary"
        variant="solid"
        icon="i-lucide-message-circle-plus"
        @click="onCreateChat"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { UserSearchResult } from "~/types/userSearch";
import CreateChatroom from "~/components/Modal/Chatroom/Create.vue";

const overlay = useOverlay();
const createChatroomModal = overlay.create(CreateChatroom);

// Handle user selection in the command palette
async function onUserSelect(result: UserSearchResult | null) {
  if (!result) return;
  navigateTo(`/profile/${result.username}`);
}

async function onCreateChat() {
  const instance = createChatroomModal.open();
  const res = await instance.result;
  if (res) {
    if (res.type === 'direct') {
      navigateTo(`/chat/${res.id}`);
    } else {
      navigateTo(`/chat/${res.id}/info`);
    }
  }
}
</script>

<style></style>
