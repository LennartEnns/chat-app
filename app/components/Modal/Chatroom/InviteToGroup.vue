<template>
  <UModal>
    <template #content>
      <UCard
        variant="subtle"
        class="border-1 border-gray-500"
        :ui="{
          header: 'text-center text-lg',
          root: 'max-h-screen overflow-y-scroll',
        }"
      >
        <template #header>
          <p class="font-bold">Create Invitations</p>
        </template>

        <FormChatInviteUsersToGroup
          :preset-group="presetGroup"
          :preset-invitations="presetInvitations"
          @submit="onInvite"
        />

        <template #footer>
          <div class="flex gap-3">
            <UButton
              class="flex-1 flex justify-center"
              label="Invite"
              color="primary"
              type="submit"
              form="invite-form"
            />
            <UButton class="flex-1 flex justify-center" variant="outline" @click="onCancel">
              Cancel
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import type * as z from 'zod';
import type { SelectedGroup, UserInvitation } from '~/types/invitations/groupInvitationCreation';
import type { inviteUsersToGroupSchema } from '~~/validation/schemas/input/inputChatroomSchemas';

const { inviteUsers } = useChatroomActions();

// Use these group/users when opening the modal.
// Useful for providing pre-set values in various contexts, i.e. the context of a group/user
defineProps<{
  presetGroup?: SelectedGroup,
  presetInvitations?: UserInvitation[],
}>();
const emit = defineEmits<{ close: [] }>();

async function onCancel() {
  emit("close");
}
async function onInvite(invitationData: z.output<typeof inviteUsersToGroupSchema>) {
  const success = await inviteUsers(invitationData.invitations.map((inv) => {
    const { isInvalid, ...invDb } = inv;
    return {
      chatroom_id: invitationData.group.chatroom_id,
    ...invDb,
    }
  }));

  if (success) {
    emit("close");
  }
}
</script>

<style>

</style>
