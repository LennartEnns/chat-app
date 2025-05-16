<template>
  <UCard class="min-h-screen">
    <template #header>
      <p class="font-bold text-xl">Your Profile</p>
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
        <div class="section-label flex align-center">
          Display Name
          <HelpTooltip text="The primary name shown to other users." />
        </div>
        <div class="profile-field">
          <div class="field-content">
            <div v-if="!isEditingName">
              {{ userName }}
            </div>
            <input v-else ref="editNameInput" v-model="newName" type="text" class="edit-input">
            <UButton :icon="isEditingName ? 'i-lucide-x' : 'i-lucide-pencil'" size="lg" class="edit-button" @click="toggleEditName" />
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
        <div class="section-label flex align-center">
          Info
          <HelpTooltip text="Tell other users about you!" />
        </div>
        <div class="profile-field">
          <div class="field-content">
            <div v-if="!isEditingStatus">
              {{ userStatus }}
            </div>
            <input
              v-else
              ref="editStatusInput"
              v-model="newStatus"
              type="text"
              class="edit-input"
            >
            <UButton :icon="isEditingStatus ? 'i-lucide-x' : 'i-lucide-pencil'" size="lg" class="edit-button" @click="toggleEditStatus" />
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
</template>

<script setup lang="ts">
const userName = ref("Florian Steck")
const userStatus = ref("👋")
const isEditingName = ref(false)
const isEditingStatus = ref(false)
const newName = ref("")
const newStatus = ref("")

const editNameInput = ref<HTMLInputElement | null>(null)
const editStatusInput = ref<HTMLInputElement | null>(null)

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

// Focus the inputs as soon as they appear and do other setup
watch(editNameInput, (input) => {
  if (input) {
    input.focus();
    input.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        saveName();
      }
    });
  }
})
watch(editStatusInput, (input) => {
  if (input) {
    input.focus();
    input.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        saveStatus();
      }
    });
  }
})
</script>

<style>
@import url("~/assets/css/profile.css");
</style>
