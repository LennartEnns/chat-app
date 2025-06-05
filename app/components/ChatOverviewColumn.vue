<template>
  <div class="align-column p-0">
    <div class="flex mb-2 gap-4 justify-center items-center">
      <ModalSearchUser class="h-min" @close="onUserSelect">
        <UButton
          label="Search Users"
          color="neutral"
          variant="subtle"
          icon="i-lucide-search"
          class="glassContainer p-0"
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
    <UButton
      v-for="(user, i) in availableChatrooms.data"
      class="mb-1"
      :label="user.name"
      variant="subtle"
      @click="openChat(user.id)"
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

const supabase = useSupabaseClient();
let availableChatrooms: Object = await supabase.from("chatrooms").select("*");
availableChatrooms.data?.forEach((element: Object, i: Number) => {
  console.log(element);
  console.log(i);
});

async function openChat(id: String) {
  navigateTo("/chat/" + id);
}
</script>

<style></style>
