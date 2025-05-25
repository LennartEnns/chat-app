<template>
  <NuxtLayout name="settings">
    <div class="w-full flex align-center justify-center mt-2">
      <UAvatar
        class="border-2"
        :src="userData.existsAvatarAtUrl ? userData.avatarUrl : undefined"
        icon="i-lucide-user"
        :ui="{ root: 'size-10', icon: 'size-8' }"
      />
      <ULink to="/profile" class="flex align-center ml-5">
        <div class="self-center">Edit Profile</div>
        <UIcon name="i-lucide-arrow-right" class="self-center ml-1"/>
      </ULink>
    </div>

    <USeparator label="Username" class="mt-4" color="primary" />
    <div class="text-muted text-center">
      {{ userData.username }}
    </div>
    <ChangeUsernameForm />

    <USeparator label="Email/Password" class="mt-4" color="primary" />
    <div class="text-muted text-center">
      {{ userData.email }}
    </div>
    <ChangeEmailForm />
    <UButton label="Reset Password" class="cursor-pointer justify-center" @click="flowActions.requestPasswordReset(userData.email)" />

    <USeparator label="Danger Zone" class="mt-4" color="error" />
    <UButton class="flex flex-col cursor-pointer" variant="outline" color="error" @click="onDeleteUser">
      <div class="w-full text-xl text-bold">
        Delete this account
      </div>
      <div class="text-muted">
        Remove your account and all associated data.
      </div>
    </UButton>
  </NuxtLayout>
</template>

<script lang="ts" setup>
import ChangeUsernameForm from '../../components/Form/ChangeUsernameForm.vue';
import ChangeEmailForm from '../../components/Form/ChangeEmailForm.vue';
import { ModalDeleteUser } from '#components';

const userData = useUserData();
const flowActions = useFlowActions();
const overlay = useOverlay();
const deleteUserModal = overlay.create(ModalDeleteUser);

async function onDeleteUser() {
  const instance = deleteUserModal.open();
  const res = await instance.result;
  if (res) {
    const deletionSuccessful = await flowActions.requestUserDeletion();
    if (deletionSuccessful) {
      navigateTo("/");
    }
  }
}
</script>

<style scoped>
.bioGroup {
  display: flex;

  height: max-content;
}

.bioInput {
  flex-grow: 1;
}
.bioInput * {
  border-radius: 5px 0px 0px 5px;
  /* border: 1px solid red; */
}
.saveBioBtn {
  flex-grow: 1;
  min-height: 100%;
}

.changePW div {
  padding-left: 0;
  margin-top: 1%;
}
</style>
