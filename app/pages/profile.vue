<template>
  <UApp>
    <UCard class="Card">
      <template #header>
        <p class="headline">Profil</p>
      </template>
      <div class="avatar">
        <div class="avatar-container">
          <UAvatar class="ava" src="/images/profilpic.png" />
          <div class="avatar-overlay">
            <svg
              height="24"
              width="24"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              class="overlay-icon"
            >
              <path
                d="M19 6.5h-1.28l-.32-1a3 3 0 0 0-2.84-2H9.44A3 3 0 0 0 6.6 5.55l-.32 1H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-8a3 3 0 0 0-3-3.05Zm1 11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h2a1 1 0 0 0 1-.68l.54-1.64a1 1 0 0 1 .95-.68h5.12a1 1 0 0 1 .95.68l.54 1.64a1 1 0 0 0 .9.68h2a1 1 0 0 1 1 1Zm-8-9a4 4 0 1 0 4 4a4 4 0 0 0-4-4Zm0 6a2 2 0 1 1 2-2a2 2 0 0 1-2 2Z"
                fill="currentColor"
              />
            </svg>
            Foto ändern
          </div>
        </div>
      </div>
      <div class="profile-container">
        <div class="section-container">
          <div class="section-label">Dein Name</div>
          <div class="profile-field">
            <div class="field-content">
              <div v-if="!isEditingName" class="field-value">
                {{ userName }}
              </div>
              <input v-else v-model="newName" type="text" class="edit-input" />
              <button class="edit-button" @click="toggleEditName">
                <svg
                  height="24"
                  width="24"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    v-if="!isEditingName"
                    d="M22 7.24a1 1 0 0 0-.29-.71l-4.24-4.24a1 1 0 0 0-.71-.29a1 1 0 0 0-.71.29l-2.83 2.83L2.29 16.05a1 1 0 0 0-.29.71V21a1 1 0 0 0 1 1h4.24a1 1 0 0 0 .76-.29l10.87-10.93L21.71 8a1.19 1.19 0 0 0 .22-.33a1 1 0 0 0 0-.24a.7.7 0 0 0 0-.14ZM6.83 20H4v-2.83l9.93-9.93l2.83 2.83ZM18.17 8.66l-2.83-2.83l1.42-1.41l2.82 2.82Z"
                    fill="currentColor"
                  />
                  <path
                    v-else
                    d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                    fill="currentColor"
                  />
                </svg>
              </button>
              <button
                v-if="isEditingName"
                class="save-button"
                @click="saveName"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>

        <div class="section-container">
          <div class="section-label">Info</div>
          <div class="profile-field">
            <div class="field-content">
              <div v-if="!isEditingStatus" class="field-value">
                <span class="status">{{ userStatus }}</span>
              </div>
              <input
                v-else
                v-model="newStatus"
                type="text"
                class="edit-input"
              />
              <button class="edit-button" @click="toggleEditStatus">
                <svg
                  height="24"
                  width="24"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    v-if="!isEditingStatus"
                    d="M22 7.24a1 1 0 0 0-.29-.71l-4.24-4.24a1 1 0 0 0-.71-.29a1 1 0 0 0-.71.29l-2.83 2.83L2.29 16.05a1 1 0 0 0-.29.71V21a1 1 0 0 0 1 1h4.24a1 1 0 0 0 .76-.29l10.87-10.93L21.71 8a1.19 1.19 0 0 0 .22-.33a1 1 0 0 0 0-.24a.7.7 0 0 0 0-.14ZM6.83 20H4v-2.83l9.93-9.93l2.83 2.83ZM18.17 8.66l-2.83-2.83l1.42-1.41l2.82 2.82Z"
                    fill="currentColor"
                  />
                  <path
                    v-else
                    d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                    fill="currentColor"
                  />
                </svg>
              </button>
              <button
                v-if="isEditingStatus"
                class="save-button"
                @click="saveStatus"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      </div>
    </UCard>
  </UApp>
</template>

<script>
export default {
  name: "ProfileView",
  data() {
    return {
      userName: "Florian Steck",
      userStatus: "👋",
      isEditingName: false,
      isEditingStatus: false,
      newName: "",
      newStatus: "",
    };
  },
  methods: {
    toggleEditName() {
      this.isEditingName = !this.isEditingName;
      if (this.isEditingName) {
        this.newName = this.userName;
      }
    },
    saveName() {
      this.userName = this.newName;
      this.isEditingName = false;
    },
    toggleEditStatus() {
      this.isEditingStatus = !this.isEditingStatus;
      if (this.isEditingStatus) {
        this.newStatus = this.userStatus;
      }
    },
    saveStatus() {
      this.userStatus = this.newStatus;
      this.isEditingStatus = false;
    },
  },
};
</script>

<style>
@import url("~/assets/css/profile.css");
</style>
