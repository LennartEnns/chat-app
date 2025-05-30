<template>
  <UModal
    :close="{ onClick: onCancel }"
    title="Reset Password"
    description="Please enter the email address of your account so we can send you a reset link."
  >
    <template #title>
      Reset Password
    </template>
    <template #body>
      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField label="Email Address" name="email" required>
          <UInput v-model="state.email" class="w-full" />
        </UFormField>
        <UButton label="Cancel" color="neutral" variant="link" class="pl-0" @click="onCancel" />
        <UButton label="Send reset link" variant="link" type="submit" />
      </UForm>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import { z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';
import { emailSchema } from '~~/validation/schemas/input/inputUserSchemas';

const emit = defineEmits<{ close: [string | null] }>();

const schema = z.object({
  email: emailSchema,
});
type Schema = z.output<typeof schema>;
const state = reactive<Partial<Schema>>({
  email: undefined,
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  emit('close', event.data.email);
}
async function onCancel() {
  emit('close', null);
}
</script>

<style>

</style>