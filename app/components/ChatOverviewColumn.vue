<template>
  <div class="align-column">
    <ModalSearchUser @close="onUserSelect">
      <UButton
        label="Search Users"
        color="neutral"
        variant="subtle"
        icon="i-lucide-search"
        class="glassContainer"
      />
    </ModalSearchUser>
    <UButton
      class="mb-[10px]"
      label="Create Chatroom"
      color="primary"
      variant="solid"
      icon="i-lucide-plus"
      @click="onCreateChat"
    />
  </div>
</template>

<script lang="ts" setup>
import type { UserSearchResult } from "~/types/userSearch";
import CreateChatroom from "~/components/Modal/CreateChatroom.vue";

const overlay = useOverlay();
const createChatroomModal = overlay.create(CreateChatroom);

// Handle user selection in the command palette
async function onUserSelect(result: UserSearchResult | null) {
  if (!result) return;
  navigateTo(`/profile/${result.username}`);
}

async function onCreateChat() {
  // Open without awaiting a result, as creation logic is handled inside the Modal
  createChatroomModal.open();
}
</script>

<style>

</style>