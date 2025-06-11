<template>
  <NuxtLayout name="chat">
    <div :class="`mainContainer ${themedGlassContainer}`">
      <!-- Container for Desktop -->
      <div v-if="!isMobile">
        <h1 class="headlineChat-desktop">You didn't open any chats yet</h1>
        <USeparator :class="`${themedSeparator}`" color="primary" />
      </div>
      <!-- Container for Mobile -->
      <div v-if="isMobile">
        <h1 class="headlineChat-mobile">New Messages</h1>
        <USeparator :class="`${themedSeparatorMobile}`" color="primary" />

        <!-- Direct -->
        <h1 class="headline-direct">Direct Chats</h1>
        <!-- Loop through users array -->
        <div
          v-for="(chatroom, index) in directChatrooms"
          :key="chatroom.chatroom_id"
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
const userData = useUserData();
const operationFeedbackHandler = useOperationFeedbackHandler();
const { data } = await supabase.auth.getSession();
const sessionData: string | undefined = data.session?.user.updated_at;
const convertedSessionData = sessionData ? new Date(sessionData) : null;

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

// Get data from Group Chatrooms
async function getGroupChatroomData() {
  const { data, error } = await supabase
    .from("user_to_group")
    .select("chatroom_id")
    .eq("user_id", userData.id);
  if (error) {
    logPostgrestError(error, "message fetching");
    return;
  }
  if (!data || data == undefined) {
    console.log("No data found");
    return;
  }
  for (const element of data) {
    const users = await getOtherUsers(element);
    const name = await getGroupChatroomName(element.chatroom_id);
    const count = await getNewMessagesCount(element.chatroom_id);
    groupChatrooms.value.push({
      chatroom_id: element.chatroom_id,
      name: name,
      new_messages: count,
      users: users,
    });
  }
}

// Get data from direct chats
async function getDirectChatroomData() {
  const { data, error } = await supabase
    .from("direct_chatrooms")
    .select("*")
    .or(`user1_id.eq.${userData.id},user2_id.eq.${userData.id}`);
  console.log(data);
  if (error) {
    logPostgrestError(error, "no direct chatroom found");
    return;
  }
  if (!data || data.length === 0) {
    console.log("No data found");
    return;
  }
  for (const element of data) {
    if (element.user1_id && element.user2_id) {
      try {
        const count = await getNewMessagesCount(element.chatroom_id);
        const user1 = await getUserData(element.user1_id);
        const user2 = await getUserData(element.user2_id);

        if (user1 && user2) {
          const loggedUser = user1.id === userData.id ? user2 : user1;
          directChatrooms.value.push({
            chatroom_id: element.chatroom_id,
            new_messages: count,
            user1: user1,
            user2: user2,
            loggedUser: loggedUser,
          });
        } else {
          console.warn(
            `Could not load users for chatroom ${element.chatroom_id}`
          );
        }
      } catch (err) {
        console.error(`Error processing chatroom ${element.chatroom_id}:`, err);
      }
    }
  }
}

function generateAvatarUrl(userId: string) {
  const avatarPath = `public/${userId}.jpg`;
  const avatarUrlData = supabase.storage
    .from("avatars")
    .getPublicUrl(avatarPath);
  return {
    avatarPath,
    avatarUrl: avatarUrlData.data.publicUrl,
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

async function getOtherUsers(element: {
  chatroom_id: string;
}): Promise<UserData[]> {
  const { data, error } = await supabase
    .from("user_to_group")
    .select("user_id")
    .eq("chatroom_id", element.chatroom_id);

  if (error) {
    logPostgrestError(error, "message fetching");
    return [];
  }
  if (!data || data.length === 0) {
    console.log("No data found");
    return [];
  }
  const users: UserData[] = [];
  for (const element of data) {
    try {
      const userData = await getUserDataFromOtherUsers(element.user_id);
      if (userData) {
        users.push(userData);
      }
    } catch (err) {
      console.error(`Error loading user ${element.user_id}:`, err);
    }
  }
  return users;
}

async function getUserData(user_id: string): Promise<UserData | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user_id);

  if (error) {
    logPostgrestError(error, "message fetching");
    return null;
  }
  if (!data || data.length === 0) {
    console.log("No data found");
    return null;
  }
  const userData: UserData[] = [];
  for (const element of data) {
    const { avatarPath, avatarUrl } = generateAvatarUrl(element.user_id);
    userData.push({
      ...element,
      avatarPath,
      avatarUrl,
    });
  }
  if (userData[0] != undefined) {
    return userData[0];
  } else return null;
}

await Promise.all([getGroupChatroomData(), getDirectChatroomData()]);
</script>

<style>
@import url("~/assets/css/landingchat.css");
</style>
