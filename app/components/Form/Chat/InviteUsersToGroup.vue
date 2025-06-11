<template>
  <UForm
    id="invite-form"
    class="space-y-6"
    :schema="schema"
    :state="state"
    @submit="onSubmit"
  >
    <UFormField name="group" required>
      <ChatroomGroupSelector v-model="state.group" :allowed-current-user-roles="allowedCurrentUserRoles" />
    </UFormField>

    <UFormField name="invitations" required>
      <ChatroomInvitationGroupInvitationsCreator
        v-model="invitations"
        :allowed-roles="allowedInvRoles"
        :existing-group-id="state.group?.chatroom_id"
      />
    </UFormField>
  </UForm>
</template>

<script lang="ts" setup>
import type * as z from 'zod';
import { inviteUsersToGroupSchema } from '~~/validation/schemas/input/inputChatroomSchemas';
import type { SelectedGroup, UserInvitation } from '~/types/invitations/groupInvitationCreation';
import type { Enums } from '~~/database.types';
import type { NonEmptyArray } from '~/types/tsUtils/helperTypes';

const schema = inviteUsersToGroupSchema;
type Schema = z.output<typeof schema>;

const emit = defineEmits<{
  submit: [data: Schema]
}>();
const props = defineProps<{
  presetGroup?: SelectedGroup,
  presetInvitations?: UserInvitation[],
}>();

const invitations = ref<UserInvitation[]>(props.presetInvitations ?? []);
const state = reactive<Partial<Schema>>({
  group: props.presetGroup ?? undefined,
  invitations: undefined,
});
watch(invitations.value, (invs) => {
  // Type conversion is justified by this check!
  if (invs.length === 0) {
    state.invitations = undefined;
    return;
  };

  state.invitations = invs.map((inv) => ({
    invitee_id: inv.user_id,
    as_role: inv.asRole,
    isInvalid: inv.alreadyInGroup || inv.alreadyInvited,
  })) as Schema['invitations'];
}, {
  immediate: true,
});

// Current user can only create invitations if he has one of these roles
const allowedCurrentUserRoles: Enums<'chatroom_role'>[] = ['admin', 'mod'];

// Allowed invitee roles depend on current user's role in the selected group chatroom
// Defaults to all roles
const allowedInvRoles = computed<NonEmptyArray<Enums<'chatroom_role'>>>(() => state.group?.current_user_role === 'mod' ? 
  ['member', 'viewer'] : ['admin', 'mod', 'member', 'viewer']);

async function onSubmit() {
  const { data } = inviteUsersToGroupSchema.safeParse(state);
  if (data) {
    emit('submit', {
      ...data,
    })
  }
}
</script>

<style>

</style>