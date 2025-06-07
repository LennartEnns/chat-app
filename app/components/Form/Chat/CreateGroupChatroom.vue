<template>
  <UForm
    id="group-chatroom-form"
    class="space-y-4"
    :schema="schema"
    :state="state"
    @submit="onSubmit"
  >
    <UFormField
      label="Group name"
      name="name"
      required
    >
      <UInput
        v-model="state.name"
        class="w-full"
        placeholder="Pick a name for your group"
        :maxlength="groupChatroomLimits.name"
      />
    </UFormField>

    <UFormField
      label="Description (optional)"
      name="description"
    >
      <UTextarea
        v-model="state.description"
        class="w-full"
        placeholder="Infos about the group"
        :maxlength="groupChatroomLimits.description"
        :rows="3"
        :maxrows="5"
        autoresize
      />
    </UFormField>

    <div>
      <ModalSearchUser class="h-min" :exclude-ids="selectedUsers.map((user) => user.user_id)" @close="onUserSelect">
        <UButton
          label="Search Users"
          color="neutral"
          variant="subtle"
          icon="i-lucide-search"
          class="w-full rounded-b-none"
        />
      </ModalSearchUser>
      <UFormField name="invitations">
        <div v-if="selectedUsers.length === 0" class="text-muted border-1 border-accented rounded-lg p-2 border-t-0 rounded-t-none">
          Select the users you want to invite
        </div>
        <div
          v-else
          ref="usersContainer"
          class="p-1 space-y-1 border-1 border-accented rounded-lg border-t-0 rounded-t-none max-h-40 overflow-y-scroll scroll-smooth"
        >
          <div
            v-for="(user, index) in selectedUsers"
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
            <ChatroomRoleSelect v-model="user.asRole" class="min-w-36" />
            <UButton icon="i-lucide-x" variant="ghost" color="error" @click="selectedUsers.splice(index, 1)" />
          </div>
        </div>
      </UFormField>
    </div>
  </UForm>
</template>

<script lang="ts" setup>
import type * as z from 'zod';
import type { UserSearchResult } from '~/types/userSearch';
import { createGroupChatroomSchema } from '~~/validation/schemas/input/inputChatroomSchemas';
import type { Enums } from '~~/database.types';
import { groupChatroomLimits } from '~~/validation/commonLimits';

const usersContainer = ref<HTMLElement | null>(null);
const schema = createGroupChatroomSchema;
type Schema = z.output<typeof schema>;

const emit = defineEmits<{
  submit: [data: Schema]
}>();

const selectedUsers = ref<(UserSearchResult & {asRole: Enums<'chatroom_role'>})[]>([]);
const state = reactive<Partial<Omit<Schema, 'invitations'>> & Pick<Schema, 'invitations'>>({
  name: undefined,
  description: undefined,
  invitations: [],
});
watch(selectedUsers.value, (users) => {
  state.invitations = users.map((user) => ({
    invitee_id: user.user_id,
    as_role: user.asRole,
  }))
}, {
  immediate: true,
});

async function onUserSelect(result: UserSearchResult | null) {
  if (result) {
    // Add user
    selectedUsers.value.push({
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
</script>

<style>

</style>