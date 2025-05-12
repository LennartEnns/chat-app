<template>
  <UApp>
    <div class="flex justify-center border-2 border-solid pageWrap h-100">
      <div class="mainContainer">
        <UButton
          :icon="
            isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'
          "
          variant="ghost"
          aria-label="Theme"
          @click="isDark = !isDark"
        />
        <!-- <UIcon name="i-lucide-settings" class="size-5" /> -->
        <!-- BIOGRAPHY -->
        <USeparator label="Change bio" />
        <p>{{ currentBio }}</p>
        <UButton
          label="Edit Bio"
          @click="editBio = true"
          v-if="!editBio"
          icon="i-material-symbols-edit-outline"
        />
        <UFormField
          description="Tell us something about yourself."
          size="lg"
          v-if="editBio"
        >
          <UButtonGroup size="sm" orientation="horizontal" class="bioGroup">
            <UInput
              label="Enter your bio here"
              class="bioInput"
              v-model="bio"
              placeholder="Enter your bio here"
            />
            <UButton
              icon="i-material-symbols-save-outline"
              @click="
                if (bio) {
                  currentBio = bio;
                  bio = '';
                }
                editBio = false;
              "
            />
          </UButtonGroup>
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
              description="enter your old password to continue"
              size="lg"
            ></UFormField
          ></UButton>

          <template #content>
            <UContainer class="changePW">
              <UInput
                v-model="passwordOld"
                placeholder="Old password"
                :type="showOld ? 'text' : 'password'"
                :ui="{ trailing: 'pe-1' }"
                required
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
                </template> </UInput
            ></UContainer>

            <UContainer class="changePW"
              ><UInput
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
                    :aria-label="
                      showNewCheck ? 'Hide password' : 'Show password'
                    "
                    :aria-pressed="showNewCheck"
                    aria-controls="password"
                    @click="showNewCheck = !showNewCheck"
                  />
                </template> </UInput
            ></UContainer>
            <UContainer class="savePW">
              <UButton class="savePWbtn">Save</UButton>
              <UButton variant="ghost">Reset old password</UButton>
            </UContainer>
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

let editBio = ref(false);
let currentBio = ref("This is my bio");
const bio = ref("");

const showOld = ref(false);

const showNew = ref(false);
const showNewCheck = ref(false);
const passwordOld = ref("");
const passwordNew = ref("");
const passwordNewCheck = ref("");

const colorMode = useColorMode();
const isDark = computed({
  get() {
    return colorMode.value === "dark";
  },
  set() {
    colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
  },
});
</script>

<style>
.pageWrap {
  padding: 5%;
  min-height: 100vh;
  /* border: 1px solid blue; */
}
.mainContainer {
  width: 50%;
  min-width: 24rem;
  min-height: 100%; /* 
  border: 1px solid red; */
}
.mainContainer > * {
  margin-bottom: 3%;
}
.bioGroup {
  width: 100%;
}
.bioInput {
  width: 60%;
}
.changePW div {
  margin: 1.5% 0;
  margin-right: 3%;
}
.changePW {
  padding: 0;
  width: 100%;
}
.savePW {
  padding: 0;
}
.savePWbtn {
  margin: 1.5% 0;
  margin-right: 3%;
}
</style>
