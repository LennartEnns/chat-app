<template>
  <UApp>
    <NuxtLayout name="logged-in" :class="`${isLight ? 'base' : false}`">
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 h-full">
        <!-- Chat Info Column-->
        <div class="flex flex-col items-center p-5 overflow-hidden">
          <div class="pt-10 pb-5">
            <div class="h-70 w-70 md:h-50 md:w-50">
              <div class="relative h-70 w-70 md:h-50 md:w-50">
                <EditableAvatar
                  :src="chatroom.avatarUrl"
                  bucket-name="chatroom_avatars"
                  :filepath="chatroom.avatarPath"
                  default-icon="i-lucide-user"
                  :editable="editMode"
                  :clearable="editMode"
                  styling="border-2 border-defaultNeutral-700 size-full"
                  rootStyling="relative h-70 w-70 md:h-50 md:w-50"
                  iconStyling="border-2 border-defaultNeutral-700 size-full"
                />
              </div>
            </div>
          </div>
          <div class="py-5 flex flex-row">
            <p
              v-if="!isEditingName"
              class="text-[40px] font-bold text-neutral-700 dark:text-white"
            >
              {{ chatroom.name }}
            </p>
            <UInput
              v-if="isEditingName && editMode"
              size="xl"
              class="flex w-fit"
              v-model="newName"
            />
            <UButton
              v-if="editMode"
              :icon="isEditingName ? 'i-lucide-x' : 'i-lucide-pen'"
              size="xl"
              variant="ghost"
              color="neutral"
              class="cursor-pointer self-center"
              @click="toggleEditName"
            />
            <UButton
              v-if="editMode && isEditingName"
              size="xl"
              class="ml-2 self-center"
              @click="updateGroupName"
            >
              Save
            </UButton>
          </div>
          <div class="py-5 text-center text-neutral-700 dark:text-white">
            <p
              v-if="!isEditingDescription"
              :class="`font-bold pb-5 ${themedSectionLabelClasses}`"
            >
              Description
            </p>
            <div class="flex flex-row place-content-between">
              <p
                v-if="isEditingDescription"
                :class="`font-bold pb-5 ${themedSectionLabelClasses}`"
              >
                Description
              </p>
              <div class="flex flex-row size-fit">
                <UButton
                  v-if="editMode"
                  :icon="isEditingDescription ? 'i-lucide-x' : 'i-lucide-pen'"
                  size="sm"
                  variant="ghost"
                  color="neutral"
                  class="cursor-pointer self-center"
                  @click="toggleEditDescription"
                />
                <UButton
                  v-if="editMode && isEditingDescription"
                  size="sm"
                  class="ml-2 self-center"
                  @click="updateGroupDescription()"
                >
                  Save
                </UButton>
              </div>
            </div>
            <UTextarea
              v-if="isEditingDescription && editMode"
              class="w-90 md:w-65 lg:w-70"
              color="primary"
              :rows="8"
              :maxrows="8"
              :maxLength="255"
              autoresize
              v-model="newDescription"
              variant="outline"
              placeholder="Tell the world what this group is about..."
            />
            <p
              v-if="!isEditingDescription"
              class="w-full whitespace-pre-line wrap-anywhere"
            >
              {{ chatroom?.description || "No Description" }}
            </p>
          </div>
        </div>
        <!-- Members Column-->
        <div
          class="flex flex-col items-center p-5 col-span-2 relative border border-defaultNeutral-700 border-l-0 border-r-0 md:border-t-0 md:border-b-0 md:border-l lg:border-t-0 lg:border-b-0 lg:border-r lg:p-0"
        >
          <div class="pb-5 text-neutral-700 dark:text-white">
            <p :class="`font-bold ${themedSectionLabelClasses}`">Members</p>
            <UButton
              class="flex size-fit absolute top-0 right-5 mt-3 md:mt-0"
              size="md"
              icon="i-lucide-user-plus"
              @click="onInviteUser"
            />
          </div>
          <div class="flex flex-wrap justify-center gap-3 p-5">
            <div
              v-for="(member, index) in chatMembers"
              :key="index"
              class="ring-0 glassContainer text-neutral-700 dark:text-white member relative"
            >
              <UButton
                v-if="member.role != 'admin' && editMode"
                icon="i-lucide-minus"
                size="xs"
                class="size-fit absolute right-1 top-1"
                @click="removeMember(index, member.user_id)"
              />
              <div class="flex flex-col items-center w-max">
                <UAvatar
                  class="mb-1 w-11 h-11"
                  icon="i-lucide-user"
                  :src="
                    (member.user_id && getAvatarUrl(member.user_id)) ||
                    undefined
                  "
                />
                <div>
                  <UBadge
                    v-if="!editMode"
                    class="font-bold rounded-full cursor-pointer"
                    :color="getColor(member.role)"
                    :ui="{
                      base: 'max-w-11 h-5 w-11 text-[10px] flex justify-center',
                    }"
                  >
                    {{ member.role }}
                  </UBadge>
                  <USelect
                    v-if="editMode && member.role != 'admin'"
                    trailing-icon=""
                    variant="outline"
                    v-model="chatMembers[index]!.role!"
                    :items="availableRoles"
                    @change="() => handleRoleChange(index)"
                  >
                    <!-- Trigger: badge showing current role -->
                    <template #default="{ open }">
                      <UBadge
                        class="font-bold rounded-full cursor-pointer"
                        :color="getColor(member.role)"
                        :ui="{
                          base: 'max-w-11 w-11 h-5 text-[10px] flex justify-center',
                        }"
                      >
                        {{ member.role }}
                      </UBadge>
                    </template>

                    <!-- Dropdown items: badges -->
                    <template #item="{ item }">
                      <UBadge
                        class="font-bold rounded-full"
                        :color="getColor(item)"
                        :ui="{
                          base: 'max-w-11 h-5 text-[10px] flex justify-center w-full',
                        }"
                      >
                        {{ item }}
                      </UBadge>
                    </template>
                  </USelect>
                </div>
              </div>
              <div class="flex flex-col justify-center px-[0.6rem] min-w-0">
                <p class="truncate font-bold">
                  <NuxtLink :to="`/profile/${member.username}`">{{
                    member.name
                  }}</NuxtLink>
                </p>
                <p class="line-clamp-2 leading-4">
                  {{ member.description ?? "Hey there! I am using YapSpace." }}
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
                v-if="!editMode"
                class="flex size-fit"
                size="xl"
                icon="i-lucide-pencil-line"
                @click="toggleEdit"
              >
                Edit Group
              </UButton>
              <UButton
                v-if="editMode"
                color="error"
                class="flex size-fit"
                size="xl"
                icon="i-lucide-x"
                @click="toggleEdit"
              >
                Close
              </UButton>
            </div>
          </div>
        </div>
        <!-- Invitations Column-->
        <UDrawer
          :handle="false"
          direction="right"
          v-model:open="open"
          class="hidden md:block lg:hidden"
        >
          <template #body>
            <div class="flex flex-col items-center px-5">
              <InvitationColumn
                :invitations="chatInvitations"
                :editBoolean="editMode"
                :text-theme="themedSectionLabelClasses"
              />
            </div>
          </template>
        </UDrawer>
        <div class="flex flex-col items-center px-5 lg:block md:hidden">
          <InvitationColumn
            :invitations="chatInvitations"
            :editBoolean="editMode"
            :text-theme="themedSectionLabelClasses"
          />
          <div class="md:hidden p-10">
            <UButton
              v-if="!editMode"
              class="flex size-fit"
              size="xl"
              icon="i-lucide-pencil-line"
              @click="toggleEdit"
            >
              Edit Group
            </UButton>
            <UButton
              v-if="editMode"
              color="error"
              class="flex size-fit"
              size="xl"
              icon="i-lucide-x"
              @click="toggleEdit"
            >
              Close
            </UButton>
          </div>
        </div>
      </div>
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
import {
  getPostgrestErrorMessage,
  logPostgrestError,
} from "~~/errors/postgrestErrors";

