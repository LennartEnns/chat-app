<template>
  <UCard
    variant="subtle" class="border-1 border-gray-500"
    :ui="{
      header: 'border-none pb-1 text-lg'
  }">
    <template #header>
      <p class="font-bold">Register an Account</p>
    </template>

    <UForm :schema="schema" :state="state" class="space-y-4 w-3xs xl:w-2xs" @submit="onSubmit">
      <UFormField label="Email" name="email" required>
        <UInput v-model="state.email" class="w-full" />
      </UFormField>

      <UFormField label="Username" name="username" required>
        <UInput v-model="state.username" class="w-full" />
      </UFormField>

      <UFormField label="Password" name="password" required>
        <PasswordToggleInput v-model="state.password" class="w-full" />
      </UFormField>

      <UFormField label="Confirm Password" name="confirmPassword" required>
        <PasswordToggleInput v-model="state.confirmPassword" class="w-full" />
      </UFormField>

      <UButton class="button" type="submit">
        Sign Up
        <UModal v-model:open="showSuccessModal" title="Registration successful" description="Open the link in your confirmation email." :dismissible="false">
          <template #body>
            <ULink to="/login" class="flex align-center" color="primary">
              <div>Return to login</div>
              <UIcon name="i-lucide-arrow-right" class="self-center ml-1"/>
            </ULink>
          </template>
        </UModal>
      </UButton>
    </UForm>
  </UCard>
</template>

<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { registrationSchema } from '../../../validation/schemas/input/inputUserSchemas'
import { getAuthErrorMessage, logAuthError } from '../../../errors/authErrors'
import PasswordToggleInput from '../Input/PasswordToggleInput.vue'

const supabase = useSupabaseClient()
const operationFeedbackHandler = useOperationFeedbackHandler();

const showSuccessModal = ref(false)

// Extend the registration schema with a confirmPassword property
let schemaPassword = ''
const schema = registrationSchema
  .extend({
    password: registrationSchema.shape.password.refine(
    (value) => {
      schemaPassword = value
      return true
    }),
    confirmPassword: z.string().refine((value) => value === schemaPassword, 'Passwords do not match'),
  })
type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  email: undefined,
  username: undefined,
  password: undefined,
  confirmPassword: undefined,
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
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

  const { data, error } = await supabase.auth.signUp({
    email: event.data.email,
    password: event.data.password,
    options: {
      emailRedirectTo: toFullUrl('/flow/confirm-email'),
      data: {
        username: event.data.username,
      },
    },
  });
  if (data && !error) {
    operationFeedbackHandler.displaySuccess('We have sent you a confirmation email.');
    showSuccessModal.value = true
  } else if (error) {
    logAuthError(error, 'registration');
    operationFeedbackHandler.displayError(getAuthErrorMessage(error.code, 'Unknown error during registration'));
  }
}
</script>

<style scoped>
  .button {
    cursor: pointer;
  }
</style>
