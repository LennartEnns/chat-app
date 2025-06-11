<template>
  <div key="index" class="flex flex-col items-center border-2 rounded-lg py-2">
    <span v-if="invitation.invitor_username" class="flex flex-row items-center gap-2">
      <div class="text-md text-highlighted">Invitor:</div>
      <UAvatar :src="invitorAvatarUrl" size="2xs" />
      <ULink :to="`/profile/${invitation.invitor_username}`" class="text-md flex flex-row items-center gap-1">
        {{ invitation.invitor_username }}
        <UIcon name="i-lucide-external-link" />
      </ULink>
    </span>
    <span v-if="invitation.invitee_username" class="flex flex-row items-center gap-2">
      <div class="text-md text-highlighted">Invited:</div>
      <ULink :to="`/profile/${invitation.invitee_username}`" class="text-md flex flex-row items-center gap-1">
        {{ invitation.invitee_username }}
        <UIcon name="i-lucide-external-link" />
      </ULink>
    </span>
    <span v-if="invitation.group_name" class="flex flex-row items-center gap-2">
      <div class="text-md text-highlighted">To:</div>
      <ULink v-if="invitation.invitee_username" :to="`/profile/${invitation.invitee_username}`" class="text-md flex flex-row items-center gap-1">
        {{ invitation.group_name }}
        <UIcon name="i-lucide-external-link" />
      </ULink>
      <div v-else class="text-md text-muted">
        {{ invitation.group_name }}
      </div>
    </span>
    <span class="flex flex-row items-center gap-2">
      <div class="text-md text-highlighted">As: </div>
      <div class="flex flex-row items-center gap-1">
        <UIcon class="text-muted" :name="rolesVisualization[invitation.as_role].icon" />
        <div class="text-md text-muted">{{ rolesVisualization[invitation.as_role].label }}</div>
      </div>
      <UButton icon="i-lucide-info" size="xs" variant="ghost" color="info" @click="onShowRolesInfo" />
    </span>

    <div v-if="!invitation.invitee_username" class="flex flex-row items-center gap-4 mt-2">
      <UButton label="Accept" variant="subtle" color="success" @click="onAcceptInvitation" />
      <UButton label="Reject" variant="subtle" color="error" @click="onRejectInvitation" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ModalChatroomRolesInfo } from '#components';
import type { InvitationPreview } from '~/types/invitations/invitationsPreview';
import rolesVisualization from '~/visualization/chatroomRoles';
import { logPostgrestError } from '~~/errors/postgrestErrors';

const props = defineProps<{
  invitation: InvitationPreview,
}>();

const emit = defineEmits<{
  rejected: [],
}>();

const supabase = useSupabaseClient();
const operationFeedbackHandler = useOperationFeedbackHandler();
const overlay = useOverlay();
const rolesInfoModal = overlay.create(ModalChatroomRolesInfo);

const invitorAvatarUrl = computed(() => getAvatarUrl(props.invitation.invitor_id));

async function onShowRolesInfo() {
  rolesInfoModal.open();
}

async function onAcceptInvitation() {
  if (!props.invitation.chatroom_id) return;

  // Try to insert the user into user_to_group with the specified role
  const { error } = await supabase.from('user_to_group')
    .insert({
      chatroom_id: props.invitation.chatroom_id,
      role: props.invitation.as_role,
    });
  if (error) {
    logPostgrestError(error, 'invitation accept');
    operationFeedbackHandler.displayError('Could not add you to the group');
    return;
  }

  // Open chatroom after adding user
  operationFeedbackHandler.displaySuccess(`Entered '${props.invitation.group_name ?? 'new group'}'`);
  navigateTo(`/chat/${props.invitation.chatroom_id}`);
}
async function onRejectInvitation() {
  // Try to delete the invitation
  const { error } = await supabase.from('group_invitations')
    .delete()
    .eq('id', props.invitation.id);
  if (error) {
    logPostgrestError(error, 'invitation reject');
    operationFeedbackHandler.displayError('Could not reject the invitation');
    return;
  }

  operationFeedbackHandler.displaySuccess(`Rejected the invitation${props.invitation.group_name ? ` to ${props.invitation.group_name}` : ''}`);
  emit('rejected');
}
</script>

<style>

</style>