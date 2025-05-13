<template>
  <div class="flex justify-center border-2 border-solid pageWrap h-100">
    <div class="mainContainer">
      <div>
        <UButton
          :icon="
            isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'
          "
          color="primary"
          variant="ghost"
          aria-label="Theme"
          @click="isDark = !isDark"
          size="sm"
        />
      </div>

      <USeparator label="Change bio" class="mt-4" />
      <p>{{ currentBio }}</p>
      <div>
        <UButton
          v-if="!editBio"
          label="Edit Bio"
          icon="i-material-symbols-edit-outline"
          @click="editBio = true"
          class="mt-2"
        />
      </div>
      <UFormField
        v-if="editBio"
        description="Tell us something about yourself."
        size="lg"
        class="mt-2"
      >
        <UButtonGroup size="sm" orientation="horizontal" class="bioGroup">
          <UTextarea
            v-model="bioInput"
            placeholder="Enter your bio here"
            label="Enter your bio here"
            class="bioInput"
            variant="outline"
            color="primary"
            :rows="2"
            :maxrows="2"
            autoresize
          />
          <UButton
            icon="i-material-symbols-save-outline"
            @click="saveBio"
            class="saveBioBtn"
          />
        </UButtonGroup>
      </UFormField>

      <USeparator label="Change theme" class="mt-4" />
      <URadioGroup
        v-model="selectedTheme"
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
      <UCollapsible class="flex flex-col gap-2 w-48 mt-2">
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
          <div class="flex flex-col gap-3 p-2">
            <UContainer class="changePW">
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

            <UContainer class="changePW">
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
                      showNewPasswordCheck ? 'i-lucide-eye-off' : 'i-lucide-eye'
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
            </UContainer>
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
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import type { RadioGroupItem, RadioGroupValue } from "@nuxt/ui";

// --- Color Mode ---
const colorMode = useColorMode();
const isDark = computed({
  get() {
    return colorMode.value === "dark";
  },
  set() {
    colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
  },
});

// --- Bio ---
const editBio = ref(false);
const currentBio = ref(
  "This is my bio. My name is JJ i am 1500m tall, I have big eyes and a very hairy back."
);
const bioInput = ref("");

const saveBio = () => {
  if (bioInput.value.trim()) {
    currentBio.value = bioInput.value.trim();
    bioInput.value = "";
  }
  editBio.value = false;
};

// --- Theme Selection ---
const themeRadioItems = ref<RadioGroupItem[]>([
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
]);
const selectedTheme = ref<RadioGroupValue>("system");
// Watch selectedTheme to potentially apply changes if not automatically handled by Nuxt UI / ColorMode
// watch(selectedTheme, (newTheme) => {
//   if (newTheme === 'system') colorMode.preference = 'system';
//   else if (newTheme === 'light') colorMode.preference = 'light';
//   else if (newTheme === 'dark') colorMode.preference = 'dark';
// });

// --- Custom Feature Switch ---
const featureEnabled = ref(true); // Default value from original `default-value`

// --- Password Management ---
const currentActualPassword = ref("jan"); // Stored current password
const attemptedPasswordChange = ref(false); // To control when validation messages appear

const showOldPassword = ref(false);
const showNewPassword = ref(false);
const showNewPasswordCheck = ref(false);

const passwordOld = ref("");
const passwordNew = ref("");
const passwordNewCheck = ref("");

const resetPasswordForm = () => {
  passwordOld.value = "";
  passwordNew.value = "";
  passwordNewCheck.value = "";
  showOldPassword.value = false;
  showNewPassword.value = false;
  showNewPasswordCheck.value = false;
  attemptedPasswordChange.value = false;
};

const handleChangePassword = () => {
  attemptedPasswordChange.value = true;

  if (passwordOld.value !== currentActualPassword.value) {
    // Old password does not match
    // Error message is shown via template conditional
    return;
  }

  if (!passwordNew.value) {
    // New password cannot be empty
    // Could add a specific error message or rely on general mismatch if check is also empty
    return;
  }

  if (passwordNew.value !== passwordNewCheck.value) {
    // New passwords do not match
    // Error message is shown via template conditional
    return;
  }

  // All checks passed
  currentActualPassword.value = passwordNew.value;
  alert("Password changed successfully!"); // Replace with a proper notification
  resetPasswordForm();
};

// --- Tabs ---
const tabItems = [
  {
    label: "Profile", // Renamed for potential clarity
    icon: "i-heroicons-information-circle",
    content: "This is the content shown for Profile.",
  },
  {
    label: "Downloads", // Renamed
    icon: "i-heroicons-arrow-down-tray",
    content: "And, this is the content for Downloads.",
  },
  {
    label: "Appearance", // Renamed
    icon: "i-heroicons-eye-dropper",
    content: "Finally, this is the content for Appearance.",
  },
];
</script>

<style scoped>
/* Add any component-specific styles here if needed */
.pageWrap {
  /* Example: min-height: 100vh; */
  /* h-100 is likely a utility class, ensure it does what you expect */
  padding: 20px; /* Added some padding for better spacing */
}

.mainContainer {
  display: flex;
  flex-direction: column;
  gap: 1rem; /* Consistent spacing between sections */
  width: 100%;
  max-width: 600px; /* Constrain width for better readability */
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

.changePW {
}

.savePW_actions {
}

.savePWbtn {
}
</style>
