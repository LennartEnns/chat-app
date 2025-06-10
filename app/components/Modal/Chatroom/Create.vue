<template>
  <UModal>
    <template #content>
      <UCard
        variant="subtle"
        class="border-1 border-gray-500"
        :ui="{
          header: 'text-center text-lg',
          root: 'max-h-screen overflow-y-scroll',
        }"
      >
        <template #header>
          <p class="font-bold">New Chatroom</p>
          <UTabs
            v-model="chatroomType"
            :items="chatroomTypeTabItems"
            :content="false"
            class="mt-2 w-full"
          />
        </template>

        <div>
          <FormChatCreateDirectChatroom v-if="chatroomType === 'direct'" @submit="onCreateDirectChatroom" />
          <FormChatCreateGroupChatroom v-else @submit="onCreateGroupChatroom" />
        </div>

        <template #footer>
          <div class="flex gap-3">
            <UButton
              class="flex-1 flex justify-center"
              color="primary"
              type="submit"
              :form="chatroomType === 'direct' ? 'direct-chatroom-form' : 'group-chatroom-form'"
            >
              {{ chatroomType === 'direct' ? 'Create' : 'Continue' }}
            </UButton>
            <UButton class="flex-1 flex justify-center" variant="outline" @click="onCancel">
              Cancel
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import type * as z from 'zod';
import type {
  createDirectChatroomSchema,
  createGroupChatroomSchema,
} from '~~/validation/schemas/input/inputChatroomSchemas';
import type { Enums } from '~~/database.types';
import type { TabsItem } from '@nuxt/ui';

type ChatroomCreationResult = {
  type: Enums<'chatroom_type'>,
  id: string,
};
const emit = defineEmits<{ close: [ChatroomCreationResult | null] }>();

const { createDirectChatroom, createGroupChatroom } = useChatroomActions();

const chatroomType = ref<Enums<'chatroom_type'>>('direct');
const chatroomTypeTabItems = ref<TabsItem[]>([{
  label: 'Single',
  value: 'direct',
  icon: 'i-lucide-user'
},
{
  label: 'Group',
  value: 'group',
  icon: 'i-lucide-users'
}]);


async function onCreateDirectChatroom(chatroomData: z.output<typeof createDirectChatroomSchema>) {
  const id = await createDirectChatroom({
    otherUserId: chatroomData.otherUser.user_id,
  });
  if (!id) return;

  emit("close", {
    type: chatroomType.value,
    id
  });
}
async function onCreateGroupChatroom(chatroomData: z.output<typeof createGroupChatroomSchema>) {
  const id = await createGroupChatroom(chatroomData);
  if (!id) return;

  emit("close", {
    type: chatroomType.value,
    id
  });
}
function onCancel() {
  emit("close", null);
}
</script>

<style>

</style>
