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
          ref="formRef"
          :preset-group="presetGroup"
          :preset-invitations="presetInvitations"
          @submit-form="onInvite"
        />

        <template #footer>
          <div class="flex gap-3">
            <UButton
              class="flex-1 flex justify-center"
              label="Invite"
              color="primary"
              @click="onSubmitForm"
            />
            <UButton
              class="flex-1 flex justify-center"
              variant="outline"
              @click="onCancel"
            >
              Cancel
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import type { TablesInsert } from "#build/types/supabase-database";
import type * as z from "zod";
import type {
  SelectedGroup,
  UserInvitation,
} from "~/types/invitations/groupInvitationCreation";
import type { inviteUsersToGroupSchema } from "~~/validation/schemas/input/inputChatroomSchemas";

type InvitationResult = TablesInsert<"group_invitations"> & { invitee_username: string };

const { inviteUsers } = useChatroomActions();

// Use these group/users when opening the modal.
// Useful for providing pre-set values in various contexts, i.e. the context of a group/user
defineProps<{
  presetGroup?: SelectedGroup,
  presetInvitations?: UserInvitation[],
}>();
const emit = defineEmits<{ close: [newInvitations: InvitationResult[]] }>();

const formRef = ref<{ $el: HTMLFormElement } | null>(null);
async function onSubmitForm() {
  formRef.value?.$el.requestSubmit();
}

async function onCancel() {
  emit("close", []);
}
async function onInvite(
  invitationData: z.output<typeof inviteUsersToGroupSchema>
) {
  const insertedInvitations = invitationData.invitations.map((inv) => {
    const { isInvalid, invitee_username, ...invDb } = inv;
    return {
      chatroom_id: invitationData.group.chatroom_id,
      invitee_username: inv.invitee_username,
      ...invDb,
    };
  });
  const success = await inviteUsers(insertedInvitations.map((inv) => { 
    const { invitee_username, ...inserted } = inv;
    return inserted;
  }));

  if (success) {
    emit("close", insertedInvitations);
  }
}
</script>

<style></style>
