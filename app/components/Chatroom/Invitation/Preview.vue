<template>
  <div key="index" class="flex flex-col items-center border-2 rounded-lg">
    <span v-if="invitation.invitor_username" class="flex flex-row gap-2">
      <div class="text-md text-highlighted">Invitor:</div>
      <ULink :to="`/profile/${invitation.invitor_username}`" class="text-md flex flex-row items-center gap-1">
        {{ invitation.invitor_username }}
        <UIcon name="i-lucide-external-link" />
      </ULink>
    </span>
    <span v-if="invitation.invitee_username" class="flex flex-row gap-2">
      <div class="text-md text-highlighted">Invited:</div>
      <ULink :to="`/profile/${invitation.invitee_username}`" class="text-md flex flex-row items-center gap-1">
        {{ invitation.invitor_username }}
      </ULink>
    </span>
    <span v-if="invitation.group_name" class="flex flex-row gap-2">
      <div class="text-md text-highlighted">To:</div>
      <ULink v-if="invitation.invitee_username" :to="`/profile/${invitation.invitee_username}`" class="text-md flex flex-row items-center gap-1">
        {{ invitation.group_name }}
      </ULink>
      <div v-else class="text-md text-muted">
        {{ invitation.group_name }}
      </div>
    </span>
    <span class="flex flex-row gap-2">
      <div class="text-md text-highlighted">As: </div>
      <div class="flex flex-row items-center gap-2">
        <div class="text-md text-muted">{{ rolesVisualization[invitation.as_role].label }}</div>
        <UIcon class="text-muted" :name="rolesVisualization[invitation.as_role].icon" />
      </div>
    </span>
  </div>
</template>

<script lang="ts" setup>
import type { InvitationPreview } from '~/types/invitations/invitationsPreview';
import rolesVisualization from '~/visualization/chatroomRoles';

defineProps<{
  invitation: InvitationPreview,
}>();
</script>

<style>

</style>