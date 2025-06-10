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

const isMobile = useMobileDetector();
const { isLight } = useSSRSafeTheme();
const supabase = useSupabaseClient();
const userData = useUserData();

const themedGlassContainer = computed(() =>
  isLight.value ? "mainGlassContainer-dark" : "mainGlassContainer-light"
);
const themedSeparator = computed(() =>
  isLight.value ? "separator-dark-desktop" : "separator-light-desktop"
);
const themedSeparatorMobile = computed(() =>
  isLight.value ? "separator-dark-mobile" : "separator-light-mobile"
);

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
          getGroupAvatarPath(id),
          true
        ).value,
      };
}

const previewQuery = supabase
  .from("chatrooms_preview")
  .select("*")
  .order("last_activity", { ascending: false });

async function getChatroomList(
  user_id: string
): Promise<Awaited<typeof previewQuery>["data"] | null> {
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

let chatrooms = ref<Awaited<typeof previewQuery>["data"]>([]);
const chatroomListResult = await getChatroomList(userData.id);
chatrooms.value = chatroomListResult ?? [];

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
console.log(chatroomsWithAvatarUrl.value);
</script>

<style>
@import url("~/assets/css/landingchat.css");
</style>
