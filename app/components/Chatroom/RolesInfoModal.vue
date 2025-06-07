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
            {{ roleInfo.name }}
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
type RoleInfo = {
  name: string,
  icon: string,
  privileges: string[],
}
const roleInfos: RoleInfo[] = [
  {
    name: 'Admin',
    icon: 'i-lucide-crown',
    privileges: [
      'Modify all chatroom properties',
      'Invite/remove members',
      'Change the role of non-admin members and much more',
    ], 
  },
  {
    name: 'Mod',
    icon: 'i-lucide-sword',
    privileges: [
      'Invite users as Member/Viewer',
      'Change the role of Members/Viewers'
    ],
  },
  {
    name: 'Member',
    icon: 'i-lucide-user-round',
    privileges: [
      'Write messages',
      'Edit/delete own messages'
    ],
  },
  {
    name: 'Viewer',
    icon: 'i-lucide-eye',
    privileges: [
      'View messages and chatroom info, but not participate',
    ],
  },
]
</script>

<style>

</style>