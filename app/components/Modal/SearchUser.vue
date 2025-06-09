<template>
  <UModal v-model:open="modalOpen">
    <slot />
    <template #content>
      <UCommandPalette
        v-model:search-term="searchTerm"
        :groups="groups"
        close
        placeholder="Search by name..."
        :loading="loading"
        loading-icon="i-lucide-loader"
        :fuse="{
          matchAllWhenSearchEmpty: false,
        }"
        :ui="{
          item: 'cursor-pointer size-xl',
          itemLabelSuffix: 'ml-1',
        }"
        @update:model-value="onModelUpdate"
        @update:open="onOpenUpdate">
        <template #empty>
          No users
        </template>
      </UCommandPalette>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import type { CommandPaletteItem } from '@nuxt/ui';
import type { UserSearchResult, UserCommandPaletteItem } from '~/types/userSearch';

const {
  searchTerm,
  groups,
  loading,
  excludeIds: searchExcludeIds,
  excludeGroupId: searchExcludeGroupId,
  excludeHasInvitationsTo: searchExcludeInvitationsTo,
} = useUserSearch();

const { excludeIds = [], excludeGroupId = null, excludeHasInvitationsTo = null } = defineProps<{
  excludeIds?: string[],
  excludeGroupId?: string,
  excludeHasInvitationsTo?: string,
}>();

const emit = defineEmits<{ close: [UserSearchResult | null] }>()
const modalOpen = ref(false);

watch(() => excludeIds, (exclude) => {
  searchExcludeIds.value = exclude;
}, {
  immediate: true,
});
watch(() => excludeGroupId, (excludeId) => {
  searchExcludeGroupId.value = excludeId;
}, {
  immediate: true,
});
watch(() => excludeHasInvitationsTo, (excludeId) => {
  searchExcludeInvitationsTo.value = excludeId;
}, {
  immediate: true,
});

async function onModelUpdate(value: CommandPaletteItem) {
  modalOpen.value = false;
  emit('close', (value as UserCommandPaletteItem).user);
}
async function onOpenUpdate(open: boolean) {
  if (!open) {
    modalOpen.value = false;
    emit('close', null);
  }
}
</script>

<style>

</style>