import InviteToGroup from "~/components/Modal/Chatroom/InviteToGroup.vue";
import InvitationColumn from "~/components/ChatInfo/InvitationColumn.vue";
import type { Enums, Tables } from "~~/database.types";
import type { NonEmptyArray } from "~/types/tsUtils/helperTypes";

const { isLight } = useSSRSafeTheme();

const operationFeedbackHandler = useOperationFeedbackHandler();
const open = ref(false);
const supabase = useSupabaseClient();

const overlay = useOverlay();
const inviteModal = overlay.create(InviteToGroup);

const chatMembers = ref<Tables<"group_chatroom_members">[]>([]);

type ChatInvitation = Pick<
  Tables<"group_invitations_preview">,
  "id" | "invitee_id" | "as_role" | "invitee_username"
>;

const availableRoles: NonEmptyArray<Enums<"chatroom_role">> = [
  "member",
  "admin",
  "mod",
  "viewer",
];

const chatInvitations = ref<ChatInvitation[]>([]);

const themedSectionLabelClasses = computed(() =>
  isLight.value ? "text-primary-900" : "text-primary-400"
);

const editMode = ref<boolean>(false);
const isEditingDescription = ref<boolean>();
const isEditingName = ref<boolean>(false);

const route = useRoute();
const routeChatroomId = computed(() => {
  const params = route.params;
  return params.id as string;
});

