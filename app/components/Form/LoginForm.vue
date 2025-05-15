<template>
  <UCard variant="outline">
    <template #header>
      <p class="font-bold">Log into your Account</p>
    </template>
    
    <UForm :schema="loginSchema" :state="agnosticLoginState" class="space-y-4 w-3xs xl:w-2xs" @submit="onSubmit" >
      <UFormField label="Username / Email" name="usernameOrEmail" required >
        <UInput v-model="agnosticLoginState.usernameOrEmail" class="w-full" />
      </UFormField>

      <UFormField label="Password" name="password" required >
        <UInput
          v-model="agnosticLoginState.password"
          class="w-full"
          :type="showPassword ? 'text' : 'password'"
          :ui="{ trailing: 'pe-1' }"
        >
          <template #trailing>
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              :aria-pressed="showPassword"
              aria-controls="password"
              @click="showPassword = !showPassword"
            />
          </template>
        </UInput>
      </UFormField>

      <UButton class="button" type="submit">
        Sign In
      </UButton>
    </UForm>
  </UCard>
</template>

<script setup lang="ts">
  import type * as z from 'zod'
  import type { FormSubmitEvent } from '@nuxt/ui'
  import { loginSchema } from '../../../validation/schemas/input/inputUserSchemas'
  import { getAuthErrorMessage, logAuthError } from '../../../errors/authErrors'

  const showPassword = ref(false)

  const supabase = useSupabaseClient()

  type AgnosticLoginSchema = z.output<typeof loginSchema>
  const agnosticLoginState = reactive<Partial<AgnosticLoginSchema>>({
    password: undefined,
    usernameOrEmail: undefined,
  })

  const usingUsernameLogin = computed(() => !agnosticLoginState.usernameOrEmail?.includes('@'))

  const successRedirectPath = '/chat'
  function onLoginSuccess() {
    navigateTo(successRedirectPath)
  }

  const toast = useToast()
  function displayError(description: string) {
    toast.add({
      title: 'Error',
      description,
      color: 'error',
    })
  }

  async function onSubmit(event: FormSubmitEvent<AgnosticLoginSchema>) {
    const { usernameOrEmail, password } = event.data
    const unknownErrorMessage = 'Unknown error during login'

    if (!usingUsernameLogin.value) { // Login with email
      const { error } = await supabase.auth.signInWithPassword({
        email: usernameOrEmail,
        password,
      })
      if (!error) {
        onLoginSuccess()
      } else {
        logAuthError(error, 'login')
        displayError(getAuthErrorMessage(error.code, unknownErrorMessage))
      }
    } else { // Login with username => Invoke edge function
      const { data, error } = await supabase.functions.invoke("login-with-username", {
        body: {
          username: usernameOrEmail,
          password,
        }
      })
      if (!error) {
        // Set the JWT tokens
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        });
        if (!setSessionError) {
          onLoginSuccess()
        } else {
          logAuthError(setSessionError, 'login')
          displayError(getAuthErrorMessage(setSessionError.code, unknownErrorMessage))
        }
      } else {
        console.log(`Error calling the username login function: ${ error }`);
        const description = (error.context.status === 400) ? getAuthErrorMessage('invalid_credentials') : unknownErrorMessage
        displayError(description)
      }
    }
  }
</script>

<style scoped>
  .button {
    cursor: pointer;
  }
</style>
