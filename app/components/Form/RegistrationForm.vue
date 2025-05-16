<template>
  <UCard variant="subtle" class="border-1 border-gray-500">
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
        <UInput v-model="state.confirmPassword" type="password" class="w-full" />
      </UFormField>

      <UButton class="button" type="submit">
        Sign Up
        <UModal v-model:open="showSuccessModal" title="Registration successful" description="Open the link in your confirmation email." :dismissible="false">
          <template #body>
            <ULink to="/login" class="flex align-center">
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
import { getAuthErrorMessage } from '../../../errors/authErrors'
import PasswordToggleInput from '../Input/PasswordToggleInput.vue'

const supabase = useSupabaseClient()

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
})

const toast = useToast()
async function onSubmit(event: FormSubmitEvent<Schema>) {
  // Check if the username already exists
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('username', event.data.username)
    .maybeSingle()
  if (existingUser) {
    toast.add({
      title: 'Error',
      description: 'Username already taken',
      color: 'error',
    })
    return
  }

  const { data, error } = await supabase.auth.signUp({
    email: event.data.email,
    password: event.data.password,
    options: {
      data: {
        username: event.data.username,
      },
      emailRedirectTo: 'http://localhost:3000/login',
    }
  })
  if (data && !error) {
    toast.add({ title: 'Success', description: 'We have sent you a confirmation email.', color: 'success' })
    showSuccessModal.value = true
  } else if (error) {
    console.error(`An auth error occured during registration: ${ Object.keys(error) } \n ${ Object.values(error) }`)
    toast.add({
      title: 'Error',
      description: getAuthErrorMessage(error.code, 'Unknown error during registration'),
      color: 'error',
    })
  }
}
</script>

<style scoped>
  .button {
    cursor: pointer;
  }
</style>
