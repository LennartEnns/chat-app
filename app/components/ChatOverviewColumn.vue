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
        color="primary"
        variant="solid"
        icon="i-lucide-message-circle-plus"
        @click="onCreateChat"
      />
    </div>
    <UTabs
      :items="tabItems"
      variant="link"
      class="mt-1 md:mt-2 w-full"
      :ui="{
        trigger: 'grow',
        root: 'overflow-y-auto',
        content: 'overflow-y-auto',
      }"
      @update:model-value="onTabSelected"
    >
      <template #chats>
        <UButton
          icon="i-lucide-refresh-ccw" label="Refresh" variant="subtle"
          class="w-full flex justify-center mb-2" :disabled="!refreshingAllowed"
          @click="onRefreshChatList" />
        <ClientOnly>
          <div
            v-if="!refreshingChatrooms && (chatroomsListFetchingStatus === 'success' || chatroomsListFetchingStatus === 'idle')"
          >
            <div
              v-if="!!chatroomsWithAvatarUrl && chatroomsWithAvatarUrl.length > 0"
              class="mt-1 w-full glassBG border-accented border-1 rounded-md pt-2 px-2 gap-5"
            >
              <ChatroomPreview
                v-for="(chatroom, index) in chatroomsWithAvatarUrl"
                :key="index"
                :class="`mb-2 glassBG  border-1 ${
                  routeChatroomId === chatroom.id
                    ? 'border-primary backdrop-brightness-110 dark:backdrop-brightness-250 '
                    : 'border-transparent dark:backdrop-brightness-150'
                }`"
                :chatroom-id="chatroom.id!"
                :name="chatroom.name!"
                :has-other-user-left="chatroom.type! === 'direct' && !chatroom.other_user_id"
                :avatar-url="chatroom.avatarUrl"
                :last-msg="chatroom.last_message"
                :number-new-messages="chatroom.number_new_messages ?? 0"
              />
            </div>
            <div v-else class="text-lg text-muted text-center mt-4">
              No chatrooms
            </div>
          </div>
          <div v-else-if="refreshingChatrooms || chatroomsListFetchingStatus === 'pending'" class="mt-1 w-full space-y-4">
            <USkeleton v-for="i in 3" :key="i" class="w-full h-10" />
          </div>
          <div v-else class="flex flex-row gap-x-2 items-center justify-center flex-wrap">
            <UIcon name="i-lucide-x-circle" size="xl" class="text-error" />
            <div class="text-error text-lg">
              Error loading chatrooms
            </div>
          </div>
        </ClientOnly>
      </template>

      <template #invitations>
        <UButton
          icon="i-lucide-refresh-ccw" label="Refresh" variant="subtle"
          class="w-full flex justify-center" :disabled="!refreshingAllowed"
          @click="onRefreshInvitations" />
        <ChatroomInvitationList
          :invitations="inboundInvitations"
          :loading="invitationsPreviewPending || refreshingInvitations"
          @remove-invitation="onRemoveInvitation"
        />
      </template>

      <template #trailing="{ item }">
        <UChip
          v-if="
            item.slot === 'invitations' &&
            existUnhandledInvitations &&
            (!inboundInvitations || inboundInvitations.length > 0)
          "
          standalone
        />
      </template>
    </UTabs>
  </div>
</template>

<script lang="ts" setup>
import type { UserSearchResult } from "~/types/userSearch";
import type { InvitationPreview } from "~/types/invitations/invitationsPreview";
import type { TabsItem } from "@nuxt/ui";
import type { AsyncDataRequestStatus } from "#app";
import CreateChatroom from "~/components/Modal/Chatroom/Create.vue";
import { logPostgrestError } from "~~/errors/postgrestErrors";
import type { CachedChatroomData } from "~/types/chatroom";

defineProps<{
  chatroomsListFetchingStatus: AsyncDataRequestStatus,
  refreshingChatrooms: boolean,
  chatroomsWithAvatarUrl?: (CachedChatroomData & { avatarUrl: string | undefined })[],
}>();

const emit = defineEmits<{
  refreshChats: [],
}>();

const routeChatroomId = useRouteIdParam();
const supabase = useSupabaseClient();
const operationFeedbackHandler = useOperationFeedbackHandler();
const userData = useUserData();
const overlay = useOverlay();
const createChatroomModal = overlay.create(CreateChatroom);

const refreshTimeout = 1000;
const refreshingAllowed = ref(true);

// First only do a head query to avoid unnecessary data fetching
const { data: existUnhandledInvitations, refresh: refreshExistUnhandledInvitations } = await useLazyAsyncData(
  "existUnhandledInvitations",
  async () => {
    const { count } = await supabase
      .from("group_invitations")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("invitee_id", userData.id);

    return !!count;
  }
);

// This will be executed when the invitations tab is opened (lazy loading)
const refreshingInvitations = ref(false);
const {
  data: inboundInvitations,
  execute: executeFetchInvitations,
  refresh: refreshFetchInvitations,
  pending: invitationsPreviewPending,
} = await useLazyAsyncData(
  "inboundInvitations",
  async () => {
    // Could also be undefined, so explicitly check for false
    if (existUnhandledInvitations.value === false) return [];

    const { data, error } = await supabase
      .from("group_invitations_preview")
      .select(
        "id, invitor_username, invitor_id, chatroom_id, group_name, as_role"
      )
      .eq("invitee_id", userData.id);

    if (error) {
      logPostgrestError(error, "invitation loading");
      operationFeedbackHandler.displayError("Could not load group invitations");
    }
    return (data as InvitationPreview[]) ?? [];
  },
  {
    immediate: false,
    server: false,
  }
);

const tabItems = [
  {
    label: "Chats",
    icon: "i-lucide-messages-square",
    slot: "chats" as const,
  },
  {
    label: "Invitations",
    icon: "i-lucide-mails",
    slot: "invitations" as const,
  },
] satisfies TabsItem[];

// Handle user selection in the command palette
async function onUserSelect(result: UserSearchResult | null) {
  if (!result) return;
  navigateTo(`/profile/${result.username}`);
}

async function onTabSelected(payload: string | number) {
  if (payload === "1" && !inboundInvitations.value) {
    executeFetchInvitations();
  }
}
async function onCreateChat() {
  const instance = createChatroomModal.open();
  const res = await instance.result;
  if (res) {
    if (res.type === "direct") {
      navigateTo(`/chat/${res.id}`);
    } else {
      // Open new group chatroom if the user clicks on Chats button
      navigateTo(`/chat/${res.id}/info`);
    }
  }
}
async function onRemoveInvitation() {
  // When an invitation has been rejected, reload all invitations
  refreshingInvitations.value = true;
  await refreshFetchInvitations();
  refreshingInvitations.value = false;
}

// Prevent spamming the refresh buttons
async function debounceRefresh() {
  refreshingAllowed.value = false;
  setTimeout(() => refreshingAllowed.value = true, refreshTimeout);
}
async function onRefreshInvitations() {
  if (!refreshingAllowed.value) return;
  refreshingAllowed.value = false;
  refreshingInvitations.value = true;
  await refreshExistUnhandledInvitations();
  if (!existUnhandledInvitations.value) {
    refreshingInvitations.value = false;
    debounceRefresh();
    return;
  }
  await refreshFetchInvitations();
  refreshingInvitations.value = false;
  debounceRefresh();
}
async function onRefreshChatList() {
  if (!refreshingAllowed.value) return;
  refreshingAllowed.value = false;
  emit('refreshChats');
  debounceRefresh();
}
</script>
