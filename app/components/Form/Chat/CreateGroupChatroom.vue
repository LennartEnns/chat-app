<template>
  <UForm
    id="group-chatroom-form"
    class="space-y-4"
    :schema="schema"
    :state="state"
    :validate-on="['input']"
    @submit="onSubmit"
  >
    <UFormField
      label="Group name"
      name="name"
      required
    >
      <UInput
        id="nameInput"
        v-model="state.name"
        class="w-full"
        placeholder="Pick a name for your group"
        :maxlength="groupChatroomLimits.name"
        @vue:mounted="attachNameInputEnterHandler"
      />
    </UFormField>

    <UFormField
      label="Description (optional)"
      name="description"
    >
      <UTextarea
        id="descriptionInput"
        v-model="state.description"
        class="w-full"
        placeholder="Infos about the group"
        :maxlength="groupChatroomLimits.description"
        :rows="3"
        :maxrows="5"
        autoresize
        @keydown.enter.stop
      />
    </UFormField>

    <UFormField name="invitations">
      <ChatroomGroupInvitationsCreator v-model="invitations" :allowed-roles="['admin', 'mod', 'member', 'viewer']" />
    </UFormField>
  </UForm>
</template>

<script lang="ts" setup>
import type * as z from 'zod';
import { createGroupChatroomSchema } from '~~/validation/schemas/input/inputChatroomSchemas';
import { groupChatroomLimits } from '~~/validation/commonLimits';
import type { UserInvitation } from '~/types/groupInvitationCreation';

const schema = createGroupChatroomSchema;
type Schema = z.output<typeof schema>;

const emit = defineEmits<{
  submit: [data: Schema]
}>();

const invitations = ref<UserInvitation[]>([]);
const state = reactive<Partial<Omit<Schema, 'invitations'>> & Pick<Schema, 'invitations'>>({
  name: undefined,
  description: undefined,
  invitations: [],
});
watch(invitations.value, (users) => {
  state.invitations = users.map((user) => ({
    invitee_id: user.user_id,
    as_role: user.asRole,
  }))
}, {
  immediate: true,
});

async function onSubmit() {
  const { data } = createGroupChatroomSchema.safeParse(state);
  if (data) {
    emit('submit', {
      ...data,
      name: data.name.trim(),
      description: data.description?.trim(),
    })
  }
}

async function attachNameInputEnterHandler() {
  document
    .getElementById("nameInput")
    ?.addEventListener("keyup", (e: KeyboardEvent) => {
      if (e.code === "Enter") {
        if (isFalsy(state.name)) return;
        document.getElementById("descriptionInput")
          ?.focus();
      }
    });
}
</script>

<style>

</style>