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
          v-if="chatroomsListFetchingStatus === 'success' || chatroomsListFetchingStatus === 'idle'"
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
        <div v-else-if="chatroomsListFetchingStatus === 'pending'" class="mt-1 w-full space-y-4">
          <USkeleton v-for="i in 3" :key="i" class="w-full h-10" />
        </div>
        <div v-else class="flex flex-row gap-x-2 items-center justify-center flex-wrap">
          <UIcon name="i-lucide-x-circle" size="xl" class="text-error" />
          <div class="text-error text-lg">
            Error loading chatrooms
          </div>
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
import type { CachedChatroomsMap } from '~/types/chatroom';
import type { TabsItem } from "@nuxt/ui";
import type { Tables } from "~~/database.types";
import CreateChatroom from "~/components/Modal/Chatroom/Create.vue";
import { logPostgrestError } from "~~/errors/postgrestErrors";

const cachedChatrooms = useState<CachedChatroomsMap | undefined>('chatrooms');
const supabase = useSupabaseClient();
const operationFeedbackHandler = useOperationFeedbackHandler();
const userData = useUserData();
const overlay = useOverlay();
const createChatroomModal = overlay.create(CreateChatroom);

const route = useRoute();

const routeChatroomId = computed(() => {
  const params = route.params;
  return params.id as string;
});

// First only do a head query to avoid unnecessary data fetching
const { data: existUnhandledInvitations } = await useLazyAsyncData(
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
const {
  data: inboundInvitations,
  execute: executeFetchInvitations,
  refresh: refreshFetchInvitations,
  pending: invitationsPreviewPending,
} = await useLazyAsyncData(
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

async function getChatroomList(): Promise<Tables<'chatrooms_preview'>[]> {
  console.log("Fetching chatrooms...");
  if (cachedChatrooms.value) {
    // Prefer using cached chatrooms if available
    console.log("Using cached chatrooms");
    return chatroomsMapToArray(cachedChatrooms.value);
  }

  console.log("Fetching from DB...")
  const { data, error } = await previewQuery;

  if (error) {
    logPostgrestError(error, "chatrooms fetching");
    operationFeedbackHandler.displayError("Could not load chatrooms");
    return [];
  }
  if (!data || data.length === 0) {
    return [];
  }

  return data;
}

const { data: chatrooms, status: chatroomsListFetchingStatus, refresh: refreshChatroomsList } = await useAsyncData('chatroomsPreviewList', getChatroomList, {
  server: false,
});
let refetchChatroomsOnStateUpdate = true;
// Re-fetch chatroom previews from local state when it is updated
watch(cachedChatrooms, () => {
  if (!refetchChatroomsOnStateUpdate) return;
  refreshChatroomsList();
}, {
  immediate: true,
  deep: true,
});
watch(chatrooms, (rooms) => {
  if (cachedChatrooms.value || !rooms) return;

  // Cache fetched chatrooms in shared state
  console.log("Caching chatrooms");
  // Ignore this state change to avoid unnecessary refetch
  refetchChatroomsOnStateUpdate = false;
  cachedChatrooms.value = chatroomsArrayToMap(rooms);
  nextTick(() => refetchChatroomsOnStateUpdate = true);
}, {
  immediate: true,
});

const { data: chatroomAvatarRefs } = await useLazyAsyncData('chatroomsAvatarUrls', async () => {
  if (!chatrooms.value || chatrooms.value.length === 0) return ({});
  return Object.fromEntries(
    chatrooms.value.map((chatroom) =>
    [chatroom.id!, getAbstractChatroomAvatarUrl(
      chatroom.type!,
      chatroom.id!,
      chatroom.other_user_id
    )])
  );
}, {
    immediate: true,
    server: false,
    watch: [chatrooms],
  }
);
const chatroomsWithAvatarUrl = computed(() => {
  return chatrooms.value?.map((chatroom) => {
    return {
      ...chatroom,
      avatarUrl: chatroomAvatarRefs.value ? chatroomAvatarRefs.value[chatroom.id!]?.value : undefined,
    };
  });
});
</script>
