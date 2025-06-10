<template>
  <NuxtLayout name="logged-in">
    <div class="flex flex-col justify-center items-center pt-5">
      <div class="glassContainer w-[41rem] max-w-[90%] md:max-w-[70%]">
        <UCard
          class="ring-0 bg-transparent h-full"
          :ui="{ header: 'border-none', body: 'pt-2 sm:pt-2' }"
        >
          <template #header>
            <div class="font-bold text-black dark:text-white text-xl text-center">
              {{ profileTitle }}
            </div>
          </template>

          <!-- Loading state -->
          <div v-if="loading" class="flex flex-col gap-y-10">
            <USkeleton class="w-32 h-32 rounded-full self-center" />
            <USkeleton class="h-3 w-[80%]" />
            <USkeleton class="h-3 w-[70%]" />
            <USkeleton class="h-3 w-[100%]" />
          </div>

          <!-- Profile content -->
          <div v-else-if="!loading && profileData">
            <div class="flex flex-col items-center">
              <EditableAvatar
                :src="profileData.avatarUrl"
                bucket-name="avatars"
                :filepath="userData.avatarPath"
                default-icon="i-lucide-user"
                :editable="isOwnProfile"
                :clearable="isOwnProfile"
              />
            </div>
            <div v-if="!isOwnProfile" class="w-full flex flex-row items-center justify-center gap-4 md:gap-6 mt-4">
              <UButton label="Chat" icon="i-lucide-message-circle" @click="onChatWithUser" />
              <UButton label="Invite" icon="i-lucide-user-round-plus" @click="onInviteUser" />
            </div>
            <div class="profile-container mt-2 md:mt-0">
              <div class="section-container">
                <div :class="`flex mb-2 text-md ${themedSectionLabelClasses}`">
                  <div class="self-center">Display Name</div>
                  <HelpTooltip
                    text="The primary name shown to other users."
                    class="self-center"
                  />
                  <div class="grow" />
                  <UButton
                    v-if="isOwnProfile"
                    :icon="isEditingName ? 'i-lucide-x' : 'i-lucide-pencil'"
                    size="lg"
                    variant="ghost"
                    color="neutral"
                    class="cursor-pointer self-center"
                    @click="toggleEditDisplayName"
                  />
                  <UButton
                    v-if="isOwnProfile && isEditingName"
                    :disabled="!displayNameChanged || !displayNameValid"
                    class="ml-2 self-center"
                    @click="saveDisplayName"
                  >
                    Save
                  </UButton>
                </div>
                <div :class="`py-1 border-b-1 ${themedProfileFieldClasses}`">
                  <div class="field-content">
                    <div
                      v-if="!isEditingName"
                      :class="`${
                        isFalsy(profileData.displayname)
                          ? themedWeakColor
                          : themedTextsColor
                      }`"
                    >
                      {{
                        isFalsy(profileData.displayname)
                          ? profileData.username
                          : profileData.displayname
                      }}
                    </div>
                    <UInput
                      v-else
                      id="displayNameInput"
                      v-model="newDisplayName"
                      :maxlength="userLimits.displayname"
                      size="xl"
                      variant="ghost"
                      class="edit-input"
                      autofocus
                      @vue:mounted="attachDisplayNameInputEnterHandler"
                    />
                  </div>
                  <div
                    v-if="isEditingName && !displayNameValid"
                    class="text-sm text-error mt-2"
                  >
                    {{ displayNameErrorMessage }}
                  </div>
                </div>
              </div>
              <div class="section-container">
                <div
                  :class="`flex align-center mb-2 text-md ${themedSectionLabelClasses}`"
                >
                  <div class="self-center">Description</div>
                  <HelpTooltip
                    :text="isOwnProfile ? 'Tell other users about you!' : 'Some info about the user'"
                    class="self-center"
                  />
                  <div class="grow" />
                  <UButton
                    v-if="isOwnProfile"
                    :icon="
                      isEditingDescription ? 'i-lucide-x' : 'i-lucide-pencil'
                    "
                    size="lg"
                    variant="ghost"
                    color="neutral"
                    class="cursor-pointer self-center"
                    @click="toggleEditDescription"
                  />
                  <UButton
                    v-if="isOwnProfile && isEditingDescription"
                    :disabled="!descriptionChanged"
                    class="ml-2 self-center"
                    @click="saveDescription"
                  >
                    Save
                  </UButton>
                </div>
                <div :class="`py-1 border-b-1 ${themedProfileFieldClasses}`">
                  <div
                    :class="`field-content ${
                      showDescriptionLengthIndicator
                        ? 'border-l-2 border-l-neutral-400 pl-2'
                        : ''
                    }`"
                  >
                    <div
                      v-if="!isOwnProfile || !isEditingDescription"
                      :class="`whitespace-pre-line wrap-anywhere ${
                        isFalsy(profileData.description)
                          ? themedWeakColor
                          : themedTextsColor
                      }`"
                    >
                      {{
                        isFalsy(profileData.description)
                          ? "Empty"
                          : profileData.description
                      }}
                    </div>
                    <UTextarea
                      v-else
                      v-model="newDescription"
                      :maxlength="userLimits.description"
                      size="xl"
                      variant="ghost"
                      class="edit-input"
                      autofocus
                      autoresize
                      :rows="descriptionRowCount"
                    />
                  </div>
                </div>
              </div>
              <ULink
                v-if="isOwnProfile"
                to="/settings/account"
                class="flex items-center mt-4"
              >
                <div>Go To Account Settings</div>
                <UIcon name="i-lucide-arrow-right" class="ml-1" />
              </ULink>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { userLimits } from "~~/validation/commonLimits";
import { displayNameSchema } from "~~/validation/schemas/input/inputUserSchemas";
import type { UserData } from "~/composables/useUserData";
import { getAuthErrorMessage, logAuthError } from "~~/errors/authErrors";
import { logPostgrestError } from "~~/errors/postgrestErrors";
import InviteToGroup from "~/components/Modal/Chatroom/InviteToGroup.vue";

type ProfileUserData = Pick<
  UserData,
  "avatarUrl" | "avatarPath" | "username" | "displayname" | "description" | "id"
>;

const route = useRoute();
const supabase = useSupabaseClient();
const userData = useUserData();
const operationFeedbackHandler = useOperationFeedbackHandler();
const { isLight } = useSSRSafeTheme();
const overlay = useOverlay();
const inviteModal = overlay.create(InviteToGroup);

// get username from url
const routeUsername = computed(() => {
  const params = route.params;
  return params.username as string;
});
const isOwnProfile = computed(() => routeUsername.value === userData.username);

const profileData = ref<ProfileUserData | null>(null);
const loading = ref(true);
const profileTitle = computed(() =>
  loading.value
    ? "Loading..."
    : (profileData.value?.username ?? 'User Profile')
);

const isEditingName = ref(false);
const newDisplayName = ref("");
const displayNameChanged = computed(
  () => userData.displayname !== newDisplayName.value
);
const isEditingDescription = ref(false);
const newDescription = ref("");
const descriptionChanged = computed(
  () => userData.description !== newDescription.value
);

const descriptionRowCount = computed(() =>
  profileData.value?.description
    ? (profileData.value.description.match(/\n/g) || "").length + 1
    : 1
);
const displayNameSanitized = computed(() =>
  isFalsy(newDisplayName.value) ? null : newDisplayName.value.trim()
);
const displayNameParsed = computed(() =>
  displayNameSchema.safeParse(displayNameSanitized.value)
);
const displayNameValid = computed(() => displayNameParsed.value.success);
const displayNameErrorMessage = computed(
  () => displayNameParsed.value.error?.issues[0]?.message ?? "Invalid Format"
);

const descriptionSanitized = computed(() =>
  isFalsy(newDescription.value) ? null : newDescription.value.trim()
);

const themedProfileFieldClasses = computed(() =>
  isLight.value ? "border-b-primary-600" : "border-b-primary-300"
);
const themedSectionLabelClasses = computed(() =>
  isLight.value ? "text-primary-900" : "text-primary-400"
);
const themedWeakColor = computed(() =>
  isLight.value ? "text-neutral-500" : "text-neutral-400"
);
const themedTextsColor = computed(() =>
  isLight.value ? "text-neutral-900" : "text-neutral-100"
);

const showDescriptionLengthIndicator = computed(
  () => !isEditingDescription.value && descriptionRowCount.value >= 10
);

async function loadUserProfile(username: string) {
  loading.value = true;

  // If it's the current user, get data from user's metadata
  if (isOwnProfile.value) {
    watch(
      userData,
      (newUserData) => {
        profileData.value = {
          avatarUrl: newUserData.avatarUrl,
          avatarPath: newUserData.avatarPath,
          username: newUserData.username,
          displayname: newUserData.displayname,
          description: newUserData.description,
          id: newUserData.id,
        };
      },
      {
        immediate: true,
      }
    );
  } else {
    // Fetch other user's profile from database
    const { data, error: dbError } = await supabase
      .from("profiles")
      .select("user_id, displayname, description")
      .eq("username", username)
      .single();

    if (dbError) {
      logPostgrestError(dbError, "profile loading");
    }

    if(!data){
      showError({
        statusCode: 404,
        message: "The user you searched for was not found",
        data: {
          headline: 'Who\'s that?',
        },
      });
      return;
    }

    const avatarPath = getAvatarPath(data.user_id);
    const avatarUrl = getAvatarUrl(data.user_id);

    profileData.value = {
      id: data.user_id,
      username,
      displayname: data.displayname,
      description: data.description,
      avatarPath,
      avatarUrl,
    };
  }
  loading.value = false;
}

async function updateProfileData(
  data: Partial<{ displayname: string | null; description: string | null }>
) {
  const { error } = await supabase.auth.updateUser({ data });
  if (error) {
    logAuthError(error, "profile update");
    operationFeedbackHandler.displayError(
      getAuthErrorMessage(error, "Could not update profile data.")
    );
  } else {
    operationFeedbackHandler.displaySuccess("Updated profile.");
  }
}

async function toggleEditDisplayName() {
  isEditingName.value = !isEditingName.value;
  if (isEditingName.value) newDisplayName.value = userData.displayname || "";
}
async function saveDisplayName() {
  userData.displayname = displayNameParsed.value.data ?? null;
  isEditingName.value = false;
  updateProfileData({ displayname: userData.displayname });
}
async function toggleEditDescription() {
  isEditingDescription.value = !isEditingDescription.value;
  if (isEditingDescription.value)
    newDescription.value = userData.description || "";
}
async function saveDescription() {
  userData.description = descriptionSanitized.value ?? null;
  isEditingDescription.value = false;
  updateProfileData({ description: userData.description });
}

async function attachDisplayNameInputEnterHandler() {
  document
    .getElementById("displayNameInput")
    ?.addEventListener("keyup", (e: KeyboardEvent) => {
      if (e.code === "Enter") saveDisplayName();
    });
}

async function onInviteUser() {
  if (!profileData.value) return;
  inviteModal.open({
    presetInvitations: [{
      user_id: profileData.value.id,
      username: profileData.value.username,
      displayname: profileData.value.displayname,
      asRole: 'member',
    }],
  });
}
onMounted(() => {
  loadUserProfile(routeUsername.value);
});
</script>

<style>
@import url("~/assets/css/profile.css");
</style>