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
    <div class="flex-1 mt-1 w-full">
      <ChatroomPreview
        class="w-full mb-2"
        v-for="chatroom in chatroomsWithAvatarUrl"
        :name="chatroom.name"
        :avatar-url="chatroom.avatarUrl"
        :id="chatroom.id"
      ></ChatroomPreview>
    </div>
  </div>
</template>

<script lang="ts" setup>
import CreateChatroom from "~/components/Modal/Chatroom/Create.vue";

const overlay = useOverlay();
const createChatroomModal = overlay.create(CreateChatroom);
const userData = useUserData();
const supabase = useSupabaseClient();

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

<style></style>
