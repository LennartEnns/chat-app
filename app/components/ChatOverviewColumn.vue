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
    </div>
    <UTabs
      :items="tabItems"
      variant="link"
      class="mt-1 md:mt-2 w-full"
      :ui="{
        trigger: 'grow'
      }"
    >
      <template #chats>
        <UButton
          class=""
          color="primary"
          variant="solid"
          icon="i-lucide-message-circle-plus"
          @click="onCreateChat"
        />
      </template>
      <template #invitations>
        <div>Lennart Todo: Show incoming invitations</div>
      </template>

      <template #trailing="{ item }">
        <UChip v-if="item.slot === 'invitations' && existUnhandledInvitations" standalone />
      </template>
    </UTabs>
  </div>
</template>

<script lang="ts" setup>
import type { UserSearchResult } from "~/types/userSearch";
import CreateChatroom from "~/components/Modal/Chatroom/Create.vue";
import type { TabsItem } from "@nuxt/ui";

const supabase = useSupabaseClient();
const userData = useUserData();
const overlay = useOverlay();
const createChatroomModal = overlay.create(CreateChatroom);

const { data: existUnhandledInvitations } = await useAsyncData('existUnhandledInvitations', async () => {
  const { count } = await supabase.from('group_invitations')
    .select('*', {
      count: 'exact',
      head: true,
    })
    .eq('invitee_id', userData.id);

    return !!count;
});

const tabItems = [
  {
    label: 'Chats',
    icon: 'i-lucide-messages-square',
    slot: 'chats' as const,
  },
  {
    label: 'Invitations',
    icon: 'i-lucide-mails',
    slot: 'invitations' as const,
    
  }
] satisfies TabsItem[];

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
