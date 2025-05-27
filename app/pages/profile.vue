<template>
  <NuxtLayout name="logged-in">
    <UCard class="ring-0" :ui="{ header: 'border-none' }">
      <template #header>
        <p class="font-bold text-xl text-center">Your Profile</p>
      </template>
      <div class="avatar">
        <div class="avatar-container">
          <UAvatar
            class="border-2"
            :src="userData.existsAvatarAtUrl ? userData.avatarUrl : undefined"
            icon="i-lucide-user"
            :ui="{ root: 'size-35', icon: 'size-30' }"
          />
          <div class="avatar-overlay">
            <UIcon name="i-lucide-camera" size="xx-large" />
            Edit Picture
            <input
              type="file"
              style="position: absolute; width: 100%; height: 100%; opacity: 0"
              accept="image/*"
              @change="uploadAvatar"
            >
          </div>
        </div>
        <div :class="`mt-4 ${themedTextsColor}`">
          {{ userData.username }}
        </div>
        <UButton v-if="userData.existsAvatarAtUrl" label="Clear Avatar" variant="ghost" class="cursor-pointer mt-1" color="error" @click="clearAvatar" />
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
              :icon="isEditingName ? 'i-lucide-x' : 'i-lucide-pencil'"
              size="lg"
              variant="ghost"
              color="neutral"
              class="cursor-pointer self-center"
              @click="toggleEditDisplayName"
            />
            <UButton
              v-if="isEditingName"
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
                :class="`${isFalsy(userData.displayname) ? themedWeakColor : themedTextsColor}`"
              >
                {{ isFalsy(userData.displayname) ? userData.username : userData.displayname }}
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
              :icon="isEditingDescription ? 'i-lucide-x' : 'i-lucide-pencil'"
              size="lg"
              variant="ghost"
              color="neutral"
              class="cursor-pointer self-center"
              @click="toggleEditDescription"
            />
            <UButton
              v-if="isEditingDescription"
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
                :class="`whitespace-pre-line break-all ${isFalsy(userData.description) ? themedWeakColor : themedTextsColor}`"
              >
                {{ isFalsy(userData.description) ? 'Empty' : userData.description }}
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
        <ULink to="/settings/account" class="flex items-center mt-4">
        <div>Go To Account Settings</div>
        <UIcon name="i-lucide-arrow-right" class="ml-1"/>
      </ULink>
      </div>
    </UCard>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { userLimits } from "../../validation/commonLimits";
import { displayNameSchema } from "../../validation/schemas/input/inputUserSchemas";

const supabase = useSupabaseClient();
const userData = useUserData();
const operationFeedbackHandler = useOperationFeedbackHandler();
const { isLight } = useSSRSafeTheme();

const isEditingName = ref(false);
const newDisplayName = ref("");
const isEditingDescription = ref(false);
const newDescription = ref("");

const descriptionRowCount = computed(
  () => (userData.description ? ((userData.description.match(/\n/g) || '').length + 1) : 0)
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

async function updateProfileData(
  data: Partial<{ displayname: string | null; description: string | null }>
) {
  const { error } = await supabase.auth.updateUser({ data });
  if (error) {
    console.log(`Error updating profile: ${error}`);
    operationFeedbackHandler.displayError('Could not update profile data.');
  } else {
    operationFeedbackHandler.displaySuccess('Updated profile.');
  }
}

async function uploadAvatar(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) {
    const { error } = await supabase.storage
      .from("avatars")
      .upload(userData.avatarUrl, file, {
        upsert: true,
      });
    if (error) {
      console.log(`Error uploading avatar: ${error}`);
      operationFeedbackHandler.displayError('Could not upload avatar.');
      return;
    } else {
      userData.existsAvatarAtUrl = true;
    }
  }
}
async function clearAvatar() {
  const { error } = await supabase.storage
    .from("avatars")
    .remove([userData.avatarPath]);
  if (error) {
    operationFeedbackHandler.displayError('Could not clear your avatar.');
  } else {
    userData.existsAvatarAtUrl = false;
  }
}

async function toggleEditDisplayName() {
  isEditingName.value = !isEditingName.value;
  if (isEditingName.value) newDisplayName.value = userData.displayname || '';
}
async function saveDisplayName() {
  userData.displayname = displayNameParsed.value.data ?? null;
  isEditingName.value = false;
  updateProfileData({ displayname: userData.displayname });
}
async function toggleEditDescription() {
  isEditingDescription.value = !isEditingDescription.value;
  if (isEditingDescription.value) newDescription.value = userData.description || '';
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
</script>

<style>
@import url("~/assets/css/profile.css");
</style>
