<template>
  <UApp>
    <NuxtLayout name="logged-in">
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 h-full">
        <div class="flex flex-col items-center p-5">
          <div class="pt-10 pb-5">
            <div class="px-2">
              <UAvatar
                class="border-2 border-defaultNeutral-700"
                src="https://github.com/benjamincanac.png"
                icon="i-lucide-user"
                :ui="{ root: 'size-fit' }"
              />
              <div>
                <UIcon name="i-lucide-camera" size="xx-large" />
                Edit Picture
                <input
                  type="file"
                  style="
                    position: absolute;
                    width: 10%;
                    height: 10%;
                    opacity: 0;
                  "
                  accept="image/*"
                  @change="uploadAvatar"
                />
              </div>
            </div>
            <AvatarUploadCropper
              v-if="newAvatarObjectUrl"
              :image-url="newAvatarObjectUrl"
              @upload="onUploadCroppedAvatar"
            />
          </div>
          <div class="py-5"><p class="text-[20px]">Groupname</p></div>
          <div class="py-5 text-center">
            Description: Hello World! fjsdkjfksdjaf dsjafksjad fs dfjsad jfklj
          </div>
        </div>
        <div
          class="flex flex-col items-center col-span-2 px-5 relative md:border border-defaultNeutral-700 md:border-t-0 md:border-b-0 md:border-r-0 lg:border-t-0 lg:border-b-0 lg:border-r"
        >
          <div class="pb-5 text-neutral-700 dark:text-white">
            <p>Members</p>
          </div>
          <div class="flex flex-wrap justify-center gap-3">
            <div
              class="ring-0 glassContainer text-neutral-700 dark:text-white member"
            >
              <div class="flex max-h-fit flex-col items-center">
                <UAvatar class="mb-1" src="https://github.com/nuxt.png" />
                <UBadge size="xs" class="font-bold rounded-full">Member</UBadge>
              </div>
              <div class="flex flex-col justify-center px-[0.6rem]">
                <p class="truncate w-full flex font-bold">Name Lastname</p>
                <p class="line-clamp-2 w-full leading-none">
                  User messages are now saved to the database and loaded on
                  page-reload.
                </p>
              </div>
            </div>
            <div
              class="ring-0 glassContainer text-neutral-700 dark:text-white member"
            >
              <div class="flex max-h-fit flex-col items-center">
                <UAvatar class="mb-1" src="https://github.com/nuxt.png" />
                <UBadge size="xs" class="font-bold rounded-full">Member</UBadge>
              </div>
              <div class="flex flex-col justify-center px-[0.6rem]">
                <p class="truncate w-full flex font-bold">Name Lastname</p>
                <p class="line-clamp-2 w-full leading-none">
                  User messages are now saved to the database and loaded on
                  page-reload.
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
                <p>Invitations</p>
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
            <p>Invitations</p>
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

const operationFeedbackHandler = useOperationFeedbackHandler();
const open = ref(false);
const newAvatarObjectUrl = ref<string | null>(null);
const showAvatarCroppingModal = ref(false);
const supabase = useSupabaseClient();

async function openDrawer() {
  open.value = true;
}

type chat = {
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

const avatarPath = `public/c1714e5d-2c75-4efa-9f89-3820525bdfa8.jpg`;
const avatarUrlData = supabase.storage
  .from("room_avatars")
  .getPublicUrl(avatarPath);
const avatarUrl = avatarUrlData.data.publicUrl;

const chatroom: chat = {
  id: "fdfs",
  displayname: "Chatroom 001",
  description:
    "This is a demo chatroom hey ho just some plain text to fil the lines",
  avatarPath,
  avatarUrl,
};

async function onUploadCroppedAvatar(blob: Blob) {
  showAvatarCroppingModal.value = false;
  newAvatarObjectUrl.value = null;
  const { error } = await supabase.storage
    .from("chatroom_avatars")
    .upload(chatroom.avatarPath, blob, {
      upsert: true,
      contentType: "image/jpeg",
      cacheControl: "0",

      // Kind of unnecessary next to max-age=0, but better be on the safe side ;)
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
</script>

<style>
@import url("~/assets/css/chatInfo.css");
</style>
