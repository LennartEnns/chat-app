<template>
  <NuxtLayout name="settings">
    <USeparator label="Preferred Theme" class="mt-4" color="primary" />
    <URadioGroup
      v-model="colorMode.preference"
      :items="themeRadioItems"
      variant="card"
      class="mt-2"
    />

    <USeparator label="Main Color" class="mt-4" />
    <UDropdownMenu v-model:open="open" :items="computedItems as DropdownMenuItem[]" :ui="{ content: 'w-48' }">
      <UButton label="Change color" color="neutral" variant="outline" icon="i-lucide-pipette" />
      <template #item="{ item }">
        <div class="flex items-center gap-2 relative overflow-hidden" :class="{ 'shine-effect': item.isCurrent }">
          <div class="w-4 h-4 rounded" :class="item.colorClass"/>
          <span :class="item.label === 'Default' ? 'opacity-70' : ''">{{ item.label }}</span>
        </div>
      </template>
    </UDropdownMenu>
  </NuxtLayout>
</template>

<script lang="ts" setup>
import type { DropdownMenuItem, RadioGroupItem } from "@nuxt/ui";
import appConfig from "~/app.config";

const colorMode = useColorMode();

// --- Theme Selection ---
const themeRadioItems: Ref<RadioGroupItem[]> = ref([
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
]);

// --- Eigenes Color Interface ---
interface ColorItem extends DropdownMenuItem {
  colorClass: string | '';
  isCurrent?: boolean;
}

// --- Primary Color Selection ---

const currentColor = ref(appConfig.ui.colors.primary);
const open = ref(false)

const computedItems = computed(() => {
  return colorItems.map(item => ({
    ...item,
    isCurrent: item.label?.toLowerCase() === currentColor.value
  }));
});

function changeThemeColor(color: string) {  
  updateAppConfig({
    ui: {
      colors: {
        primary: color
      }
    }
  });
  currentColor.value = color;
}

defineShortcuts({
  o: () => open.value = !open.value
})

const colorItems: ColorItem[] = [
  {
    label: 'Default',
    icon: 'i-custom-color-block',
    colorClass: 'color-switch-default',
    onSelect() {changeThemeColor('default')}
  }, {
    label: 'Red',
    icon: 'i-custom-color-block',
    colorClass: 'bg-red-500',
    onSelect() {changeThemeColor('red')},
  }, {
    label: 'Yellow',
    icon: 'i-custom-color-block',
    colorClass: 'bg-yellow-500',
    onSelect() {changeThemeColor('yellow')},
  }, {
    label: 'Emerald',
    icon: 'i-custom-color-block',
    colorClass: 'bg-emerald-500',
    onSelect() {changeThemeColor('emerald')},
  }
  , {
    label: 'Sky',
    icon: 'i-custom-color-block',
    colorClass: 'bg-sky-500',
    onSelect() {changeThemeColor('sky')},
  }, {
    label: 'Blue',
    icon: 'i-custom-color-block',
    colorClass: 'bg-blue-500',
    onSelect() {changeThemeColor('blue')},
  }, {
    label: 'Violet',
    icon: 'i-custom-color-block',
    colorClass: 'bg-violet-500',
    onSelect() {changeThemeColor('violet')},
  }, {
    label: 'Fuchsia',
    icon: 'i-custom-color-block',
    colorClass: 'bg-fuchsia-500',
    onSelect() {changeThemeColor('fuchsia')},
  }, {
    label: 'Slate',
    icon: 'i-custom-color-block',
    colorClass: 'bg-slate-500',
    onSelect() {changeThemeColor('slate')},
  }
]
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

.color-switch-default {
  background-color: var(--color-default-500);
}

.shine-effect {
  position: relative;
}

.shine-effect::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent);
  animation: shine 2s infinite;
}

@keyframes shine {
  to {
    left: 150%;
  }
}

.gradient-text {
  background-image: radial-gradient(circle,rgba(255, 255, 255, 1) 40%, rgba(224, 224, 224, 1) 40%, rgba(204, 204, 204, 1) 60%);
  background-size: 200% auto;
  color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
  animation: textGradient 3s linear infinite;
  font-weight: 600;
}

@keyframes textGradient {
  to {
    background-position: 200% center;
  }
}
</style>
