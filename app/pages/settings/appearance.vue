<template>
  <NuxtLayout name="settings">
    <USeparator label="Preferred Theme" class="mt-4" color="primary" />
    <URadioGroup
      v-model="colorMode.preference"
      :items="themeRadioItems"
      variant="card"
      class="mt-2"
    />

    <USeparator label="Main Color" class="mt-4" color="primary" />
    

  </NuxtLayout>
</template>

<script lang="ts" setup>
import type { RadioGroupItem } from "@nuxt/ui";

const colorMode = useColorMode();

// --- Theme Selection ---
const themeRadioItems: Ref<RadioGroupItem[]> = ref([
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
]);
</script>

<style scoped>
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
</style>
