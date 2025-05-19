<template>
  <NuxtLayout name="logged-in">
    <div class="flex justify-center pageWrap grow">
      <div class="mainContainer">
        <USeparator label="Preferred Theme" class="mt-4" />
        <URadioGroup
          v-model="colorMode.preference"
          :items="themeRadioItems"
          variant="card"
          class="mt-2"
        />

        <USeparator label="Customization" class="mt-4" />
        <USwitch
          v-model="featureEnabled"
          unchecked-icon="i-lucide-x"
          checked-icon="i-lucide-check"
          label="Use this feature"
          class="mt-2"
        />

        <USeparator label="Change password" class="mt-4" />
        <UCollapsible class="flex flex-col gap-2 mt-2">
          <UButton
            class="group"
            color="neutral"
            variant="subtle"
            trailing-icon="i-lucide-chevron-down"
            :ui="{
              trailingIcon:
                'group-data-[state=open]:rotate-180 transition-transform duration-200',
            }"
            block
          >
            <UFormField
              label="Change password"
              description="Enter your old password to continue"
              size="lg"
            />
          </UButton>

          <template #content>
            <div class="flex flex-col gap-3 p-2 changePW">
              <UContainer>
                <UInput
                  v-model="passwordOld"
                  placeholder="Old password"
                  :type="showOldPassword ? 'text' : 'password'"
                  :ui="{ trailing: 'pe-1' }"
                  required
                >
                  <template #trailing>
                    <UButton
                      color="neutral"
                      variant="link"
                      size="sm"
                      :icon="
                        showOldPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'
                      "
                      :aria-label="
                        showOldPassword ? 'Hide password' : 'Show password'
                      "
                      :aria-pressed="showOldPassword"
                      aria-controls="passwordOldInput"
                      @click="showOldPassword = !showOldPassword"
                    />
                  </template>
                </UInput>
                <p
                  v-if="
                    attemptedPasswordChange &&
                    passwordOld &&
                    passwordOld !== currentActualPassword
                  "
                  class="text-red-500 text-xs mt-1"
                >
                  The entered password does not match the old password.
                </p>
              </UContainer>

              <UContainer>
                <UInput
                  v-model="passwordNew"
                  placeholder="New password"
                  :type="showNewPassword ? 'text' : 'password'"
                  :ui="{ trailing: 'pe-1' }"
                >
                  <template #trailing>
                    <UButton
                      color="neutral"
                      variant="link"
                      size="sm"
                      :icon="
                        showNewPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'
                      "
                      :aria-label="
                        showNewPassword ? 'Hide password' : 'Show password'
                      "
                      :aria-pressed="showNewPassword"
                      aria-controls="passwordNewInput"
                      @click="showNewPassword = !showNewPassword"
                    />
                  </template>
                </UInput>
                <br />
                <UInput
                  v-model="passwordNewCheck"
                  placeholder="Re-enter new password"
                  :type="showNewPasswordCheck ? 'text' : 'password'"
                  :ui="{ trailing: 'pe-1' }"
                  class="mt-2"
                >
                  <template #trailing>
                    <UButton
                      color="neutral"
                      variant="link"
                      size="sm"
                      :icon="
                        showNewPasswordCheck
                          ? 'i-lucide-eye-off'
                          : 'i-lucide-eye'
                      "
                      :aria-label="
                        showNewPasswordCheck ? 'Hide password' : 'Show password'
                      "
                      :aria-pressed="showNewPasswordCheck"
                      aria-controls="passwordNewCheckInput"
                      @click="showNewPasswordCheck = !showNewPasswordCheck"
                    />
                  </template>
                </UInput>
                <p
                  v-if="
                    attemptedPasswordChange &&
                    passwordNew &&
                    passwordNewCheck &&
                    passwordNew !== passwordNewCheck
                  "
                  class="text-red-500 text-xs mt-1"
                >
                  Please make sure the new passwords match.
                </p>
              </UContainer>

              <UContainer class="savePW_actions flex gap-2 mt-2">
                <UButton class="savePWbtn" @click="handleChangePassword"
                  >Change password</UButton
                >
                <UButton variant="ghost" @click="resetPasswordForm"
                  >Cancel</UButton
                >
              </UContainer>
            </div>
          </template>
        </UCollapsible>

        <UTabs :items="tabItems" orientation="vertical" />
      </div>
    </div>
  </NuxtLayout>
