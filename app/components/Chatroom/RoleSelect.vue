<template>
  <USelect v-model="model" :items="itemsWithIcon" :icon="roleIcons[model]">
    <template #content-bottom>
      <UButton label="Info" icon="i-lucide-circle-help" variant="outline" color="info" class="text-muted" @click="helpModal.open()" />
    </template>
  </USelect>
</template>

<script lang="ts" setup>
import type { SelectItem } from '@nuxt/ui';
import type { Enums } from '~~/database.types';
import RolesInfoModal from './RolesInfoModal.vue';

const model = defineModel<Enums<'chatroom_role'>>({ 
  required: true,
  default: 'member',
});

const roleIcons: { [k in Enums<'chatroom_role'>]: string } = {
  admin: 'i-lucide-crown',
  mod: 'i-lucide-sword',
  member: 'i-lucide-user-round',
  viewer: 'i-lucide-eye',
}
const items = ref<SelectItem[]>([
  {
    label: 'Admin',
    value: 'admin',
  },
  {
    label: 'Mod',
    value: 'mod',
  },
  {
    label: 'Member',
    value: 'member',
  },
  {
    label: 'Viewer',
    value: 'viewer',
  },
]);
// @ts-expect-error ignore deep type instantiation warning
const itemsWithIcon = computed(() => items.value.map((item) => ({ ...item, icon: roleIcons[item.value] })));

const overlay = useOverlay();
const helpModal = overlay.create(RolesInfoModal);
</script>

<style>

</style>
