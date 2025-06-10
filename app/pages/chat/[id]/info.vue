<template>
  <UApp>
    <NuxtLayout name="logged-in" :class="`${isLight ? 'base' : false}`">
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 h-full">
        <div class="flex flex-col items-center p-5 overflow-hidden">
          <div class="pt-10 pb-5">
            <div v-if="chatroom.avatarUrl">
              <div class="relative h-70 w-70 md:h-50 md:w-50">
                <UAvatar
                  class="border-2 border-defaultNeutral-700 size-full"
                  :src="chatroom.avatarUrl"
                />
                <div class="absolute bottom-0 right-0">
                  <UButton
                    icon="i-lucide-image-up"
                    class="relative overflow-hidden size-fit"
                  >
                    <input
                      class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      type="file"
                      accept="image/*"
                      @change="uploadAvatar"
                    />
                  </UButton>
                </div>
              </div>
            </div>
            <UModal
              v-model:open="showAvatarCroppingModal"
              title="Crop Avatar"
              :ui="{
                header: 'justify-center',
              }"
            >
              <template #body>
                <AvatarUploadCropper
                  v-if="newAvatarObjectUrl"
                  :image-url="newAvatarObjectUrl"
                  @upload="onUploadCroppedAvatar"
                />
              </template>
            </UModal>
          </div>
          <div class="py-5">
            <p class="text-[40px] font-bold text-neutral-700 dark:text-white">
              {{ chatroom.name }}
            </p>
          </div>
          <div class="py-5 text-center text-neutral-700 dark:text-white">
            <p class="font-bold pb-5">Description:</p>
            <p class="line-clamp-10 w-full text-justify">
              {{ chatroom?.description || "No Description" }}
            </p>
          </div>
        </div>
        <div
          class="flex flex-col items-center col-span-2 px-5 relative md:border border-defaultNeutral-700 md:border-t-0 md:border-b-0 md:border-r-0 lg:border-t-0 lg:border-b-0 lg:border-r"
        >
          <div class="pb-5 text-neutral-700 dark:text-white">
            <p class="font-bold">Members</p>
          </div>
          <div class="flex flex-wrap justify-center gap-3">
            <div
              v-for="(member, index) in chatMembers"
              :key="index"
              class="ring-0 glassContainer text-neutral-700 dark:text-white member"
            >
              <div class="flex flex-col items-center w-max">
                <UAvatar
                  class="mb-1 w-full h-11"
                  icon="i-lucide-user"
                  :src="
                    (member.user_id && getAvatarUrl(member.user_id)) ||
                    undefined
                  "
                />
                <div>
                  <UBadge
                    class="font-bold rounded-full"
                    :ui="{
                      base: 'max-w-11 h-5 text-[10px] flex justify-center',
                    }"
                    >{{ member.role }}</UBadge
                  >
                </div>
              </div>
              <div class="flex flex-col justify-center px-[0.6rem]">
                <p class="truncate flex font-bold">
                  {{ member.displayname }}
                </p>
                <p class="line-clamp-2 leading-4">
                  {{ member.description }}
                </p>
              </div>
            </div>
          </div>
          <div class="absolute bottom-5 right-5 flex flex-col">
            <div class="flex flex-row justify-end">
              <div class="hidden md:block lg:hidden">
                <UTooltip text="View invitations">
                  <UButton
                    class="flex size-fit mb-3"
                    @click="openDrawer"
                    color="primary"
                    trailing-icon="i-lucide-chevron-left"
                  />
                </UTooltip>
              </div>
            </div>
            <div class="hidden md:block">
              <UButton
                class="flex size-fit"
                size="xl"
                icon="i-lucide-plus"
                @click="onInviteUser"
              >
                Invite Member
              </UButton>
            </div>
          </div>
        </div>
        <UDrawer
          direction="right"
          v-model:open="open"
          class="hidden md:block lg:hidden"
        >
          <template #body>
            <div class="flex flex-col items-center px-5">
              <div class="pb-5 text-neutral-700 dark:text-white">
                <p class="font-bold">Invitations</p>
              </div>
              <div class="pb-5">
                <div
                  v-for="(invitation, index) in chatInvitations"
                  :key="index"
                  class="ring-0 glassContainer text-neutral-700 dark:text-white member invitation"
                >
                  <UAvatar
                    class="justify-self-center"
                    icon="i-lucide-user"
                    :src="
                      (invitation.invitee_id &&
                        getAvatarUrl(invitation.invitee_id)) ||
                      undefined
                    "
                  />
                  <div
                    class="flex flex-col items-center justify-center truncate px-[0.6rem]"
                  >
                    <div class="truncate w-full text-center">
                      {{ invitation.invitee_id }}
                    </div>
                  </div>
                  <UButton icon="i-lucide-trash-2" class="size-fit"></UButton>
                </div>
              </div>
            </div>
          </template>
        </UDrawer>
        <div class="flex flex-col items-center px-5 lg:block md:hidden">
          <div class="pb-5 text-neutral-700 pt-5 md:pt-0 dark:text-white">
            <p class="font-bold flex justify-center">Invitations</p>
          </div>
          <div class="pb-5">
            <div
              v-for="(invitation, index) in chatInvitations"
              :key="index"
              class="ring-0 glassContainer text-neutral-700 dark:text-white member invitation"
            >
              <UAvatar
                class="justify-self-center"
                icon="i-lucide-user"
                :src="
                  (invitation.invitee_id &&
                    getAvatarUrl(invitation.invitee_id)) ||
                  undefined
                "
              />
              <div
                class="flex flex-col items-center justify-center truncate px-[0.6rem]"
              >
                <div class="truncate w-full text-center">
                  {{ invitation.invitee_id }}
                </div>
              </div>
              <UButton icon="i-lucide-trash-2" class="size-fit"></UButton>
            </div>
          </div>
        </div>
      </div>
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
import {
  getStorageErrorMessage,
  logStorageError,
} from "~~/errors/storageErrors";