</template>

<script lang="ts" setup>
import type { RadioGroupItem } from "@nuxt/ui";

// --- Theme Selection ---
const themeRadioItems: Ref<RadioGroupItem[]> = ref([
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
]);

const colorMode = useColorMode();

// --- Custom Feature Switch ---
const featureEnabled: Ref<boolean> = ref(true);

// --- Password Management ---
const currentActualPassword: Ref<string> = ref("jan");
const attemptedPasswordChange: Ref<boolean> = ref(false);

const showOldPassword: Ref<boolean> = ref(false);
const showNewPassword: Ref<boolean> = ref(false);
const showNewPasswordCheck: Ref<boolean> = ref(false);

const passwordOld: Ref<string> = ref("");
const passwordNew: Ref<string> = ref("");
const passwordNewCheck: Ref<string> = ref("");

const resetPasswordForm = (): void => {
  passwordOld.value = "";
  passwordNew.value = "";
  passwordNewCheck.value = "";
  showOldPassword.value = false;
  showNewPassword.value = false;
  showNewPasswordCheck.value = false;
  attemptedPasswordChange.value = false;
};

const handleChangePassword = (): void => {
  attemptedPasswordChange.value = true;
  if (passwordOld.value !== currentActualPassword.value) {
    return; // Old password does not match
  }

  if (!passwordNew.value) {
    return; // New password cannot be empty
  }

  if (passwordNew.value !== passwordNewCheck.value) {
    return; // New passwords do not match
  }
  // All checks passed
  currentActualPassword.value = passwordNew.value;
  alert("Password changed successfully!");
  resetPasswordForm();
};

// --- Tabs ---
// Define a type for tab items
interface TabItem {
  label: string;
  icon: string;
  content: string;
}

const tabItems: TabItem[] = [
  {
    label: "Profile",
    icon: "i-heroicons-information-circle",
    content: "This is the content shown for Profile.",
  },
  {
    label: "Downloads",
    icon: "i-heroicons-arrow-down-tray",
    content: "And, this is the content for Downloads.",
  },
  {
    label: "Appearance",
    icon: "i-heroicons-eye-dropper",
    content: "Finally, this is the content for Appearance.",
  },
];

// export {
//   isDark,
//   editBio,
//   currentBio,
//   bioInput,
//   saveBio,
//   themeRadioItems,
//   selectedTheme,
//   featureEnabled,
//   showOldPassword,
//   showNewPassword,
//   showNewPasswordCheck,
//   passwordOld,
//   passwordNew,
//   passwordNewCheck,
//   resetPasswordForm,
//   handleChangePassword,
//   tabItems,
//   attemptedPasswordChange,
// };
</script>

<style scoped>
.pageWrap {
  padding: 20px;
}

.mainContainer {
  display: flex;
  flex-direction: column;
  gap: 1rem; /* Consistent spacing between sections */
  width: 100%;
  max-width: 30rem;
}

.bioGroup {
  display: flex;

  height: max-content;
}

.bioInput {
  flex-grow: 1;
}
.bioInput * {
  border-radius: 5px 0px 0px 5px;
  /* border: 1px solid red; */
}
.saveBioBtn {
  flex-grow: 1;
  min-height: 100%;
}

.changePW div {
  padding-left: 0;
  margin-top: 1%;
}

.savePW_actions {
}

.savePWbtn {
}
</style>
