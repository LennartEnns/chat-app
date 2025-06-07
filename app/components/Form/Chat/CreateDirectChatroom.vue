<template>
  <UForm
    id="direct-chatroom-form"
    :schema="schema"
    :state="state"
    @submit="onSubmit"
  >
    <ModalSearchUser class="h-min" @close="onUserSelect">
      <UButton
        label="Select User"
        color="neutral"
        variant="subtle"
        icon="i-lucide-search"
        class="w-full rounded-b-none"
      />
    </ModalSearchUser>
    <UFormField name="invitedUser" required>
      <div v-if="!state.invitedUser" class="text-muted border-1 border-accented rounded-lg p-2 border-t-0 rounded-t-none">
        Select a user to chat with
      </div>
      <div v-else class="flex flex-row items-center justify-start gap-2 p-1 border-1 border-accented rounded-lg border-t-0 rounded-t-none">
        <UAvatar
          :src="userAvatarUrl"
          icon="i-lucide-user" />
        <span>
          {{ state.invitedUser.displayname ?? state.invitedUser.username }}
        </span>
        <span v-if="state.invitedUser.displayname" class="text-muted">
          {{ state.invitedUser.username }}
        </span>
        <div class="flex-1" />
        <UButton icon="i-lucide-x" variant="ghost" color="error" @click="state.invitedUser = undefined" />
      </div>
    </UFormField>
  </UForm>
</template>

<script lang="ts" setup>
import type * as z from 'zod';
import type { UserSearchResult } from '~/types/userSearch';
import { createDirectChatroomSchema } from '~~/validation/schemas/input/inputChatroomSchemas';

const schema = createDirectChatroomSchema;
type Schema = z.output<typeof schema>;

const emit = defineEmits<{
  submit: [data: Schema]
}>();

const state = reactive<Partial<Schema>>({
  invitedUser: undefined,
});
const userAvatarUrl = computed(() => state.invitedUser ? getAvatarUrl(state.invitedUser.user_id) : undefined);

async function onUserSelect(result: UserSearchResult | null) {
  if (result) {
    state.invitedUser = result;
  }
}

async function onSubmit() {
  const { data } = createDirectChatroomSchema.safeParse(state);
  if (data) {
    emit('submit', data)
  }
}
</script>

<style>

</style>
