<template>
  <NuxtLayout name="chat">
    <div :class="`mainContainer ${themedGlassContainer}`">
      <!-- Container for Desktop -->
      <div v-if="!isMobile">
        <h1 class="headlineChat-desktop">No chat open</h1>
        <USeparator :class="themedSeparator" color="primary" />
      </div>

      <!-- Container for Mobile -->
      <div v-if="isMobile">
        <h1 class="headlineChat-mobile">New Messages</h1>
        <USeparator :class="themedSeparatorMobile" color="primary" />

        <!-- Direct Chats -->
        <ChatsLanding 
          title="Direct Chats" 
          :chatrooms="directChatrooms" 
          type="direct" 
        />

        <!-- Group Chats -->
        <ChatsLanding
          title="Group Chats" 
          :chatrooms="groupChatrooms" 
          type="group" 
        />
      </div>
    </div>
  </NuxtLayout>
</template>

<script lang="ts" setup>
import {
  logPostgrestError,
} from "~~/errors/postgrestErrors";
import { logStorageError } from "~~/errors/storageErrors";
import type { DirectChatroomData, GroupChatroomData } from "~/types/chatroom";

export interface UserData {
  id: string,
  email: string,
  username: string,
  displayname: string | null,
  description: string | null,
  avatarPath: string,
  avatarUrl: string,
};

useFirstLoginDetector();
const isMobile = useMobileDetector();
const {isLight} = useSSRSafeTheme();
const supabase = useSupabaseClient();
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

onMounted(() => {
  if(isMobile.value) {
    async function getLastActivity(chatroom_id: string): Promise<string | undefined>{
      const { data: last_activity } = await supabase.from("user_to_abstract_chatroom").select("last_inside").eq("user_id", userData.id).eq("chatroom_id", chatroom_id).single();
      return last_activity?.last_inside;
    }

    // Get new messages count
    async function getNewMessagesCount(chatroom_id: string): Promise<number>{
      const last_activity = await getLastActivity(chatroom_id);
      const last_inside = last_activity ? new Date(last_activity) : null;
      const { data, error } = await supabase
      .from("messages")
      .select("*", {
          count: "exact",
          head: true,
        })
        .eq("chatroom_id", chatroom_id)
        .gt('created_at', last_inside)

      if (error) {
        logPostgrestError(error, "timestamp fetching");
        return 0;
      }
      if(data === null){
        console.log("No new messages found for chatroom_id:" + chatroom_id);
        return 0;
      }
      if(data.length > 0){
        return data?.length;
      } else return 0;
    }


    // Get data from Group Chatrooms
    async function getGroupChatroomData(){
      const { data, error } = await supabase.from("user_to_group").select("chatroom_id").eq("user_id", userData.id);
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
        const name_and_count = await getChatroomNameAndNewMessages(element.chatroom_id);
        if (!name_and_count) continue;
        const avatarUrl = await getAvatarUrl(element.chatroom_id, "group");
        groupChatrooms.value.push({
          chatroom_id: element.chatroom_id,
          name: name_and_count.name,
          avatar_url: avatarUrl?.avatarUrl,
          new_messages: name_and_count.new_messages,
          users: users
        });
      }
    }

    async function getChatroomNameAndNewMessages(chatroom_id: string): Promise<{name: string, new_messages: number} | null >{
      const { data, error } = await supabase.from("chatrooms_preview").select("*").eq("id", chatroom_id);

      if(error){
        logPostgrestError(error, "group chatroom fetching");
        return null;
      }

      for(const chatroom of data){
        return{
          name: chatroom.name!,
          new_messages: chatroom.number_new_messages!
        };
      }
      return null;
    }

    // Get data from direct chats
    async function getDirectChatroomData(){
      const { data, error } = await supabase.from("direct_chatrooms").select("*").or(`user1_id.eq.${userData.id},user2_id.eq.${userData.id}`);
      if (error) {
        logPostgrestError(error, "direct chatroom loading");
        return;
      }
      if (!data || data.length === 0) {
        return;
      }
      for (const element of data) {
        if (element.user1_id && element.user2_id) {
          try {
            const count = await getNewMessagesCount(element.chatroom_id);
            const user1 = await getUserDataFromOtherUsers(element.user1_id);
            const user2 = await getUserDataFromOtherUsers(element.user2_id);
            
            if (user1 && user2) {
              const loggedUser = user1.id === userData.id ? user1 : user2;
              directChatrooms.value.push({
                chatroom_id: element.chatroom_id,
                new_messages: count,
                user1: user1,
                user2: user2,
                loggedUser: loggedUser
              });
            } else {
              console.warn(`Could not load users for chatroom ${element.chatroom_id}`);
            }
          } catch (err) {
            console.error(`Error processing chatroom ${element.chatroom_id}:`, err);
          }
        }
      }
    }

    async function getAvatarUrl(id: string, type: string): Promise<{ avatarPath: string; avatarUrl: string } | null> {
      let avatarPath = '';
      if(type == "group"){
        avatarPath = `${id}.jpg`
        const { data, error } = await supabase.storage
          .from("chatroom_avatars")
          .createSignedUrl(avatarPath, 20);

        if(error){
          logStorageError(error, "signed avatar url");
          return null;
        }
        return {
          avatarPath,
          avatarUrl: data.signedUrl
        };
      } else if(type == "direct"){
        avatarPath = `public/${id}.jpg`;
        const avatarUrlData = supabase.storage
          .from("avatars")
          .getPublicUrl(avatarPath);
        return {
          avatarPath,
          avatarUrl: avatarUrlData.data.publicUrl
        };
      }
      return null;
    }

    async function getOtherUsers(element:{chatroom_id: string;}): Promise<UserData[]>{
      const { data, error } = await supabase.from("user_to_group").select("user_id").eq("chatroom_id", element.chatroom_id);

      if(error){
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

    async function getUserDataFromOtherUsers(user_id: string): Promise<UserData | null>{
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user_id);

      if(error){
        logPostgrestError(error, "message fetching");
        return null;
      }
      if (!data || data.length === 0) {
        console.log("No data found");
        return null;
      }
      const userData: UserData[] = [];
      for(const element of data){
        const avatarData = await getAvatarUrl(element.user_id, "direct");
        if (avatarData) {
          userData.push({
            ...element,
            avatarPath: avatarData.avatarPath,
            avatarUrl: avatarData.avatarUrl,
            id: "",
            email: ""
          });
        } else {
          userData.push({
          ...element,
          avatarPath: '',
          avatarUrl: '',
          id: "",
          email: ""
          });
        }
      }
      if(userData[0] != undefined){
        return userData[0];
      } else return null;
    }

    getGroupChatroomData();
    getDirectChatroomData();
  }
});
</script>

<style>
@import url("~/assets/css/landingchat.css");
</style>