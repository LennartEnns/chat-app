<template>
  <NuxtLayout name="logged-in">
    <UCard
      class="ring-0"
      :ui="{
        header: 'border-none',
      }"
    >
      <template #header>
        <p class="font-bold text-xl text-center">Your Profile</p>
      </template>
      <div class="avatar">
        <div class="avatar-container">
          <UAvatar
            class="border-2"
            :src="avatarUrl"
            icon="i-lucide-user"
            :ui="{
              root: 'size-35',
              icon: 'size-30',
            }"
          />
          <div class="avatar-overlay">
            <UIcon name="i-lucide-camera" size="xx-large" />
            Edit Picture
            <input
              type="file"
              style="
                color: transparent;
                max-width: 100%;
                height: 100%;
                position: absolute;
              "
              accept="image/*"
            />
          </div>
        </div>
        <div :class="`mt-4 text-neutral-400 ${themedUsernameColor}`">
          {{ username }}
        </div>
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
                :class="`${themedTextsColor} ${
                  isFalsy(displayName) ? themedUsernameColor : themedTextsColor
                }`"
              >
                {{ isFalsy(displayName) ? username : displayName }}
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
                :class="`whitespace-pre-line break-all ${themedTextsColor}`"
              >
                {{ userDescription }}
              </div>
              <UTextarea
                v-else
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
    </UCard>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { userLimits } from "../../validation/commonLimits";
import { displayNameSchema } from "../../validation/schemas/input/inputUserSchemas";

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const profileData = user.value?.user_metadata;
const avatarUrlData = user.value
  ? supabase.storage
      .from("avatars")
      .getPublicUrl(`public/${user.value?.id}.jpg`)
  : null;
const avatarUrl = avatarUrlData?.data.publicUrl;

const username = ref<string>(profileData?.username);
const displayName = ref<string | null | undefined>(profileData?.displayname);
const userDescription = ref<string>(profileData?.description || "");
const isEditingName = ref(false);
const newDisplayName = ref("");
const isEditingDescription = ref(false);
const newDescription = ref("");

const descriptionRowCount = computed(
  () => (userDescription.value.match(/\n/g) || "").length + 1
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
const toast = useToast();

const themedProfileFieldClasses = computed(() => {
  return isLight.value ? "border-b-primary-600" : "border-b-primary-300";
});
const themedSectionLabelClasses = computed(() => {
  return isLight.value ? "text-primary-900" : "text-primary-400";
});
const themedUsernameColor = computed(() => {
  return isLight.value ? "text-neutral-500" : "text-neutral-400";
});
const themedTextsColor = computed(() => {
  return isLight.value ? "text-neutral-900" : "text-neutral-100";
});

const showDescriptionLengthIndicator = computed(() => {
  return !isEditingDescription.value && descriptionRowCount.value >= 10;
});

async function updateProfileData(
  data: Partial<{ displayname: string | null; description: string }>
) {
  const { error } = await supabase.auth.updateUser({
    data,
  });
  if (error) {
    console.log(`Error updating profile: ${error}`);
    toast.add({
      title: "Error",
      description: "Could not update profile data.",
      color: "error",
    });
  } else {
    toast.add({
      title: "Success",
      description: "Updated profile.",
      color: "success",
    });
  }
}

async function toggleEditDisplayName() {
  isEditingName.value = !isEditingName.value;
  if (isEditingName.value) {
    newDisplayName.value = displayName.value || "";
  }
}
async function saveDisplayName() {
  displayName.value = displayNameParsed.value.data ?? null;
  isEditingName.value = false;
  updateProfileData({
    displayname: displayName.value,
  });
}
async function toggleEditDescription() {
  isEditingDescription.value = !isEditingDescription.value;
  if (isEditingDescription.value) {
    newDescription.value = userDescription.value;
  }
}
async function saveDescription() {
  userDescription.value = newDescription.value?.trim() || "";
  isEditingDescription.value = false;
  updateProfileData({
    description: userDescription.value,
  });
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
