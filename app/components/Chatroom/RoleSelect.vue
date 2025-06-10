<template>
  <USelect v-model="model" :items="itemsProcessed" :icon="chatroomRolesVisual[model].icon">
    <template #content-bottom>
      <UButton label="Info" icon="i-lucide-circle-help" variant="outline" color="info" class="text-muted" @click="helpModal.open()" />
    </template>
  </USelect>
</template>

<script lang="ts" setup>
import type { Enums } from '~~/database.types';
import RolesInfoModal from '../Modal/Chatroom/RolesInfo.vue';
import chatroomRolesVisual from '~/visualization/chatroomRoles';

const model = defineModel<Enums<'chatroom_role'>>({ 
  required: true,
  default: 'member',
});

const props = defineProps<{
  allowedRoles: [Enums<'chatroom_role'>, ...Enums<'chatroom_role'>[]], // Must not be empty
}>();

const itemsProcessed = computed(() => {
  return props.allowedRoles
    .map((role) => ({
      value: role,
      ...chatroomRolesVisual[role]
    }))
});

const overlay = useOverlay();
const helpModal = overlay.create(RolesInfoModal);
</script>

<style>

</style>
