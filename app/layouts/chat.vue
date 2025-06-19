<template>
  <NuxtLayout
    name="logged-in"
    :class="`${isLight ? 'base' : 'base-dark'} max-h-dvh`"
  >
    <div class="main-layout grow">
      <!--Mobile UI drawer for choosing chats-->
      <UDrawer v-if="isMobile" v-model:open="drawerOpen" direction="bottom">
        <template #body>
          <ChatOverviewColumn
            class="max-h-[80dvh]"
            :chatrooms-list-fetching-status="chatroomsListFetchingStatus"
            :chatrooms-with-avatar-url="chatroomsWithAvatarUrl"
            @refresh-chats="onRefreshChats"
          />
        </template>
      </UDrawer>
      <!--Desktop column for choosing chats-->
      <ChatOverviewColumn
        v-if="!isMobile"
        :chatrooms-list-fetching-status="chatroomsListFetchingStatus"
        :chatrooms-with-avatar-url="chatroomsWithAvatarUrl"
        @refresh-chats="onRefreshChats"
      />
      <slot />
    </div>
  </NuxtLayout>
</template>

<script lang="ts" setup>
import type { CachedChatroomsMap } from "~/types/chatroom";
import { logPostgrestError } from "~~/errors/postgrestErrors";

const isMobile = useMobileDetector();
const drawerOpen = useOpenDrawer();
const { isLight } = useSSRSafeTheme();
const supabase = useSupabaseClient();
const operationFeedbackHandler = useOperationFeedbackHandler();
const cachedChatrooms = useState<CachedChatroomsMap | undefined>('chatrooms');
  
//////////////////// Logic for Chatroom Preview Fetching ////////////////////////

const previewQuery = supabase
  .from("chatrooms_preview")
  .select("*")
  .order("last_activity", { ascending: false });
type ChatroomsPreviews = NonNullable<Awaited<typeof previewQuery>['data']>;

const refreshChatroomsOnStateUpdate = ref(true);
const fetchingChatroomsFromDB = ref(false);

async function getChatroomList(): Promise<ChatroomsPreviews> {
  console.log("Fetching chatrooms...");
  // Prefer using cached chatrooms if cache exists and the opened chatroom is available in cache
  if (cachedChatrooms.value) {
    console.log("Using cached chatrooms");
    return chatroomsMapToArray(cachedChatrooms.value);
  }

  console.log("Fetching from DB...")
  fetchingChatroomsFromDB.value = true;
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

const { data: chatrooms, status: chatroomsListFetchingStatus, refresh: refreshChatroomsList } = await useLazyAsyncData('chatroomsPreviewList', getChatroomList, {
  server: false,
  immediate: true,
});
// Re-fetch chatroom previews from local state when it is updated
watch(cachedChatrooms, () => {
  if (!refreshChatroomsOnStateUpdate.value) return;

  console.log("Refreshing chatrooms from local state");
  refreshChatroomsList();
}, {
  immediate: false,
  deep: true,
});

// Loads the avatar URLs whenever the chatroom list changes.
// Prefer cached URLs
const { data: chatroomAvatarRefs } = await useLazyAsyncData('chatroomsAvatarUrls', async () => {
  if (!chatrooms.value || chatrooms.value.length === 0) return ({});
  if (cachedChatrooms.value) {
    // Load avatar urls from cache
    return Object.fromEntries(
      Object.entries(cachedChatrooms.value).map(([id, data]) => [id, ref(data?.avatarUrl)])
    );
  }

  return Object.fromEntries(
    chatrooms.value.map((chatroom) =>
    [chatroom.id!, getAbstractChatroomAvatarUrl(
      chatroom.type!,
      chatroom.id!,
      chatroom.other_user_id
    )])
  );
}, {
    immediate: false,
    server: false,
    watch: [() => chatrooms.value?.map((room) => room.id)],
  }
);
const chatroomsWithAvatarUrl = computed(() => {
  return chatroomAvatarRefs.value ? chatrooms.value?.map((chatroom) => ({
      ...chatroom,
      avatarUrl: chatroomAvatarRefs.value![chatroom.id!]?.value,
    })
  ) : undefined;
});

// Caches the chatrooms if and only if they have just been fetched from the DB (not from cache)
watch(chatroomsWithAvatarUrl, (rooms) => {
  if (!rooms || !fetchingChatroomsFromDB.value) return;
  fetchingChatroomsFromDB.value = false;

  // Cache newly fetched chatrooms in shared state
  console.log("Caching chatrooms...");
  // Ignore this state change to avoid unnecessary refetch/reactive loop
  refreshChatroomsOnStateUpdate.value = false;
  cachedChatrooms.value = chatroomsArrayToMap(rooms);
  nextTick(() => refreshChatroomsOnStateUpdate.value = true);
}, {
  immediate: false,
});

async function onRefreshChats() {
  cachedChatrooms.value = undefined;
}
</script>

<style>
@import url("~/assets/css/chat.css");
</style>
