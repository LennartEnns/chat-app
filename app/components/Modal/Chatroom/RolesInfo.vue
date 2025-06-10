<template>
  <UModal
    title="Member Roles"
    description="A member can have one of 4 roles with different privileges."
  >
    <template #body>
      <div class="space-y-4">
        <div v-for="(roleInfo, idx1) in roleInfos" :key="idx1">
          <div class="text-md font-bold text-highlighted flex flex-row items-center gap-x-2">
            <UIcon :name="roleInfo.icon" />
            {{ roleInfo.label }}
          </div>
          <ul class="text-sm text-muted list-inside list-disc">
            <li v-for="(privilege, idx2) in roleInfo.privileges" :key="idx2">
              {{ privilege }}
            </li>
          </ul>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import chatroomRolesVis from '~/visualization/chatroomRoles';

type RoleInfo = {
  label: string,
  icon: string,
  privileges: string[],
}
const roleInfos: RoleInfo[] = [
  {
    ...chatroomRolesVis.admin,
    privileges: [
      'Modify all chatroom properties',
      'Invite/remove members',
      'Change the role of non-admin members and much more',
    ], 
  },
  {
    ...chatroomRolesVis.mod,
    icon: 'i-lucide-sword',
    privileges: [
      'Invite users as Member/Viewer',
      'Change the role of Members/Viewers'
    ],
  },
  {
    ...chatroomRolesVis.member,
    icon: 'i-lucide-user-round',
    privileges: [
      'Write messages',
      'Edit/delete own messages'
    ],
  },
  {
    ...chatroomRolesVis.viewer,
    icon: 'i-lucide-eye',
    privileges: [
      'View messages and chatroom info, but not participate',
    ],
  },
]
</script>

<style>

</style>