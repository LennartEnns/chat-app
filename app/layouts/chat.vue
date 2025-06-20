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

async function fetchChatroomsFromDb(): Promise<ChatroomsPreviews> {
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

  return data;
}

// Interface between chatrooms state (Map) and local list (Array)
const chatrooms = computed<ChatroomsPreviews | undefined>({
  get: () => {
    return cachedChatrooms.value ? chatroomsMapToArray(cachedChatrooms.value) : undefined;
  },
  set: (rooms) => {
    cachedChatrooms.value = rooms ? chatroomsArrayToMap(rooms) : undefined;
  }
});
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
watch(chatroomsListFetchingStatus, (status, oldStatus) => {
  if (!!oldStatus && status === 'success') {
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
const chatroomsWithAvatarUrl = computed(() => {
  return chatroomAvatarRefs.value ? chatrooms.value?.map((chatroom) => ({
      ...chatroom,
      avatarUrl: chatroomAvatarRefs.value![chatroom.id!]?.value,
    })
  ) : undefined;
});

async function onRefreshChats() {
  refetchChatroomsFromDb();
}

onMounted(() => {
  if (!cachedChatrooms.value) {
    executeFetchChatroomsFromDb();
  }
});
////////////////// Realtime Logic ////////////////////

</script>

<style>
@import url("~/assets/css/chat.css");
</style>
