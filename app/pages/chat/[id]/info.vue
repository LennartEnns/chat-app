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
                  root-styling="relative h-70 w-70 md:h-50 md:w-50"
                  icon-styling="border-2 border-defaultNeutral-700 size-full"
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
              v-model="newName"
              size="xl"
              class="flex w-fit"
            />
            <UButton
              v-if="editMode && chatroom.current_user_role == 'admin'"
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
                  v-if="editMode && chatroom.current_user_role == 'admin'"
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
              v-model="newDescription"
              class="w-90 md:w-65 lg:w-70"
              color="primary"
              :rows="8"
              :maxrows="8"
              :max-length="255"
              autoresize
              variant="outline"
              placeholder="Tell the world what this group is about..."
            />
            <p
              v-if="!isEditingDescription"
              :class="`w-full whitespace-pre-line wrap-anywhere ${
                isFalsy(chatroom.description) ? 'text-muted' : ''
              }`"
            >
              {{ chatroom.description || "No Description" }}
            </p>
            <UButton
              class="mt-5"
              color="error"
              :label="
                editMode && chatroom.current_user_role === 'admin'
                  ? 'Delete Group'
                  : 'Leave Group'
              "
              @click="handleDeleteLeave"
            />
          </div>
        </div>
        <!-- Members Column-->
        <div
          class="flex flex-col items-center p-5 col-span-2 relative border border-defaultNeutral-700 border-l-0 border-r-0 md:border-t-0 md:border-b-0 md:border-l lg:border-t-0 lg:border-b-0 lg:border-r lg:p-0"
        >
          <div class="text-neutral-700 dark:text-white">
            <p :class="`font-bold ${themedSectionLabelClasses}`">Members</p>
            <UButton
              v-if="
                chatroom.current_user_role == 'admin' ||
                chatroom.current_user_role == 'mod'
              "
              class="flex size-fit absolute top-0 right-5 mt-3 md:mt-0"
              size="md"
              icon="i-lucide-user-plus"
              @click="onInviteUser"
            />
          </div>
          <div class="flex flex-wrap justify-center gap-3 p-5">
            <div
              v-for="(member, index) in chatMembers"
              @click="goToProfile(member)"
              :key="index"
              class="ring-0 glassContainer text-neutral-700 dark:text-white member relative"
            >
              <UButton
                v-if="
                  editMode &&
                  chatroom.current_user_role === 'admin' &&
                  member.role !== 'admin'
                "
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
                    :color="chatroomRolesVis[member.role].color"
                    :ui="{
                      base: 'max-w-11 h-5 w-11 text-[10px] flex justify-center',
                    }"
                  >
                    {{ chatroomRolesVis[member.role].label }}
                  </UBadge>
                  <USelect
                    v-if="editMode && ChangeAllowed(member)"
                    v-model="chatMembers[index]!.role"
                    trailing-icon=""
                    variant="outline"
                    :items="availableRoles"
                    @change="() => handleRoleChange(index)"
                  >
                    <!-- Trigger: badge showing current role -->
                    <template #default>
                      <UBadge
                        class="font-bold rounded-full cursor-pointer"
                        :color="chatroomRolesVis[member.role].color"
                        :ui="{
                          base: 'max-w-11 w-11 h-5 text-[10px] flex justify-center',
                        }"
                      >
                        {{ chatroomRolesVis[member.role].label }}
                      </UBadge>
                    </template>

                    <!-- Dropdown items: badges -->
                    <template #item="{ item }">
                      <UBadge
                        class="font-bold rounded-full"
                        :color="chatroomRolesVis[item].color"
                        :ui="{
                          base: 'max-w-11 w-full h-5 text-[10px] flex justify-center',
                        }"
                      >
                        {{ chatroomRolesVis[item].label }}
                      </UBadge>
                    </template>

                    <template #content-bottom>
                      <UButton
                        icon="i-lucide-circle-help"
                        variant="outline"
                        color="info"
                        class="text-muted flex justify-center"
                        @click="rolesHelpModal.open()"
                      />
                    </template>
                  </USelect>
                </div>
              </div>
              <div class="flex flex-col justify-center px-[0.6rem] min-w-0">
                <p class="truncate font-bold">{{ member.name }}</p>
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
                    color="primary"
                    trailing-icon="i-lucide-chevron-left"
                    @click="openDrawer"
                  />
                </UTooltip>
              </div>
            </div>
            <div class="hidden md:block">
              <UButton
                v-if="!editMode && editAllowed"
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
          v-model:open="drawerOpen"
          :handle="false"
          direction="right"
          class="hidden md:block lg:hidden"
        >
          <template #body>
            <div class="flex flex-col items-center px-5">
              <ChatroomInfoInvitationColumn
                :user_role="chatroom.current_user_role!"
                :invitations="chatInvitations"
                :edit-boolean="editMode"
                :text-theme="themedSectionLabelClasses"
              />
            </div>
          </template>
        </UDrawer>
        <div class="flex flex-col items-center px-5 lg:block md:hidden">
          <ChatroomInfoInvitationColumn
            :user_role="chatroom.current_user_role!"
            :invitations="chatInvitations"
            :edit-boolean="editMode"
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
import RolesInfo from "~/components/Modal/Chatroom/RolesInfo.vue";
import type { Enums, Tables } from "~~/database.types";
import type {
  NonEmptyArray,
  RequireNonNull,
} from "~/types/tsUtils/helperTypes";
import chatroomRolesVis from "~/visualization/chatroomRoles";
import { ModalChatroomDelete, ModalChatroomLeave } from "#components";

type ChatInvitation = Pick<
  Tables<"group_invitations_preview">,
  "id" | "invitee_id" | "as_role" | "invitee_username"
>;
type CRViewNonNullable = RequireNonNull<
  Tables<"group_chatrooms_last_activity_current_role">,
  "chatroom_id" | "name"
>;
type Chatroom = Omit<CRViewNonNullable, "last_activity" | "avatarUrl"> & {
  avatarPath: string;
  avatarUrl: Ref<string | undefined>;
};
type ChatroomMember = RequireNonNull<
  Tables<"group_chatroom_members">,
  "role" | "user_id"
>;

const routeChatroomId = useRouteIdParam() as Ref<string>; // ID will always be given in this route
const { isLight } = useSSRSafeTheme();
const operationFeedbackHandler = useOperationFeedbackHandler();
const supabase = useSupabaseClient();
const lastChatroomState = useState<string | undefined>("lastOpenedChatroomId");

const overlay = useOverlay();
const inviteModal = overlay.create(InviteToGroup);
const rolesHelpModal = overlay.create(RolesInfo);

const drawerOpen = ref(false);
const chatMembers = ref<ChatroomMember[]>([]);

const userData = useUserData();

const router = useRouter();

const availableRoles: NonEmptyArray<Enums<"chatroom_role">> = [
  "admin",
  "mod",
  "member",
  "viewer",
];

const editAllowed = computed(() =>
  chatroom.value.current_user_role == "admin" ||
  chatroom.value.current_user_role == "mod"
    ? true
    : false
);

const chatInvitations = ref<ChatInvitation[]>([]);

const themedSectionLabelClasses = computed(() =>
  isLight.value ? "text-primary-900" : "text-primary-400"
);

const editMode = ref<boolean>(false);
const isEditingDescription = ref<boolean>();
const isEditingName = ref<boolean>(false);

// Save as last opened chatroom in shared state
lastChatroomState.value = routeChatroomId.value;

const notFoundError = {
  statusCode: 404,
  message: "This chatroom does not exist",
  data: {
    headline: "No Yapping Here!",
  },
};
// If the chatroom does not exist, show error page
async function checkExistsChatroom() {
  const { count } = await supabase
    .from("chatrooms")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("id", routeChatroomId.value);
  if (!count) showError(notFoundError);
}
await checkExistsChatroom();

async function openDrawer() {
  drawerOpen.value = true;
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

const avatarPath = `${routeChatroomId.value}.jpg`;

const leaveModal = overlay.create(ModalChatroomLeave);
const DeleteModal = overlay.create(ModalChatroomDelete);

const chatroom = ref<Chatroom>({
  chatroom_id: routeChatroomId.value,
  name: "Loading name...",
  description: "Loading description...",
  current_user_role: "member",
  avatarPath: avatarPath,
  avatarUrl: useCachedSignedImageUrl("chatroom_avatars", avatarPath, false),
});

function ChangeAllowed(member: ChatroomMember) {
  if (
    editMode.value &&
    member.role != "admin" &&
    member.role != chatroom.value.current_user_role &&
    userData.username != member.username
  ) {
    return true;
  }
  return false;
}

async function handleDeleteLeave() {
  if (editMode.value && chatroom.value.current_user_role === "admin") {
    onDeleteChatroom();
  } else {
    onLeaveChatroom();
  }
}

async function goToProfile(member: ChatroomMember) {
  if (!editMode.value) {
    router.push(`/profile/${member.username}`);
  }
}

async function onLeaveChatroom() {
  const instance = leaveModal.open({
    chatroomId: routeChatroomId.value,
  });
  const success = await instance.result;
  if (!success) return;
  navigateTo("/chat");
}

async function onDeleteChatroom() {
  const instance = DeleteModal.open({
    chatroomId: routeChatroomId.value,
  });
  const success = await instance.result;
  if (!success) return;
  navigateTo("/chat");
}

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

const { data: chatroomInfoData } = await useLazyAsyncData(
  "chatroomInfoData",
  async () => {
    return await loadChatInfo();
  }
);
async function loadChatInfo() {
  const { data, error } = await supabase
    .from("group_chatrooms_last_activity_current_role")
    .select("name, description, current_user_role")
    .eq("chatroom_id", chatroom.value.chatroom_id!)
    .single();

  if (error) {
    logPostgrestError(error, "chat-info fetching");
    operationFeedbackHandler.displayError(
      getPostgrestErrorMessage(error, "Could not load chatroom info")
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
    chatroom.value.name = data.name!;
    chatroom.value.description = data.description;
    chatroom.value.current_user_role = data.current_user_role;
    newDescription.value = chatroom.value.description;
    newName.value = chatroom.value.name;
  },
  {
    immediate: true,
  }
);

const { data: chatroomMembers } = await useLazyAsyncData(
  "chatroomMembers",
  async () => {
    return await loadChatMembers();
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
    return null;
  }
  return data;
}
watch(
  chatroomMembers,
  (data) => {
    if (!data) {
      return;
    }
    data.forEach((element) => {
      chatMembers.value.push(element as ChatroomMember);
    });
    chatMembers.value.sort((a, b) => a.role!.localeCompare(b.role!));
  },
  {
    immediate: true,
  }
);

const { data: chatroomInvitations } = await useLazyAsyncData(
  "chatroomInvitations",
  async () => {
    return await loadChatInvitations();
  }
);
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
    return null;
  }
  return data;
}
watch(
  chatroomInvitations,
  (data) => {
    if (!data) {
      return;
    }
    data.forEach((element) => {
      chatInvitations.value.push(element as ChatInvitation);
    });
  },
  {
    immediate: true,
  }
);

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
  if (!chatMembers.value[index]) return;
  const newRole = chatMembers.value[index].role;
  const userId = chatMembers.value[index].user_id;
  const { error } = await supabase
    .from("user_to_group")
    .update({ role: newRole })
    .eq("user_id", userId);
  if (error) {
    logPostgrestError(error, "role update");
    operationFeedbackHandler.displayError(
      getPostgrestErrorMessage(error, "Could not update member role.")
    );
  } else {
    operationFeedbackHandler.displaySuccess("Updated member role.");
  }
}
</script>

<style>
@import url("~/assets/css/chatInfo.css");
</style>
