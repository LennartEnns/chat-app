<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField label="New Email Address" name="email" required>
      <UInput v-model="state.email" class="w-full" />
    </UFormField>
    <UButton label="Change" class="cursor-pointer" type="submit" />
    <UModal
      v-model:open="showSuccessModal"
      :dismissible="false">
      <template #title>
        <div class="text-success">
          Links sent successfully
        </div>
      </template>
      <template #description>
        We have sent confirmation links to both your <b>old</b> and your <b>new</b> email address.
        <br>
        Click on <b>both links</b> for the change to take effect.
      </template>
      <template #body>
        <UButton label="Ok, got it!" variant="link" class="text-md p-0 cursor-pointer" @click="showSuccessModal = false" />
      </template>
    </UModal>
  </UForm>
</template>

<script lang="ts" setup>
import { z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';
import { emailSchema } from '~~/validation/schemas/input/inputUserSchemas';
import { getAuthErrorMessage, logAuthError } from '~~/errors/authErrors';

const supabase = useSupabaseClient();
const operationFeedbackHandler = useOperationFeedbackHandler();
const userData = useUserData();

const showSuccessModal = ref(false);

const schema = z.object({
  email: emailSchema,
});
type Schema = z.output<typeof schema>;
const state = reactive<Partial<Schema>>({
  email: undefined,
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (event.data.email === userData.email) return;

  const { data, error } = await supabase.auth.updateUser({
    email: event.data.email,
  },
  {
    emailRedirectTo: toFullUrl('/flow/confirm-email-change'),
  });
  if (data && !error) {
    showSuccessModal.value = true;
    state.email = "";
  } else if (error) {
    logAuthError(error, 'email change');
    operationFeedbackHandler.displayError(getAuthErrorMessage(error, 'Unknown error during email change'));
  }
}
</script>

<style>

</style>