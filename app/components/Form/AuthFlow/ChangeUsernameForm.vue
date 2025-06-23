<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
  <UFormField label="New Username" name="username" required>
    <UInput v-model="state.username" class="w-full" :maxlength="userLimits.username" />
  </UFormField>

  <UButton label="Change" variant="outline" class="cursor-pointer" type="submit" />
</UForm>
</template>

<script lang="ts" setup>
import { z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';
import { usernameSchema } from '~~/validation/schemas/input/inputUserSchemas';
import { getAuthErrorMessage, logAuthError } from '~~/errors/authErrors';
import { userLimits } from '~~/validation/commonLimits';

const supabase = useSupabaseClient();
const operationFeedbackHandler = useOperationFeedbackHandler();
const userData = useUserData();

const schema = z.object({
  username: usernameSchema,
});
type Schema = z.output<typeof schema>;
const state = reactive<Partial<Schema>>({
  username: undefined,
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (event.data.username === userData.username) return;

  // Check if the username already exists
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('username', event.data.username)
    .maybeSingle();
  if (existingUser) {
    operationFeedbackHandler.displayError('Username already taken');
    return;
  }

  const { data, error } = await supabase.auth.updateUser({
    data: {
      username: event.data.username,
    },
  });
  if (data && !error) {
    operationFeedbackHandler.displaySuccess('Username updated');
    state.username = "";
  } else if (error) {
    logAuthError(error, 'username change');
    operationFeedbackHandler.displayError(getAuthErrorMessage(error, 'Unknown error during username change'));
  }
}
</script>

<style>

</style>