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
    <UTabs
      :items="tabItems"
      variant="link"
      class="mt-1 md:mt-2 w-full"
      :ui="{
        trigger: 'grow',
      }"
      @update:model-value="onTabSelected"
    >
      <template #chats>
        <div
          class="mt-1 w-full glassBG border-accented border-1 rounded-md pt-2 px-2 gap-5"
        >
          <ChatroomPreview
            v-for="(chatroom, index) in chatroomsWithAvatarUrl"
            :key="index"
            class="mb-2 glassBG brightness-130"
            :chatroom-id="chatroom.id!"
            :name="chatroom.name!"
            :avatar-url="chatroom.avatarUrl"
            :last-msg="chatroom.last_message"
          />
        </div>
      </template>
      <template #invitations>
        <ChatroomInvitationList
          :invitations="inboundInvitations"
          :loading="invitationsPreviewPending"
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
import CreateChatroom from "~/components/Modal/Chatroom/Create.vue";
import { logPostgrestError } from "~~/errors/postgrestErrors";

const supabase = useSupabaseClient();
const operationFeedbackHandler = useOperationFeedbackHandler();
const userData = useUserData();
const overlay = useOverlay();
const createChatroomModal = overlay.create(CreateChatroom);

// First only do a head query to avoid unnecessary data fetching
const { data: existUnhandledInvitations } = await useAsyncData(
  "existUnhandledInvitations",
  async () => {
    const { count } = await supabase
      .from("group_invitations")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("invitee_id", userData.id);

    return !!count;
  }
);

// This will be executed when the invitations tab is opened (lazy loading)
const {
  data: inboundInvitations,
  execute: executeFetchInvitations,
  refresh: refreshFetchInvitations,
  pending: invitationsPreviewPending,
} = await useAsyncData(
  "inboundInvitations",
  async () => {
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
      navigateTo(`/chat/${res.id}/info`);
    }
  }
}
async function onRemoveInvitation() {
  // When an invitation has been rejected, reload all invitations
  refreshFetchInvitations();
}

const previewQuery = supabase
  .from("chatrooms_preview")
  .select("*")
  .order("last_activity", { ascending: false });

async function getChatroomList(): Promise<Awaited<typeof previewQuery>["data"]> {
  const { data, error } = await previewQuery;

  if (error) {
    logPostgrestError(error, "chatrooms fetching");
    operationFeedbackHandler.displayError('Could not load chatrooms');
    return [];
  }
  if (!data || data.length === 0) {
    return [];
  }

  return data;
}

const { data: chatrooms } = await useAsyncData('chatroomsPreviewList', getChatroomList)

const chatroomsWithAvatarUrl = computed(() =>
  chatrooms.value?.map((chatroom) => {
    const avatarUrl = getAbstractChatroomAvatarUrl(
      chatroom.type!,
      chatroom.id!,
      chatroom.other_user_id
    );
    return {
      ...chatroom,
      avatarUrl,
    };
  })
);
</script>

<style></style>
