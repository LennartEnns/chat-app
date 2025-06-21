<template>
  <div>
    <UModal v-model:open="searchModalOpen">
      <UButton
        color="neutral"
        variant="subtle"
        icon="i-lucide-users-round"
        class="w-full rounded-b-none"
        @click="onSearchModalOpen"
      >
        <span>Search Groups...</span>
        <div class="flex-1" />
        <UIcon name="i-lucide-chevron-right" size="xl" />
      </UButton>
      <template #content>
        <UCommandPalette
          v-model:search-term="searchTerm"
          :groups="groupCPGroups"
          close
          placeholder="Search by name..."
          loading-icon="i-lucide-loader"
          :loading="loadingGroups"
          :fuse="{
            matchAllWhenSearchEmpty: true,
          }"
          :ui="{
            item: 'cursor-pointer size-xl',
            itemLabelSuffix: 'ml-1',
          }"
          @update:open="onOpenUpdate"
        >
          <template #empty>{{ `No ${!!selectedGroup ? 'other ' : ''} groups` }}</template>
          <template #item-trailing="{ index }">
            <div class="flex flex-row items-center justify-end">
              <UIcon
                :name="
                  chatroomRolesVis[
                    allGroups[index]?.current_user_role ?? 'viewer'
                  ].icon
                "
                class="mr-2"
              />
              <div class="text-muted">
                {{
                  chatroomRolesVis[
                    allGroups[index]?.current_user_role ?? "viewer"
                  ].label
                }}
              </div>
            </div>
          </template>
        </UCommandPalette>
      </template>
    </UModal>
    <div
      v-if="!selectedGroup"
      class="text-muted border-1 border-accented rounded-lg p-2 border-t-0 rounded-t-none"
    >
      Select a group
    </div>
    <div
      v-else
      class="p-1 space-y-1 border-1 border-accented rounded-lg border-t-0 rounded-t-none"
    >
      <div class="flex flex-row items-center justify-start gap-3">
        <UAvatar :src="selectedGroupAvatarUrl" icon="i-lucide-users" size="sm" />
        <span>
          {{ selectedGroup.name }}
        </span>
        <div class="flex flex-row items-center gap-1">
          <UIcon
            :name="
              chatroomRolesVis[selectedGroup.current_user_role ?? 'viewer'].icon
            "
          />
          {{
            chatroomRolesVis[selectedGroup.current_user_role ?? "viewer"].label
          }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { SelectedGroup } from "~/types/invitations/groupInvitationCreation";
import type { CommandPaletteItem } from "@nuxt/ui";
import type { Enums } from "~~/database.types";
import chatroomRolesVis from "~/visualization/chatroomRoles";
import { logPostgrestError } from "~~/errors/postgrestErrors";

const selectedGroup = defineModel<SelectedGroup | undefined>({
  required: true,
});
const { data: selectedGroupAvatarUrl } = useLazyAsyncData('selectedGroupAvatarUrl', async () => {
  const selectedId = selectedGroup.value?.chatroom_id;
  if (!selectedId) return undefined;
  return await getCachedSignedImageUrl(
    "chatroom_avatars",
    getGroupAvatarPath(selectedId)
  );
}, {
  immediate: true,
  watch: [() => selectedGroup.value?.chatroom_id],
});

const props = defineProps<{
  // Only display groups where the current user has one of these roles
  allowedCurrentUserRoles: Enums<"chatroom_role">[];
}>();

const supabase = useSupabaseClient();
const operationFeedbackHandler = useOperationFeedbackHandler();

// For better integration with forms
const { emitFormChange } = useFormField();
watch(selectedGroup, () => emitFormChange());

const searchModalOpen = ref(false);
const searchTerm = ref("");
const allGroups = ref<SelectedGroup[]>([]);
let groupsLoaded = false;
const loadingGroups = ref(false);
const { data: groupSearchItems } = useLazyAsyncData<CommandPaletteItem[]>('groupSearchItems', async () =>
  await Promise.all(allGroups.value.map(async (group) =>
    ({
      id: group.chatroom_id,
      label: group.name,
      avatar: {
        src: await getCachedSignedImageUrl(
          "chatroom_avatars",
          getGroupAvatarPath(group.chatroom_id),
        ),
        icon: "i-lucide-user",
        ui: {
          icon: "size-11/12",
        },
      },
      onSelect: () => onGroupSelected(group),
    } as CommandPaletteItem))
  ), {
    immediate: true,
    server: true,
    watch: [() => allGroups.value.map((group) => group.chatroom_id)],
  }
);
// @ts-expect-error ignore deep type instantiation warning
const groupCPGroups = computed<CommandPaletteGroup<CommandPaletteItem>[]>(
  () => [
    {
      id: "groups",
      label: searchTerm.value
        ? `Groups matching “${searchTerm.value}”...`
        : "Groups",
      items: groupSearchItems.value,
    },
  ]
);

async function loadGroups() {
  loadingGroups.value = true;
  const { data, error } = await supabase
    .from("group_chatrooms_last_activity_current_role")
    .select("chatroom_id, name, current_user_role")
    .in("current_user_role", props.allowedCurrentUserRoles)
    .order("last_activity", {
      ascending: false,
    });
  if (error) {
    logPostgrestError(error, "groups loading");
    operationFeedbackHandler.displayError("Error loading groups");
  } else if (data) {
    // Type conversion justified as chatroom_id returned from view will never be null
    allGroups.value = data as SelectedGroup[]; // HERE IT BREAKS!!!!
    groupsLoaded = true;
  }
  loadingGroups.value = false;
}
async function onSearchModalOpen() {
  if (!groupsLoaded) loadGroups();
  searchModalOpen.value = true;
}
async function onGroupSelected(value: SelectedGroup) {
  searchModalOpen.value = false;
  selectedGroup.value = value;
}
async function onOpenUpdate(open: boolean) {
  if (!open) searchModalOpen.value = false;
}
</script>
