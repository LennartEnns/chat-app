<template>
  <NuxtLayout name="logged-in">
    <div class="flex justify-center align-middle">
      <div class="glassContainer w-[41rem] max-w-[90%] md:max-w-[70%]">
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
        <UCard
          class="ring-0 bg-transparent h-full"
          :ui="{ header: 'border-none' }"
        >
          <template #header>
            <p class="font-bold text-black dark:text-white text-xl text-center">
              {{ profileTitle }}
            </p>
          </template>

          <!-- Loading state -->
          <div v-if="loading" class="flex justify-center items-center py-8">
            <UIcon name="i-lucide-loader-2" class="animate-spin" size="2xl" />
            <span class="ml-2">Loading profile...</span>
          </div>

          <!-- Profile content -->
          <div v-else-if="!loading && profileData">
            <div class="avatar">
              <div class="avatar-container">
                <UAvatar
                  class="border-2"
                  :src="
                    isOwnProfile && !existsOwnAvatar
                      ? undefined
                      : profileData.avatarUrl
                  "
                  icon="i-lucide-user"
                  :ui="{ root: 'size-35', icon: 'size-11/12' }"
                />
                <div v-if="isOwnProfile" class="avatar-overlay">
                  <UIcon name="i-lucide-camera" size="xx-large" />
                  Edit Picture
                  <input
                    type="file"
                    style="
                      position: absolute;
                      width: 100%;
                      height: 100%;
                      opacity: 0;
                    "
                    accept="image/*"
                    @change="uploadAvatar"
                  >
                </div>
              </div>
              <div :class="`mt-4 ${themedTextsColor}`">
                {{ profileData.username }}
              </div>
              <UButton
                v-if="isOwnProfile && existsOwnAvatar"
                label="Clear Avatar"
                variant="ghost"
                class="cursor-pointer mt-1"
                color="error"
                @click="clearAvatar"
              />
            </div>
            <div class="profile-container">
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
                    text="Tell other users about you!"
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
import {
  getStorageErrorMessage,
  logStorageError,
} from "~~/errors/storageErrors";
import { getAuthErrorMessage, logAuthError } from "~~/errors/authErrors";
import {
  logPostgrestError,
} from "~~/errors/postgrestErrors";

type ProfileUserData = Pick<
  UserData,
  "avatarUrl" | "avatarPath" | "username" | "displayname" | "description"
>;

const route = useRoute();
const supabase = useSupabaseClient();
const userData = useUserData();
const operationFeedbackHandler = useOperationFeedbackHandler();
const { isLight } = useSSRSafeTheme();

// get username from url
const routeUsername = computed(() => {
  const params = route.params;
  return params.username as string;
});
const isOwnProfile = computed(() => routeUsername.value === userData.username);
const existsOwnAvatar = ref(false);
const newAvatarObjectUrl = ref<string | null>(null);
const showAvatarCroppingModal = ref(false);

const profileData = ref<ProfileUserData | null>(null);
const loading = ref(true);
const profileTitle = computed(() =>
  loading.value
    ? "Loading..."
    : isOwnProfile.value
    ? "Your Profile"
    : `${profileData.value?.username ?? ""}'${
        profileData.value?.username.endsWith("s") ? "" : "s"
      } Profile`
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

  // If it's the current user, get data from users metadata
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
          statusMessage: "The user you searched for was not found",
      });
      return;
    }

    const avatarPath = getAvatarPath(data.user_id);
    const avatarUrl = getAvatarUrl(data.user_id);

    profileData.value = {
      ...data,
      username,
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

async function uploadAvatar(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) {
    newAvatarObjectUrl.value = URL.createObjectURL(file);
    showAvatarCroppingModal.value = true;
  }
}
async function onUploadCroppedAvatar(blob: Blob) {
  showAvatarCroppingModal.value = false;
  newAvatarObjectUrl.value = null;
  const { error } = await supabase.storage
    .from("avatars")
    .upload(userData.avatarPath, blob, {
      upsert: true,
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
    existsOwnAvatar.value = true;
    operationFeedbackHandler.displaySuccess(
      "Your avatar has been updated. You may need to reload the page."
    );
  }
}
async function clearAvatar() {
  const { error } = await supabase.storage
    .from("avatars")
    .remove([userData.avatarPath]);
  if (error) {
    operationFeedbackHandler.displayError("Could not clear your avatar.");
  } else {
    existsOwnAvatar.value = false;
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

onNuxtReady(async () => {
  if (!isOwnProfile.value) return; // Value only needed on the own profile page
  const { data } = await supabase.storage
    .from("avatars")
    .exists(userData.avatarPath);
  existsOwnAvatar.value = data;
});

onMounted(() => {
  loadUserProfile(routeUsername.value);
});
</script>

<style>
@import url("~/assets/css/profile.css");
</style>