<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField label="Email" name="email">
      <UInput v-model="state.email" />
    </UFormField>

    <UFormField label="Username" name="username">
      <UInput v-model="state.username" />
    </UFormField>

    <UFormField label="Password" name="password">
      <UInput v-model="state.password" type="password" />
    </UFormField>

    <UFormField label="Confirm Password" name="confirmPassword">
      <UInput v-model="state.confirmPassword" type="password" />
    </UFormField>

    <UButton type="submit">
      Sign Up
    </UButton>
  </UForm>
</template>

<script setup lang="ts">
  import * as z from 'zod'
  import type { FormSubmitEvent } from '@nuxt/ui'
  import { registrationSchema } from '../../validation/schemas/input/inputUserSchemas'
  import { getAuthErrorMessage } from '../../errors/authErrors'

  const supabase = useSupabaseClient()

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
    const { error } = await supabase.auth.signUp({
      email: event.data.email,
      password: event.data.password,
      options: {
        data: {
          username: event.data.username,
        }
      }
    })
    if (!error) {
      toast.add({ title: 'Success', description: 'We have sent you a confirmation email.', color: 'success' })
    } else {
      toast.add({
        title: 'Error',
        description: getAuthErrorMessage(error.message, 'Unknown error during registration'),
        color: 'success',
      })
    }
  }
</script>
