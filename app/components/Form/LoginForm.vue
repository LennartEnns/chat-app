<template>
  <UCard
    variant="subtle"
    class="border-1 border-gray-500"
    :ui="{
      header: 'border-none pb-1 text-lg'
    }">
    <template #header>
      <p class="font-bold">Log into your Account</p>
    </template>
    
    <UForm :schema="loginSchema" :state="agnosticLoginState" class="space-y-4 w-3xs xl:w-2xs" @submit="onSubmit" >
      <UFormField label="Username / Email" name="usernameOrEmail" required >
        <UInput v-model="agnosticLoginState.usernameOrEmail" class="w-full" />
      </UFormField>

      <UFormField label="Password" name="password" required >
        <PasswordToggleInput v-model="agnosticLoginState.password" class="w-full" />
      </UFormField>

      <UButton class="button" type="submit">
        Sign In
      </UButton>
    </UForm>

    <UButton label="I forgot my password" variant="link" class="mt-5 p-0" color="neutral" @click="onResetPassword" />
  </UCard>
</template>

<script setup lang="ts">
import type * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { loginSchema } from '../../../validation/schemas/input/inputUserSchemas'
import { getAuthErrorMessage, logAuthError } from '../../../errors/authErrors'
import PasswordToggleInput from '../Input/PasswordToggleInput.vue'
import ForgotPassword from '~/components/Modal/ForgotPassword.vue'
import { FunctionsHttpError } from '@supabase/supabase-js'

const supabase = useSupabaseClient()
const operationFeedbackHandler = useOperationFeedbackHandler();
const { requestPasswordReset } = useFlowActions();
const overlay = useOverlay();
const forgotPasswordModal = overlay.create(ForgotPassword);

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
      operationFeedbackHandler.displayError(getAuthErrorMessage(error, unknownErrorMessage))
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
        operationFeedbackHandler.displayError(getAuthErrorMessage(setSessionError, unknownErrorMessage))
      }
    } else {
      console.log(`Error calling the username login function: ${ JSON.stringify(error) }`);
      let description = unknownErrorMessage;
      if (error instanceof FunctionsHttpError) {
        const errorBody = await error.context.json();
        description = errorBody.code ? getAuthErrorMessage(errorBody) : (errorBody.message ?? unknownErrorMessage);
      }
      operationFeedbackHandler.displayError(description);
    }
  }
}

async function onResetPassword() {
  const instance = forgotPasswordModal.open();
  const res = await instance.result;
  if (res) {
    requestPasswordReset(res);
  }
}
</script>

<style scoped>
  .button {
    cursor: pointer;
  }
</style>
