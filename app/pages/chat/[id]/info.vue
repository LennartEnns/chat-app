<template>
  <UApp>
    <NuxtLayout name="logged-in">
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 h-full">
        <div class="flex flex-col items-center p-5">
          <EditableAvatar 
            :src="avatarUrl"
            bucket-name="chatroom_avatars"
            :filepath="avatarPath"
            default-icon="i-lucide-users-round"
            :editable="false"
            :clearable="false"
          />
          <div class="py-5">
            <p class="text-[20px]">{{ chatroom.name }}</p>
          </div>
          <div class="py-5 text-center">
            {{ chatroom?.description || "No Description" }}
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
                    label="Invitations"
                    leading-icon="i-lucide-chevron-left"
                    color="primary"
                    @click="invitationsDrawerOpen = true"
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
          v-model:open="invitationsDrawerOpen"
          direction="right"
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
                  <UButton icon="i-lucide-trash-2" class="size-fit" />
                </div>
              </div>
            </div>
          </template>
        </UDrawer>
        <div class="flex flex-col items-center px-5 md:hidden lg:block">
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
              <UButton icon="i-lucide-trash-2" class="size-fit" />
            </div>
          </div>
        </div>
      </div>
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
import { logPostgrestError } from "~~/errors/postgrestErrors";
import type { Tables } from "~~/database.types";

const supabase = useSupabaseClient();
const route = useRoute();

const invitationsDrawerOpen = ref(false);

const routeChatroomId = computed(() => {
  const params = route.params;
  return params.id as string;
});

type GroupChatroom = Tables<'group_chatrooms'>;

const avatarPath = getGroupAvatarPath(routeChatroomId.value);
const avatarUrl = useCachedSignedImageUrl('chatroom_avatars', avatarPath);

const chatroom = ref<GroupChatroom>({
  chatroom_id: routeChatroomId.value,
  name: "Loading name...",
  description: "Loading description...",
});

async function loadChatInfo() {
  const { data, error } = await supabase
    .from("group_chatrooms")
    .select("name, description")
    .eq("chatroom_id", chatroom.value.chatroom_id)
    .single();

  if (error) {
    logPostgrestError(error, "info fetching");
  }
  if (!data) {
    showError({
      statusCode: 404,
      message: "The chatroom you searched for was not found",
      data: {
        headline: 'No Yapping Here!',
      },
    });
    return;
  }
  chatroom.value.name = data.name;
  chatroom.value.description = data.description;
}

onMounted(() => {
  loadChatInfo();
});
</script>

<style>
@import url("~/assets/css/chatInfo.css");
</style>