import {
  getPostgrestErrorMessage,
  logPostgrestError,
} from "~~/errors/postgrestErrors";

import InviteToGroup from "~/components/Modal/Chatroom/InviteToGroup.vue";
import type { Tables } from "~~/database.types";

const { isLight } = useSSRSafeTheme();

const operationFeedbackHandler = useOperationFeedbackHandler();
const open = ref(false);
const newAvatarObjectUrl = ref<string | null>(null);
const showAvatarCroppingModal = ref(false);
const supabase = useSupabaseClient();

const overlay = useOverlay();
const inviteModal = overlay.create(InviteToGroup);

const chatMembers = ref<Tables<"group_chatroom_members">[]>([]);
const chatInvitations = ref<Tables<"group_invitations">[]>([]);

const route = useRoute();
const routeChatroomId = computed(() => {
  const params = route.params;
  return params.id as string;
});

async function openDrawer() {
  open.value = true;
}

type Chatroom = Omit<
  Tables<"group_chatrooms_last_activity_current_role">,
  "last_activity"
> & {
  avatarPath: string;
  avatarUrl: string;
};

async function uploadAvatar(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) {
    newAvatarObjectUrl.value = URL.createObjectURL(file);
    showAvatarCroppingModal.value = true;
  }
}

const avatarPath = `${routeChatroomId.value}.jpg`;

async function getChatroomAvatarUrl() {
  const { data, error } = await supabase.storage
    .from("chatroom_avatars")
    .createSignedUrl(avatarPath, 60);

  if (error) {
    logStorageError(error, "signed avatar url");
    operationFeedbackHandler.displayError(
      getStorageErrorMessage(error, "Error creating signed avatar Url")
    );
    return;
  }
  chatroom.value.avatarUrl = data.signedUrl;
}

const chatroom = ref<Chatroom>({
  chatroom_id: routeChatroomId.value,
  name: "Loading name...",
  description: "Loading description...",
  current_user_role: "member",
  avatarPath: avatarPath,
  avatarUrl: "",
});

async function loadChatInfo() {
  const { data, error } = await supabase
    .from("group_chatrooms")
    .select("name, description")
    .eq("chatroom_id", chatroom.value.chatroom_id!)
    .single();

  if (error) {
    logPostgrestError(error, "chat-info fetching");
    operationFeedbackHandler.displayError(
      getPostgrestErrorMessage(error, "Unknown chat-info fetching error")
    );
    return;
  }
  chatroom.value.name = data.name;
  chatroom.value.description = data.description;
}

async function onUploadCroppedAvatar(blob: Blob) {
  showAvatarCroppingModal.value = false;
  newAvatarObjectUrl.value = null;
  const { error } = await supabase.storage
    .from("chatroom_avatars")
    .upload(chatroom.value.avatarPath, blob, {
      upsert: true,
      contentType: "image/jpeg",
      cacheControl: "0",

      headers: {
        "cache-control": "no-cache",
      },
    });
  if (error) {
    logStorageError(error, "avatar upload");
    operationFeedbackHandler.displayError(
      getStorageErrorMessage(error, "Unknown error uploading avatar")
    );
    return;
  } else {
    operationFeedbackHandler.displaySuccess(
      "Your avatar has been updated. You may need to reload the page."
    );
  }
}

async function loadChatMembers() {
  const { data, error } = await supabase
    .from("group_chatroom_members")
    .select("*")
    .eq("chatroom_id", chatroom.value.chatroom_id!);

  if (error) {
    logPostgrestError(error, "members fetching");
    operationFeedbackHandler.displayError(
      getPostgrestErrorMessage(error, "Unknown members fetching error")
    );
    return;
  }
  data.forEach((element) => {
    chatMembers.value.push(element);
  });
}

async function loadChatInvitations() {
  const { data, error } = await supabase
    .from("group_invitations")
    .select("*")
    .eq("chatroom_id", chatroom.value.chatroom_id!);

  if (error) {
    logPostgrestError(error, "invitations fetching");
    operationFeedbackHandler.displayError(
      getPostgrestErrorMessage(error, "Unknown invitations fetching error")
    );
    return;
  }
  data.forEach((element) => {
    chatInvitations.value.push(element);
  });
}

async function onInviteUser() {
  inviteModal.open({
    presetGroup: {
      chatroom_id: chatroom.value.chatroom_id!,
      name: chatroom.value.name,
      current_user_role: chatroom.value.current_user_role,
    },
  });
}

onMounted(() => {
  loadChatInfo();
  loadChatMembers();
  loadChatInvitations();
  getChatroomAvatarUrl();
});
</script>

<style>
@import url("~/assets/css/chatInfo.css");
</style>
