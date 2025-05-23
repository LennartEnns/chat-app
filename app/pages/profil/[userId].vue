<template>
  <NuxtLayout name="logged-in">
    <UCard class="ring-0" :ui="{ header: 'border-none' }">
      <template #header>
        <p class="font-bold text-xl text-center">
          {{ isOwnProfile ? 'Your Profile' : `${profileUser?.displayname || profileUser?.username}'s Profile` }}
        </p>
      </template>
      
      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center items-center py-8">
        <UIcon name="i-lucide-loader-2" class="animate-spin" size="2xl" />
        <span class="ml-2">Loading profile...</span>
      </div>
      
      <!-- Error state -->
      <div v-else-if="error" class="text-center py-8">
        <UIcon name="i-lucide-alert-circle" size="2xl" class="text-error mb-2" />
        <p class="text-error">{{ error }}</p>
        <UButton @click="$router.go(-1)" variant="outline" class="mt-4">
          Go Back
        </UButton>
      </div>
      
      <!-- Profile content -->
      <div v-else-if="profileUser">
        <div class="avatar">
          <div class="avatar-container">
            <UAvatar
              class="border-2"
              :src="avatarUrl"
              icon="i-lucide-user"
              :ui="{ root: 'size-35', icon: 'size-30' }"
            />
            <!-- Only show edit overlay for own profile -->
            <div v-if="isOwnProfile" class="avatar-overlay">
              <UIcon name="i-lucide-camera" size="xx-large" />
              Edit Picture
              <input
                type="file"
                style="position: absolute; width: 100%; height: 100%; opacity: 0"
                accept="image/*"
                @change="uploadPic"
                ref="upload"
              />
            </div>
          </div>
          <div :class="`mt-4 text-neutral-400 ${themedUsernameColor}`">
            {{ profileUser.username }}
          </div>
        </div>
        
        <div class="profile-container">
          <!-- Display Name Section -->
          <div class="section-container">
            <div :class="`flex mb-2 text-md ${themedSectionLabelClasses}`">
              <div class="self-center">Display Name</div>
              <HelpTooltip
                text="The primary name shown to other users."
                class="self-center"
              />
              <div class="grow" />
              <UButton
                v-if="!isOwnProfile"
                :icon="'i-lucide-message-circle-more'"
                size="lg"
                variant="soft"
                color="primary"
                class="cursor-pointer self-center"
                @click="openChat(profileUserId)"
              />
              <!-- Only show edit button for own profile -->
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
                :disabled="!displayNameValid"
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
                  :class="`${themedTextsColor} ${
                    isFalsy(profileUser.displayname) ? themedUsernameColor : themedTextsColor
                  }`"
                >
                  {{ isFalsy(profileUser.displayname) ? profileUser.username : profileUser.displayname }}
                </div>
                <UInput
                  v-else-if="isOwnProfile"
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
          
          <!-- Description Section -->
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
              <!-- Only show edit button for own profile -->
              <UButton
                v-if="isOwnProfile"
                :icon="isEditingDescription ? 'i-lucide-x' : 'i-lucide-pencil'"
                size="lg"
                variant="ghost"
                color="neutral"
                class="cursor-pointer self-center"
                @click="toggleEditDescription"
              />
              <UButton
                v-if="isOwnProfile && isEditingDescription"
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
                  v-if="!isEditingDescription"
                  :class="`whitespace-pre-line break-all ${themedTextsColor}`"
                >
                  {{ profileUser.description || 'No description provided.' }}
                </div>
                <UTextarea
                  v-else-if="isOwnProfile"
                  v-model="newDescription"
                  :maxlength="userLimits.description"
                  size="xl"
                  variant="ghost"
                  class="edit-input"
                  autofocus
                  :rows="descriptionRowCount"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </UCard>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { userLimits } from "../../../validation/commonLimits";
import { displayNameSchema } from "../../../validation/schemas/input/inputUserSchemas";
import { onMounted, watch } from "vue";

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const route = useRoute();
const toast = useToast();

// get userId from url
const profileUserId = computed(() => {
  const params = route.params;
  return params.userId as string;
});
const isOwnProfile = computed(() => user.value?.id === profileUserId.value);

// Profile data
const profileUser = ref<any>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const avatarUrl = ref<string | null>(null);
const isEditingName = ref(false);
const newDisplayName = ref("");
const isEditingDescription = ref(false);
const newDescription = ref("");

const descriptionRowCount = computed(
  () => ((profileUser.value?.description || "").match(/\n/g) || "").length + 1
);
const displayNameSanitized = computed(() =>
  isFalsy(newDisplayName.value) ? null : newDisplayName.value?.trim()
);
const displayNameParsed = computed(() =>
  displayNameSchema.safeParse(displayNameSanitized.value)
);
const displayNameValid = computed(() => displayNameParsed.value.success);
const displayNameErrorMessage = computed(
  () => displayNameParsed.value.error?.issues[0]?.message ?? "Invalid Format"
);

const isLight = useSSRSafeTheme();

const themedProfileFieldClasses = computed(() =>
  isLight.value ? "border-b-primary-600" : "border-b-primary-300"
);
const themedSectionLabelClasses = computed(() =>
  isLight.value ? "text-primary-900" : "text-primary-400"
);
const themedUsernameColor = computed(() =>
  isLight.value ? "text-neutral-500" : "text-neutral-400"
);
const themedTextsColor = computed(() =>
  isLight.value ? "text-neutral-900" : "text-neutral-100"
);

const showDescriptionLengthIndicator = computed(
  () => !isEditingDescription.value && descriptionRowCount.value >= 10
);

async function checkAvatarExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
}

async function loadUserProfile(userId: string) {
  try {
    loading.value = true;
    error.value = null;

    // If it's the current user, get data from user metadata
    if (isOwnProfile.value && user.value) {
      const profileData = user.value.user_metadata;
      profileUser.value = {
        user_id: user.value.id,
        username: profileData?.username || "",
        displayname: profileData?.displayname,
        description: profileData?.description || ""
      };
    } else {
      // Fetch other user's profile from database
      const { data, error: dbError } = await supabase
        .from('profiles')
        .select('user_id, username, displayname, description')
        .eq('user_id', userId)
        .single();

      if (dbError) {
        console.error('Error fetching profile:', dbError);
        error.value = 'User not found or profile could not be loaded.';
        return;
      }
      console.log(profileUser.value)
      profileUser.value = data;
    }

    // Load avatar
    await loadAvatar(userId);
    
  } catch (err) {
    console.error('Error loading profile:', err);
    error.value = 'An error occurred while loading the profile.';
  } finally {
    loading.value = false;
  }
}

async function loadAvatar(userId: string) {
  const avatarUrlData = supabase.storage
    .from("avatars")
    .getPublicUrl(`public/${userId}.jpg`);
  const url = avatarUrlData.data.publicUrl;
  
  if (url && (await checkAvatarExists(url))) {
    avatarUrl.value = url;
  } else {
    avatarUrl.value = null;
  }
}

// Watch for route changes - be more flexible with parameter names
watch(() => route.params, (newParams) => {
  console.log('Route params changed:', newParams);
  const newId = (newParams.id || newParams.userId || newParams.user_id || newParams.profileId) as string;
  if (newId) {
    loadUserProfile(newId);
  }
}, { immediate: true, deep: true });

// Watch for user changes (login/logout)
watch(user, (newUser) => {
  if (profileUserId.value) {
    loadUserProfile(profileUserId.value);
  }
});

onMounted(() => {
  console.log('Route params:', route.params);
  console.log('Profile User ID:', profileUserId.value);
  console.log('Current user ID:', user.value?.id);
  
  if (profileUserId.value) {
    loadUserProfile(profileUserId.value);
  } else if (user.value?.id) {
    // Fallback: If no ID in route, show current user's profile
    loadUserProfile(user.value.id);
  } else {
    error.value = 'No user ID provided and no user logged in.';
    loading.value = false;
  }
});

// Functions only available for own profile
async function updateProfileData(
  data: Partial<{ displayname: string | null; description: string }>
) {
  if (!isOwnProfile.value) return;
  
  const { error } = await supabase.auth.updateUser({ data });
  if (error) {
    console.log(`Error updating profile: ${error}`);
    toast.add({
      title: "Error",
      description: "Could not update profile data.",
      color: "error",
    });
  } else {
    // Update local profile data
    if (profileUser.value) {
      Object.assign(profileUser.value, data);
    }
    toast.add({
      title: "Success",
      description: "Updated profile.",
      color: "success",
    });
  }
}

async function uploadPic(event: Event): Promise<void> {
  if (!isOwnProfile.value) return;
  
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file && user.value) {
    const { error } = await supabase.storage
      .from("avatars")
      .upload(`public/${user.value.id}.jpg`, file, {
        cacheControl: "3600",
        upsert: true,
      });
    if (error) {
      console.log(`Error uploading avatar: ${error}`);
      toast.add({
        title: "Error",
        description: "Could not upload avatar.",
        color: "error",
      });
      return;
    }
    const avatarUrlData = supabase.storage
      .from("avatars")
      .getPublicUrl(`public/${user.value.id}.jpg`);
    avatarUrl.value = avatarUrlData.data.publicUrl;
  }
}

async function openChat(userId: string) {
  //Hier das routing fürs chat implementieren und chat in datenbank hinzufügen, wenn noch nicht verfügbar
}

async function toggleEditDisplayName() {
  if (!isOwnProfile.value) return;
  
  isEditingName.value = !isEditingName.value;
  if (isEditingName.value) {
    newDisplayName.value = profileUser.value?.displayname || "";
  }
}

async function saveDisplayName() {
  if (!isOwnProfile.value) return;
  
  const newValue = displayNameParsed.value.data ?? null;
  isEditingName.value = false;
  updateProfileData({ displayname: newValue });
}

async function toggleEditDescription() {
  if (!isOwnProfile.value) return;
  
  isEditingDescription.value = !isEditingDescription.value;
  if (isEditingDescription.value) {
    newDescription.value = profileUser.value?.description || "";
  }
}

async function saveDescription() {
  if (!isOwnProfile.value) return;
  
  const newValue = newDescription.value?.trim() || "";
  isEditingDescription.value = false;
  updateProfileData({ description: newValue });
}

async function attachDisplayNameInputEnterHandler() {
  document
    .getElementById("displayNameInput")
    ?.addEventListener("keyup", (e: KeyboardEvent) => {
      if (e.code === "Enter") saveDisplayName();
    });
}
</script>

<style>
@import url("~/assets/css/profile.css");
</style>