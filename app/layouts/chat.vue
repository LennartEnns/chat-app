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
            :refreshing-chatrooms="refreshingChatrooms"
            :chatrooms-with-avatar-url="chatroomsWithAvatarUrl"
            @refresh-chats="onRefreshChats"
          />
        </template>
      </UDrawer>
      <!--Desktop column for choosing chats-->
      <ChatOverviewColumn
        v-if="!isMobile"
        :chatrooms-list-fetching-status="chatroomsListFetchingStatus"
        :refreshing-chatrooms="refreshingChatrooms"
        :chatrooms-with-avatar-url="chatroomsWithAvatarUrl"
        @refresh-chats="onRefreshChats"
      />
      <slot />
    </div>
  </NuxtLayout>
</template>

<script lang="ts" setup>
import { useCachedChatroomsList } from "~/composables/useCachedChatroomsList";
import type { CachedChatroomData, CachedChatroomsAvatarUrlMap } from "~/types/chatroom";
import { logPostgrestError } from "~~/errors/postgrestErrors";

const isMobile = useMobileDetector();
const drawerOpen = useOpenDrawer();
const { isLight } = useSSRSafeTheme();
const supabase = useSupabaseClient();
const operationFeedbackHandler = useOperationFeedbackHandler();
const cachedChatroomsAvatarUrlMap = useState<CachedChatroomsAvatarUrlMap | undefined>('chatroom-avatar-urls');

// Initiate realtime preview listeners, which can modify the chatrooms preview list state.
// Tied to the lifecycle of any page that uses this layout.
useRealtimeMessagePreviewListeners();

//////////////////// Logic for Chatroom Preview Fetching ////////////////////////

const previewQuery = supabase
  .from("chatrooms_preview")
  .select("*")
  .order("last_activity", { ascending: false });

async function fetchChatroomsFromDb(): Promise<CachedChatroomData[]> {
  console.log("Fetching chatrooms from DB...")
  const { data, error } = await previewQuery;

  if (error) {
    logPostgrestError(error, "chatrooms fetching");
    operationFeedbackHandler.displayError("Could not load chatrooms");
    return [];
  }
  if (!data || data.length === 0) {
    return [];
  }

  return data as CachedChatroomData[];
}

const chatrooms = useCachedChatroomsList();

const {
  data: fetchedChatrooms,
  status: chatroomsListFetchingStatus,
  execute: executeFetchChatroomsFromDb,
  refresh: refetchChatroomsFromDb
} = await useLazyAsyncData('chatroomsPreviewList', fetchChatroomsFromDb, {
  immediate: false,
  server: false,
});
// Write chatrooms to state after fetching from db
watch(chatroomsListFetchingStatus, (status, statusOld) => {
  if (!!statusOld && status === 'success') {
    console.log("Caching fetched chatrooms")
    chatrooms.value = fetchedChatrooms.value;
  }
}, {
  immediate: true,
});

// Loads the avatar URLs whenever the chatroom list changes.
// Prefer cached URLs
const { data: chatroomAvatarRefs } = await useLazyAsyncData('chatroomAvatarRefs', async () => {
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
    watch: [() => chatrooms.value?.map((room) => room.id)],
  }
);
// Update cached URLs from refs
watch(chatroomAvatarRefs, (refs) => {
  if (!refs) cachedChatroomsAvatarUrlMap.value = {};
  cachedChatroomsAvatarUrlMap.value = Object.fromEntries(
    Object.entries(refs!).map(([id, data]) => [id, data.value])
  );
}, {
  deep: true,
});
const chatroomsWithAvatarUrl = computed(() => {
  return chatroomAvatarRefs.value ? chatrooms.value?.map((chatroom) => ({
      ...chatroom,
      avatarUrl: chatroomAvatarRefs.value![chatroom.id!]?.value,
    })
  ) : undefined;
});

const refreshingChatrooms = ref(false);
async function onRefreshChats() {
  refreshingChatrooms.value = true;
  await refetchChatroomsFromDb();
  refreshingChatrooms.value = false;
}

onMounted(() => {
  // Chatrooms from state are undefined, so fetch from DB
  if (!chatrooms.value) {
    executeFetchChatroomsFromDb();
  }
});
</script>

<style>
@import url("~/assets/css/chat.css");
</style>
