<template>
  <NuxtLayout name="chat">
    <div :class="`mainContainer ${themedGlassContainer}`">
      <!-- Container for Desktop -->
      <div v-if="!isMobile">
        <h1 class="headlineChat-desktop">You didn't open any chats yet</h1>
        <USeparator :class="`${themedSeparator}`" color="primary" />
      </div>
      <ChatroomPreview
        v-for="chatroom in chatroomsWithAvatarUrl"
        :name="chatroom.name"
      ></ChatroomPreview>

      <!-- Container for Mobile -->
      <div v-if="isMobile">
        <h1 class="headlineChat-mobile">New Messages</h1>
        <USeparator :class="`${themedSeparatorMobile}`" color="primary" />

        <!-- Direct -->
        <h1 class="headline-direct">Direct Chats</h1>
        <!-- Loop through users array -->
        <div
          v-for="(chatroom, index) in chatroom"
          :key="chatroom.id"
          :class="[
            'container-overlay',
            index === 0
              ? 'first-message-container'
              : 'subsequent-message-container',
          ]"
        >
          <div class="avatars-direct">
            <UChip inset color="primary">
              <UAvatar :src="chatroom.loggedUser.avatarUrl" size="lg" />
            </UChip>
          </div>
          <div class="count-new-messages">
            <UBadge
              class="font-bold rounded-full"
              size="md"
              color="primary"
              variant="outline"
            >
              {{ chatroom.new_messages }}
            </UBadge>
          </div>
          <div class="button-layer">
            <UButton class="newMessages custom-button-text" :block="true">
              {{ chatroom.loggedUser.username }}
            </UButton>
          </div>
        </div>

        <!-- Groups -->
        <h1 class="headline-direct">Group Chats</h1>
        <!-- Loop through groupChatroom array -->
        <div
          v-for="(chatroom, index) in groupChatrooms"
          :key="chatroom.chatroom_id"
          :class="[
            'container-overlay',
            index === 0
              ? 'first-message-container'
              : 'subsequent-message-container',
          ]"
        >
          <div class="avatars-group">
            <UAvatarGroup :max="1">
              <UChip
                v-for="user in chatroom.users"
                :key="user.user_id"
                inset
                color="primary"
              >
                <UAvatar :src="user.avatarUrl" size="lg" />
              </UChip>
            </UAvatarGroup>
          </div>
          <div class="count-new-messages">
            <UBadge
              class="font-bold rounded-full"
              size="md"
              color="primary"
              variant="outline"
            >
              {{ chatroom.new_messages }}
            </UBadge>
          </div>
          <div class="button-layer">
            <UButton class="newMessages custom-button-text" :block="true">
              {{ chatroom.name }}
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script lang="ts" setup>
import { logPostgrestError } from "~~/errors/postgrestErrors";

export interface UserData {
  user_id: string;
  username: string;
  displayname: string | null;
  description: string | null;
  avatarPath: string;
  avatarUrl: string;
}

export interface DirectChatroomData {
  chatroom_id: string;
  new_messages: number;
  user1: UserData;
  user2: UserData;
  loggedUser: UserData;
}

export interface GroupChatroomData {
  chatroom_id: string;
  name: string;
  new_messages: number;
  users: UserData[];
}

const isMobile = useMobileDetector();
const { isLight } = useSSRSafeTheme();
const supabase = useSupabaseClient();
const { data } = await supabase.auth.getSession();
const sessionData: string | undefined = data.session?.user.updated_at;
const convertedSessionData = sessionData ? new Date(sessionData) : null;

const userData = useUserData();
const directChatrooms = ref<DirectChatroomData[]>([]);
const groupChatrooms = ref<GroupChatroomData[]>([]);
const themedGlassContainer = computed(() =>
  isLight.value ? "mainGlassContainer-dark" : "mainGlassContainer-light"
);
const themedSeparator = computed(() =>
  isLight.value ? "separator-dark-desktop" : "separator-light-desktop"
);
const themedSeparatorMobile = computed(() =>
  isLight.value ? "separator-dark-mobile" : "separator-light-mobile"
);

// Get new messages count
async function getNewMessagesCount(chatroom_id: string): Promise<number> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chatroom_id", chatroom_id);
  console.log(data);
  if (error) {
    logPostgrestError(error, "timestamp fetching");
    return 0;
  }
  if (data === null || data.length === 0) {
    console.log("No messages found for chatroom_id:" + chatroom_id);
    return 0;
  }
  let messageCount = 0;
  for (const message of data) {
    if (convertedSessionData != undefined) {
      const messageDate = new Date(message.created_at);
      if (messageDate > convertedSessionData) {
        messageCount++;
      }
    }
  }
  if (messageCount > 0) {
    return messageCount;
  } else return 0;
}

function generateAvatarUrl(
  type: string,
  id: string,
  otherUserId: string | null
): {
  avatarUrl: string | undefined;
} {
  return type === "direct"
    ? {
        avatarUrl: otherUserId ? getAvatarUrl(otherUserId) : undefined,
      }
    : {
        avatarUrl: useCachedSignedImageUrl(
          "chatroom_avatars",
          getGroupAvatarPath(id)
        ).value,
      };
}

async function getGroupChatroomName(chatroom_id: string): Promise<string> {
  const { data, error } = await supabase
    .from("group_chatrooms")
    .select("name")
    .eq("chatroom_id", chatroom_id);
  if (error) {
    logPostgrestError(error, "No chatroom name");
    return "Unnamed Group";
  }
  if (!data || data.length === 0) {
    console.log("No data found");
    return "Unnamed Group";
  }
  return data[0]?.name || "Unnamed Group";
}

const previewQuery = supabase
  .from("chatrooms_preview")
  .select("*")
  .order("last_activity", { ascending: false });

const chatroomList = ref<Awaited<typeof previewQuery>["data"]>([]);

async function getChatroomList(user_id: string): Promise<UserData | null> {
  const { data, error } = await previewQuery;

  if (error) {
    logPostgrestError(error, "message fetching");
    return null;
  }
  if (!data || data.length === 0) {
    console.log("No chatrooms found for user_id:" + user_id);
    return null;
  }

  return data;
}

// await getChatroomList(userData.id).forEach((element) => {
//   console.log(element.name);
// });
const chatrooms = ref(await getChatroomList(userData.id));
const chatroomsWithAvatarUrl = computed(() =>
  chatrooms.value?.map((chatroom) => {
    const { avatarUrl } = generateAvatarUrl(
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

console.log(chatroomsWithAvatarUrl.value[0].avatarUrl);
</script>

<style>
@import url("~/assets/css/landingchat.css");
</style>
