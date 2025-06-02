<template>
  <NuxtLayout name="logged-in">
    <div class="grid grid-cols-4 h-full">
      <div class="flex flex-col items-center border-amber-300 border">
        <div class="pt-10 pb-5">
          <div>
            <UAvatar
              class="border-2 border-neutral-700 dark:border-white m-10px"
              src="https://github.com/benjamincanac.png"
              icon="i-lucide-user"
              :ui="{ root: 'size-50', icon: 'size-11/12' }"
            />
          </div>
        </div>
        <div class="py-5"><p class="text-[20px]">Groupname</p></div>
        <div class="py-5">Description: Hello World!</div>
      </div>
      <div
        class="flex flex-col items-center col-span-2 border-amber-300 border relative"
      >
        <div class="pb-5 text-neutral-700 dark:text-white">
          <p>Members</p>
        </div>
        <div class="members grid grid-cols-3 gap-3">
          <div
            class="ring-0 glassContainer text-neutral-700 dark:text-white member"
          >
            <UAvatar
              class="justify-self-center"
              src="https://github.com/nuxt.png"
            />
            <div class="message-content">
              <p>
                User messages are now saved to the database and loaded on
                page-reload.
              </p>
            </div>
          </div>
          <div
            class="ring-0 glassContainer text-neutral-700 dark:text-white member"
          >
            <UAvatar
              class="justify-self-center"
              src="https://github.com/nuxt.png"
            />
            <div class="message-content">
              <p>
                User messages are now saved to the database and loaded on
                page-reload.
              </p>
            </div>
          </div>
          <div
            class="ring-0 glassContainer text-neutral-700 dark:text-white member"
          >
            <UAvatar
              class="justify-self-center"
              src="https://github.com/nuxt.png"
            />
            <div class="message-content">
              <p>
                User messages are now saved to the database and loaded on
                page-reload.
              </p>
            </div>
          </div>
          <div
            class="ring-0 glassContainer text-neutral-700 dark:text-white member"
          >
            <UAvatar
              class="justify-self-center"
              src="https://github.com/nuxt.png"
            />
            <div class="message-content">
              <p>
                User messages are now saved to the database and loaded on
                page-reload.
              </p>
            </div>
          </div>
        </div>
        <UButton
          size="xl"
          icon="i-lucide-plus"
          class="absolute bottom-5 right-5"
          >Add member</UButton
        >
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
  getPostgrestErrorMessage,
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
    : 0
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

  // Fetch other user's profile from database
  const { data, error: dbError } = await supabase
    .from("profiles")
    .select("user_id, displayname, description")
    .eq("username", username)
    .single();

  if (dbError) {
    logPostgrestError(dbError, "profile loading");
    operationFeedbackHandler.displayError(
      getPostgrestErrorMessage(dbError, "Unknown error loading profile")
    );
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
  loadUserProfile("johnny");
});
</script>

<style>
@import url("~/assets/css/chatInfo.css");
</style>
