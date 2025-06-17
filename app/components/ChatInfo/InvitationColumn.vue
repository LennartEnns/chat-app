<template>
  <div class="pb-5 text-neutral-700 pt-5 md:pt-0 dark:text-white">
    <p :class="`font-bold flex justify-center ${textTheme}`">Invitations</p>
  </div>
  <div class="pb-5">
    <div
      v-for="(invitation, index) in keepInvites"
      :key="index"
      class="ring-0 glassContainer text-neutral-700 dark:text-white member invitation mb-2"
    >
      <UAvatar
        class="justify-self-center"
        icon="i-lucide-user"
        :src="
          (invitation.invitee_id && getAvatarUrl(invitation.invitee_id)) ||
          undefined
        "
      />
      <div
        class="flex flex-col items-center justify-center truncate px-[0.6rem]"
      >
        <div class="flex flex-row items-center w-full">
          <div class="truncate text-center font-bold">
            {{ invitation.invitee_username }}
          </div>
          <UBadge
            :color="getColor(invitation.as_role)"
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
        @click="deleteInvite(index, invitation.id)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Tables } from "~~/database.types";
import {
  getPostgrestErrorMessage,
  logPostgrestError,
} from "~~/errors/postgrestErrors";

const supabase = useSupabaseClient();
const operationFeedbackHandler = useOperationFeedbackHandler();

const props = defineProps<{
  invitations: ChatInvitation[];
  editBoolean: boolean;
  textTheme: string;
}>();

const keepInvites = ref<ChatInvitation[]>(props.invitations);

type ChatInvitation = Pick<
  Tables<"group_invitations_preview">,
  "id" | "invitee_id" | "as_role" | "invitee_username"
>;

async function deleteInvite(index: number, id: string | null) {
  keepInvites.value = keepInvites.value.toSpliced(index, 1);
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
