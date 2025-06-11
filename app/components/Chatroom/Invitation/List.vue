<template>
  <div class="mt-2">
    <UProgress v-if="loading" animation="carousel" />
    <div v-if="loading || !invitations || invitations.length === 0" class="text-center text-lg text-muted mt-4">
      {{ loading ? 'Loading invitations...' : 'No invitations' }}
    </div>
    <div v-else class="flex flex-col gap-4">
      <ChatroomInvitationPreview v-for="(inv, index) in invitations" :key="index" :invitation="inv" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { InvitationPreview } from '~/types/invitations/invitationsPreview';

defineProps<{
  invitations?: InvitationPreview[],
  loading?: boolean,
}>();

</script>

<style>

</style>