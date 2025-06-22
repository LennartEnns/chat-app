<template>
  <div>
    <div class="pb-5 text-neutral-700 pt-5 md:pt-0 dark:text-white">
      <p :class="`font-bold flex justify-center ${textTheme}`">Invitations</p>
    </div>
    <div v-if="!pending && invitations.length > 0" class="pb-5">
      <div
        v-for="(invitation, index) in invitations"
        :key="index"
        class="ring-0 glassContainer text-neutral-700 dark:text-white member invitation mb-2"
      >
        <UAvatar
          class="justify-self-center cursor-pointer"
          icon="i-lucide-user"
          :src="
            (invitation.invitee_id && getAvatarUrl(invitation.invitee_id)) ||
            undefined
          "
          @click="navigateTo(`/profile/${invitation.invitee_username}`)"
        />
        <div
          class="flex flex-col items-center justify-center truncate px-[0.6rem]"
        >
          <div class="flex flex-row items-center w-full">
            <ULink :to="`/profile/${invitation.invitee_username}`" class="truncate text-center font-bold">
              {{ invitation.invitee_username }}
            </ULink>
            <UBadge
              :color="rolesVis[invitation.as_role!].color"
              class="ml-4 font-bold rounded-full"
              :ui="{
                base: 'max-w-11 h-5 text-[10px] flex justify-center',
              }"
              >{{ invitation.as_role }}</UBadge
            >
          </div>
        </div>
        <UButton
          icon="i-lucide-trash-2"
          class="size-fit"
          @click="onDeleteInvitation(index, invitation.id)"
        />
      </div>
    </div>
    <div v-else-if="pending">
      <USkeleton v-for="i in 3" :key="i" class="w-full h-20" />
    </div>
    <div v-else class="p-2 text-muted">
      No invitations
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  getPostgrestErrorMessage,
  logPostgrestError,
} from "~~/errors/postgrestErrors";
import rolesVis from '~/visualization/chatroomRoles';
import type { ChatInvitation } from "~/types/chatroomInfo";

const supabase = useSupabaseClient();
const operationFeedbackHandler = useOperationFeedbackHandler();

const invitations = defineModel<ChatInvitation[]>({
  required: true,
});

defineProps<{
  pending: boolean,
  editBoolean: boolean,
  textTheme: string,
}>();

async function onDeleteInvitation(index: number, id: string) {
  invitations.value = invitations.value.toSpliced(index, 1);
  const { error } = await supabase
    .from("group_invitations")
    .delete()
    .eq("id", id!);
  if (error) {
    logPostgrestError(error, "invitation deletion");
    operationFeedbackHandler.displayError(
      getPostgrestErrorMessage(error, "Could not delete chatroom invitation.")
    );
  } else {
    operationFeedbackHandler.displaySuccess("Deleted Chatroom Invitation.");
  }
}
</script>

<style></style>
