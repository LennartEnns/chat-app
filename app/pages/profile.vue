<template>
  <NuxtLayout name="logged-in">
    <UCard
      class="ring-0"
      :ui="{
      header: 'border-none',
    }">
      <template #header>
        <p class="font-bold text-xl text-center">Your Profile</p>
      </template>
      <div class="avatar">
        <div class="avatar-container">
          <UAvatar class="ava" src="/images/profilpic.png" />
          <div class="avatar-overlay">
            <UIcon name="i-lucide-camera" size="xx-large" />
            Edit Picture
          </div>
        </div>
      </div>
      <div class="profile-container">
        <div class="section-container">
          <div :class="`flex align-center mb-2 text-md ${themedSectionLabelClasses}`">
            Display Name
            <HelpTooltip text="The primary name shown to other users." />
          </div>
          <div :class="`py-1 border-b-1 ${themedProfileFieldClasses}`">
            <div class="field-content">
              <div v-if="!isEditingName" :class="`${isLight ? 'text-black' : 'text-white'}`">
                {{ userName }}
              </div>
              <UInput
                v-else
                v-model="newName"
                size="xl"
                variant="ghost"
                class="edit-input"
                autofocus
              />
              <UButton
                :icon="isEditingName ? 'i-lucide-x' : 'i-lucide-pencil'"
                size="lg" variant="ghost" color="neutral"
                class="cursor-pointer" @click="toggleEditName"
              />
              <button
                v-if="isEditingName"
                class="save-button"
                @click="saveName"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        <div class="section-container">
          <div :class="`flex align-center mb-2 text-md ${themedSectionLabelClasses}`">
            Info
            <HelpTooltip text="Tell other users about you!" />
          </div>
          <div :class="`py-1 border-b-1 ${themedProfileFieldClasses}`">
            <div class="field-content">
              <div v-if="!isEditingStatus" :class="`${isLight ? 'text-black' : 'text-white'}`">
                {{ userStatus }}
              </div>
              <UInput
                v-else
                v-model="newStatus"
                size="xl"
                variant="ghost"
                class="edit-input"
                autofocus
              />
              <UButton
                :icon="isEditingStatus ? 'i-lucide-x' : 'i-lucide-pencil'"
                size="lg" variant="ghost" color="neutral"
                class="cursor-pointer" @click="toggleEditStatus"
              />
              <button
                v-if="isEditingStatus"
                class="save-button"
                @click="saveStatus"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </UCard>
  </NuxtLayout>
</template>

<script setup lang="ts">
const userName = ref("Florian Steck")
const userStatus = ref("👋")
const isEditingName = ref(false)
const isEditingStatus = ref(false)
const newName = ref("")
const newStatus = ref("")

const isLight = useSSRSafeTheme()

const themedProfileFieldClasses = computed(() => {
  return (isLight.value ? 'border-b-primary-600' : 'border-b-primary-300');
});
const themedSectionLabelClasses = computed(() => {
  return (isLight.value ? 'text-primary-900' : 'text-primary-400');
});

async function toggleEditName() {
  isEditingName.value = !isEditingName.value;
  if (isEditingName.value) {
    newName.value = userName.value;
  }
}
async function saveName() {
  userName.value = newName.value;
  isEditingName.value = false;
}
async function toggleEditStatus() {
  isEditingStatus.value = !isEditingStatus.value;
  if (isEditingStatus.value) {
    newStatus.value = userStatus.value;
  }
}
async function saveStatus() {
  userStatus.value = newStatus.value;
  isEditingStatus.value = false;
}
</script>

<style>
@import url("~/assets/css/profile.css");
</style>
