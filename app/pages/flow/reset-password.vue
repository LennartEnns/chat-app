<template>
  <NuxtLayout name="gradient-background">
    <AuthFlowInfoCard operation-title="Password Reset" class="m-auto w-xs xl:w-sm">
      <div v-if="resetClientSuccess || !urlSuccess" :class="`flex flex-col items-center text-center ${textColorClass}`">
        <UIcon :name="passwordIcon" size="x-large" />
        <div class="mt-1">
          {{ resetClientSuccess ? resetClientSuccessDescription : urlErrorDescription }}
        </div>
      </div>
      <UForm v-else :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField label="New Password" name="password" required>
          <PasswordToggleInput v-model="state.password" class="w-full" />
        </UFormField>
        <UFormField label="Confirm Password" name="confirmPassword" required>
          <PasswordToggleInput v-model="state.confirmPassword" class="w-full" />
        </UFormField>
        <UButton label="Cancel" color="neutral" variant="link" class="pl-0" @click="navigateTo('/settings/account')" />
        <UButton label="Reset" variant="link" type="submit" />
      </UForm>

      <ULink v-if="!urlSuccess" to="/settings/account" class="flex items-center mt-4" color="primary">
        <UIcon name="i-lucide-arrow-left" class="mr-1"/>
        <div>Return to Home/Settings</div>
      </ULink>
    </AuthFlowInfoCard>
  </NuxtLayout>
</template>

<script lang="ts" setup>
import * as z from 'zod'
import { registrationSchema } from '../../../validation/schemas/input/inputUserSchemas'
import type { FormSubmitEvent } from '@nuxt/ui'
import { getAuthErrorMessage, logAuthError } from '~~/errors/authErrors';
import PasswordToggleInput from '~/components/Input/PasswordToggleInput.vue';

const route = useRoute();
const supabase = useSupabaseClient();
const operationFeedbackHandler = useOperationFeedbackHandler();
const { timer, start: startCountdown } = useCountdown();

const urlSuccess = computed(() => route.query.code && !route.query.error);
const urlErrorDescription = computed(() => route.query.error_description ?? 'Password reset failed. Please try again.');
const resetClientSuccess = ref(false);
const resetClientSuccessDescription = computed(() => `New password has been saved. Redirecting in ${timer.value}`);
const passwordIcon = computed(() => resetClientSuccess.value ? 'i-lucide-key-round' : 'i-lucide-circle-x');
const textColorClass = computed(() => resetClientSuccess.value ? 'text-success' : 'text-error');

let schemaPassword = ''
const schema = registrationSchema
  .pick({ password: true })
  .extend({
    password: registrationSchema.shape.password.refine(
    (value) => {
      schemaPassword = value;
      return true;
    }),
    confirmPassword: z.string().refine((value) => value === schemaPassword, 'Passwords do not match'),
  });
type Schema = z.output<typeof schema>;
const state = reactive<Partial<Schema>>({
  password: undefined,
  confirmPassword: undefined,
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const { error } = await supabase.auth.updateUser({
    password: event.data.password,
  });
  if (error) {
    operationFeedbackHandler.displayError(getAuthErrorMessage(error.code));
    logAuthError(error, 'Password Reset');
  } else {
    timer.value = 3;
    resetClientSuccess.value = true;
    startCountdown(() => navigateTo('/settings/account'));
  }
}
</script>

<style>

</style>