async function openDrawer() {
  open.value = true;
}

async function toggleEdit() {
  editMode.value = !editMode.value;
  toggleEditDescription();
  toggleEditName();
}

async function toggleEditDescription() {
  isEditingDescription.value = !isEditingDescription.value;
}

async function toggleEditName() {
  isEditingName.value = !isEditingName.value;
}

const newDescription = ref<string | null>();
const newName = ref<string>();

type Chatroom = Omit<
  Tables<"group_chatrooms_last_activity_current_role">,
  "last_activity" | "avatarUrl"
> & {
  avatarPath: string;
  avatarUrl: Ref<string | undefined>;
};

const avatarPath = `${routeChatroomId.value}.jpg`;

const chatroom = ref<Chatroom>({
  chatroom_id: routeChatroomId.value,
  name: "Loading name...",
  description: "Loading description...",
  current_user_role: "member",
  avatarPath: avatarPath,
  avatarUrl: useCachedSignedImageUrl("chatroom_avatars", avatarPath, false),
});

async function updateGroupDescription() {
  toggleEdit();
  if (newDescription.value != chatroom.value.description) {
    chatroom.value.description = newDescription.value!;
    const { error } = await supabase
      .from("group_chatrooms")
      .update({ description: newDescription.value })
      .eq("chatroom_id", chatroom.value.chatroom_id!);
    if (error) {
      logPostgrestError(error, "chatroom update");
      operationFeedbackHandler.displayError(
        getPostgrestErrorMessage(
          error,
          "Could not update chatroom description."
        )
      );
    } else {
      operationFeedbackHandler.displaySuccess("Updated chatroom description.");
    }
  }
}

async function updateGroupName() {
  toggleEdit();
  if (newName.value != chatroom.value.name) {
    chatroom.value.name = newName.value!;
    const { error } = await supabase
      .from("group_chatrooms")
      .update({ name: newName.value })
      .eq("chatroom_id", chatroom.value.chatroom_id!);
    if (error) {
      logPostgrestError(error, "chatroom update");
      operationFeedbackHandler.displayError(
        getPostgrestErrorMessage(error, "Could not update chatroom name.")
      );
    } else {
      operationFeedbackHandler.displaySuccess("Updated chatroom name.");
    }
  }
}

const { data: chatroomInfoData } = await useAsyncData(
  "chatroomInfoData",
  async () => {
    return await loadChatInfo();
  }
);
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
    return null;
  }
  return data;
}

watch(
  chatroomInfoData,
  (data) => {
    if (!data) {
      return;
    }
    chatroom.value.name = data.name;
    chatroom.value.description = data.description;
    newDescription.value = chatroom.value.description;
    newName.value = chatroom.value.name;
  },
  {
    immediate: true,
  }
);

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
  chatMembers.value.sort((a, b) => a.role!.localeCompare(b.role!));
}

async function loadChatInvitations() {
  const { data, error } = await supabase
    .from("group_invitations_preview")
    .select("id, invitee_id, as_role, invitee_username")
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

async function removeMember(index: number, user_id: string | null) {
  chatMembers.value = chatMembers.value.toSpliced(index, 1);
  const { error } = await supabase
    .from("user_to_group")
    .delete()
    .eq("user_id", user_id!);
  if (error) {
    logPostgrestError(error, "member removal");
    operationFeedbackHandler.displayError(
      getPostgrestErrorMessage(error, "Could not remove user from chatroom.")
    );
  } else {
    operationFeedbackHandler.displaySuccess("Removed user from chatroom.");
  }
}

async function handleRoleChange(index: number) {
  const { error } = await supabase
    .from("user_to_group")
    .update({ role: chatMembers.value[index]?.role! })
    .eq("user_id", chatMembers.value[index]?.user_id!);
  if (error) {
    logPostgrestError(error, "role update");
    operationFeedbackHandler.displayError(
      getPostgrestErrorMessage(error, "Could not update member role.")
    );
  } else {
    operationFeedbackHandler.displaySuccess("Updated member role.");
  }
}

onMounted(() => {
  loadChatMembers();
  loadChatInvitations();
});
</script>

<style>
@import url("~/assets/css/chatInfo.css");
</style>
