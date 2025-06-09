<template>
  <div>
    <ModalSearchUser
      class="h-min"
      :exclude-ids="invitations.map((user) => user.user_id)"
      :exclude-group-id="existingGroupId"
      :exclude-has-invitations-to="existingGroupId"
      @close="onUserSelect"
    >
      <UButton
        label="Search Users"
        color="neutral"
        variant="subtle"
        icon="i-lucide-search"
        class="w-full rounded-b-none"
      />
    </ModalSearchUser>
    <div v-if="invitations.length === 0" class="text-muted border-1 border-accented rounded-lg p-2 border-t-0 rounded-t-none">
      Select the users you want to invite
    </div>
    <div
      v-else
      ref="usersContainer"
      class="p-1 space-y-1 border-1 border-accented rounded-lg border-t-0 rounded-t-none max-h-40 overflow-y-scroll scroll-smooth"
    >
      <div
        v-for="(user, index) in invitations"
        :key="index"
        class="flex flex-row items-center justify-start gap-2"
      >
        <UAvatar
          :src="getAvatarUrl(user.user_id)"
          icon="i-lucide-user"
          size="sm"
        />
        <div class="flex flex-col sm:flex-row gap-0 sm:gap-2">
          <span>
            {{ user.displayname ?? user.username }}
          </span>
          <span v-if="user.displayname" class="text-muted">
            {{ user.username }}
          </span>
        </div>
        <div class="flex-1" />
        <ChatroomRoleSelect v-model="user.asRole" :allowed-roles="allowedRoles" class="min-w-36" />
        <UButton icon="i-lucide-x" variant="ghost" color="error" @click="invitations.splice(index, 1)" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { UserSearchResult } from '~/types/userSearch';
import type { UserInvitation } from '~/types/groupInvitationCreation';
import type { Enums } from '~~/database.types';
import type { NonEmptyArray } from '~/types/tsUtils/helperTypes';

const invitations = defineModel<UserInvitation[]>({
  required: true,
});

const props = defineProps<{
  existingGroupId?: string,
  allowedRoles: NonEmptyArray<Enums<'chatroom_role'>>, // Must not be empty
}>();
// When we suddenly have less allowed roles, switch invalid invitation roles to the first allowed role
watch(() => props.allowedRoles, (allowed) => {
  invitations.value.forEach((inv) => {
    if (!allowed.includes(inv.asRole)) {
      inv.asRole = allowed[0];
    }
  });
});

const usersContainer = ref<HTMLElement | null>(null);

async function onUserSelect(result: UserSearchResult | null) {
  if (result) {
    // Add user
    invitations.value.push({
      ...result,
      asRole: 'member',
    });

    await nextTick();
    // Scroll to bottom
    if (usersContainer.value) {
      usersContainer.value.scrollTo({ top: usersContainer.value.scrollHeight })
    }
  }
}
</script>

<style>

</style>