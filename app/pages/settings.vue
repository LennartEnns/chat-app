<template>
  <UApp>
    <div class="flex justify-center border-2 border-solid pageWrap h-100">
      <div class="mainContainer">
        <UIcon name="i-lucide-settings" class="size-5" />
        <!-- BIOGRAPHY -->
        <USeparator label="Change bio" />
        <UFormField description="Tell us something about yourself." size="lg">
          <UInput placeholder="Enter your bio here" class="w-full" />
        </UFormField>

        <!-- SELECT THEME -->
        <USeparator label="Change theme" />
        <URadioGroup v-model="value" :items="items" variant="card" />

        <!-- USPECIFIED FEATURE SWITCH -->
        <USeparator label="Customization" />
        <USwitch
          unchecked-icon="i-lucide-x"
          checked-icon="i-lucide-check"
          default-value
          label="Use this feature"
        />
        <!-- Change PASSWORD -->
        <USeparator label="Change password" />
        <UCollapsible class="flex flex-col gap-2 w-48">
          <UButton
            class="group"
            label="Open"
            color="neutral"
            variant="subtle"
            trailing-icon="i-lucide-chevron-down"
            :ui="{
              trailingIcon:
                'group-data-[state=open]:rotate-180 transition-transform duration-200',
            }"
            block
          />
          <UFormField
            label="Change password"
            description="enter your old password to continue"
            size="lg"
          ></UFormField>

          <template #content>
            <UInput
              v-model="passwordOld"
              placeholder="Old password"
              :type="showOld ? 'text' : 'password'"
              :ui="{ trailing: 'pe-1' }"
            >
              <template #trailing>
                <UButton
                  color="neutral"
                  variant="link"
                  size="sm"
                  :icon="showOld ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  :aria-label="showOld ? 'Hide password' : 'Show password'"
                  :aria-pressed="showOld"
                  aria-controls="password"
                  @click="showOld = !showOld"
                />
              </template>
            </UInput>

            <UInput
              v-model="passwordNew"
              placeholder="New password"
              :type="showNew ? 'text' : 'password'"
              :ui="{ trailing: 'pe-1' }"
            >
              <template #trailing>
                <UButton
                  color="neutral"
                  variant="link"
                  size="sm"
                  :icon="showNew ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  :aria-label="showNew ? 'Hide password' : 'Show password'"
                  :aria-pressed="showNew"
                  aria-controls="password"
                  @click="showNew = !showNew"
                />
              </template>
            </UInput>

            <UInput
              v-model="passwordNewCheck"
              placeholder="Re-enter new password"
              :type="showNewCheck ? 'text' : 'password'"
              :ui="{ trailing: 'pe-1' }"
            >
              <template #trailing>
                <UButton
                  color="neutral"
                  variant="link"
                  size="sm"
                  :icon="showNewCheck ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  :aria-label="showNewCheck ? 'Hide password' : 'Show password'"
                  :aria-pressed="showNewCheck"
                  aria-controls="password"
                  @click="showNewCheck = !showNewCheck"
                />
              </template>
            </UInput>
          </template>
        </UCollapsible>
      </div>
    </div>
  </UApp>
</template>

<script lang="ts" setup>
import RegistrationForm from "~/components/Form/RegistrationForm.vue";
// import UFormField from "~/components/Form/FormField.vue";
import type { RadioGroupItem, RadioGroupValue } from "@nuxt/ui";

const items = ref<RadioGroupItem[]>(["System", "Light", "Dark"]);
const value = ref<RadioGroupValue>("System");

const showOld = ref(false);

const showNew = ref(false);
const showNewCheck = ref(false);
const passwordOld = ref("");
const passwordNew = ref("");
const passwordNewCheck = ref("");
</script>

<style>
.pageWrap {
  min-height: 100vh;
  /* border: 1px solid blue; */
}
.mainContainer {
  width: 60%;
  min-height: 100%; /* 
  border: 1px solid red; */
}
.mainContainer > * {
  margin-bottom: 3%;
}
</style>
