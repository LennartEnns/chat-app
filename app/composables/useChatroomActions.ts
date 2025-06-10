import type * as z from 'zod';
import type { createGroupChatroomSchema } from "~~/validation/schemas/input/inputChatroomSchemas";
import { logPostgrestError, getPostgrestErrorMessage } from '~~/errors/postgrestErrors';
import type { TablesInsert } from '~~/database.types';

type DirectChatroomData = {
  otherUserId: string,
};
type GroupChatroomData = z.output<typeof createGroupChatroomSchema>;

/**
 * Central composable for reusable chatroom client actions
 */
export const useChatroomActions = () => {
  const supabase = useSupabaseClient();
  const operationFeedbackHandler = useOperationFeedbackHandler();

  async function inviteUsers(invitations: TablesInsert<'group_invitations'>[]) {
    const { error: invitationError } = await supabase.from('group_invitations')
      .insert(invitations);
    if (invitationError) {
      logPostgrestError(invitationError, "group invitations insert");
      operationFeedbackHandler.displayError(
          getPostgrestErrorMessage(invitationError, 'Unknown error inviting users'),
      );
      return false;
    }
    const nUsers = invitations.length;
    operationFeedbackHandler.displaySuccess(`${nUsers > 1 ? `${nUsers} users have` : 'User has'} been invited`);
    return true;
  }

  async function createDirectChatroom(chatroomData: DirectChatroomData) {
    const id = crypto.randomUUID();
    const { error } = await supabase.from('direct_chatrooms')
      .insert({
        chatroom_id: id,
        user2_id: chatroomData.otherUserId
      });
    if (error) {
      logPostgrestError(error, "chatroom creation");
      let errorMessage = null;
      if (error.code === '23505') { // Uniqueness violation
        errorMessage = 'You already have a chat with this user';
      }
      operationFeedbackHandler.displayError(
          errorMessage ?? getPostgrestErrorMessage(error, 'Unknown error creating chatroom'),
      );
      return null;
    }
    operationFeedbackHandler.displaySuccess('New chatroom has been created');
    return id;
  }

  async function createGroupChatroom(chatroomData: GroupChatroomData) {
    // Step 1: Insert chatroom
    const id = crypto.randomUUID();
    const { error: creationError } = await supabase.from('group_chatrooms')
      .insert({
        chatroom_id: id,
        name: chatroomData.name,
        description: chatroomData.description,
      });
    if (creationError) {
      logPostgrestError(creationError, "chatroom creation");
      operationFeedbackHandler.displayError(
          getPostgrestErrorMessage(creationError, 'Unknown error creating chatroom'),
      );
      return null;
    }
    operationFeedbackHandler.displaySuccess('New chatroom has been created');

    if (chatroomData.invitations.length === 0) return id;

    // Step 2: Invite users
    await inviteUsers(
      chatroomData.invitations.map((inv) => ({
        ...inv,
        chatroom_id: id,
      }))
    );

    return id;
  }

  return {
    createDirectChatroom,
    createGroupChatroom,
    inviteUsers,
  };
}
