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
              {{ chatroom.displayname }}
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
              <div class="flex max-h-fit flex-col items-center">
                <UAvatar class="mb-1" src="https://github.com/nuxt.png" />
                <UBadge size="xs" class="font-bold rounded-full">{{
                  member.role
                }}</UBadge>
              </div>
              <div class="flex flex-col px-[0.6rem]">
                <p class="truncate w-full flex font-bold">
                  {{ member.displayname }}
                </p>
                <p class="line-clamp-2 w-full leading-none">
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
              <UButton class="flex size-fit" size="xl" icon="i-lucide-plus"
                >Invite member</UButton
              >
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
                  class="ring-0 glassContainer text-neutral-700 dark:text-white member invitation"
                >
                  <UAvatar
                    class="justify-self-center"
                    src="https://github.com/nuxt.png"
                  />
                  <div
                    class="flex flex-col items-center justify-center truncate px-[0.6rem]"
                  >
                    <div class="truncate w-full text-center">
                      Peterskotstube wrkegjtlwkjertlwkejrce
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
              class="ring-0 glassContainer text-neutral-700 dark:text-white member invitation"
            >
              <UAvatar
                class="justify-self-center"
                src="https://github.com/nuxt.png"
              />
              <div
                class="flex flex-col items-center justify-center truncate px-[0.6rem]"
              >
                <div class="truncate w-full text-center">
                  Peterskotstube wrkegjtlwkjertlwkejrce
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

import type { Tables } from "~~/database.types";

const { isLight } = useSSRSafeTheme();

const operationFeedbackHandler = useOperationFeedbackHandler();
const open = ref(false);
const newAvatarObjectUrl = ref<string | null>(null);
const showAvatarCroppingModal = ref(false);
const supabase = useSupabaseClient();

const chatMembers = ref<Tables<"group_chatroom_members">[]>([]);

const route = useRoute();
const routeChatroomId = computed(() => {
  const params = route.params;
  return params.id as string;
});

async function openDrawer() {
  open.value = true;
}

type Chatroom = {
  id: string;
  displayname: string | null;
  description: string | null;
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

async function getAvatarUrl() {
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
  id: routeChatroomId.value,
  displayname: "Loading name...",
  description: "Loadind description...",
  avatarPath: avatarPath,
  avatarUrl: "",
});

async function loadChatInfo() {
  const { data, error } = await supabase
    .from("group_chatrooms")
    .select("name, description")
    .eq("chatroom_id", chatroom.value.id)
    .single();

  if (error) {
    logPostgrestError(error, "chat-info fetching");
    operationFeedbackHandler.displayError(
      getPostgrestErrorMessage(error, "Unknown chat-info fetching error")
    );
    return;
  }
  chatroom.value.displayname = data.name;
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
    .eq("chatroom_id", chatroom.value.id);

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
  console.log(chatMembers.value);
}

onMounted(() => {
  loadChatInfo();
  loadChatMembers();
  getAvatarUrl();
});
</script>

<style>
@import url("~/assets/css/chatInfo.css");
</style>
