import type * as z from 'zod';
import type { createGroupChatroomSchema } from "~~/validation/schemas/input/inputChatroomSchemas";
import { logPostgrestError, getPostgrestErrorMessage } from '~~/errors/postgrestErrors';
import type { TablesInsert } from '~~/database.types';
import type { CachedChatroomData, CachedChatroomsMap } from '~/types/chatroom';
import type { InvitationPreview } from '~/types/invitations/invitationsPreview';

type DirectChatroomData = {
  otherUserId: string,
};
type GroupChatroomData = z.output<typeof createGroupChatroomSchema>;

/**
 * Central composable for reusable chatroom client actions
 */
export const useChatroomActions = () => {
  const cachedChatrooms = useState<CachedChatroomsMap | undefined>('chatrooms');

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
    const newId = crypto.randomUUID();
    const { error } = await supabase.from('direct_chatrooms')
      .insert({
        chatroom_id: newId,
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
    // Fetch required data for the new chatroom and cache it
    if (cachedChatrooms.value) {
      const { data: singleCrData, error: singleCrError } = await supabase.from('chatrooms_preview')
        .select('name')
        .eq('id', newId)
        .single();
      if (singleCrError) {
        logPostgrestError(singleCrError, 'new chatroom fetching');
        operationFeedbackHandler.displayError('Could not load new chatroom');
        // Still return ID to be able to navigate to the new chatroom that was successfully created
        return newId;
      }
      // Cache in the cached chatrooms object
      const newCachedChatroom = {
        name: singleCrData.name,
        type: 'direct',
        other_user_id: chatroomData.otherUserId,
        current_user_role: null,
        last_activity: new Date().toISOString(),
        last_inside: new Date().toISOString(),
        last_message: null,
        number_new_messages: 0,
      } as CachedChatroomData;
      cachedChatrooms.value[newId] = newCachedChatroom;
    }

    operationFeedbackHandler.displaySuccess('New chatroom has been created');
    return newId;
  }

  async function createGroupChatroom(chatroomData: GroupChatroomData) {
    // Step 1: Insert chatroom
    const newId = crypto.randomUUID();
    const { error: creationError } = await supabase.from('group_chatrooms')
      .insert({
        chatroom_id: newId,
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
    // Cache new chatroom
    if (cachedChatrooms.value) {
      // Cache in the cached chatrooms object
      cachedChatrooms.value[newId] = {
        name: chatroomData.name,
        type: 'group',
        other_user_id: null,
        current_user_role: null,
        last_activity: new Date().toISOString(),
        last_inside: new Date().toISOString(),
        last_message: null,
        number_new_messages: 0,
      };
    }
    operationFeedbackHandler.displaySuccess('New chatroom has been created');

    if (chatroomData.invitations.length === 0) return newId;

    // Step 2: Invite users
    await inviteUsers(
      chatroomData.invitations.map((inv) => ({
        ...inv,
        chatroom_id: newId,
      }))
    );

    return newId;
  }

  async function joinGroupWithInvitation(invitation: InvitationPreview) {
    if (!invitation.chatroom_id) return;

    // Try to insert the user into user_to_group with the specified role
    const { error } = await supabase.from('user_to_group')
      .insert({
        chatroom_id: invitation.chatroom_id,
        role: invitation.as_role,
      });
    if (error) {
      logPostgrestError(error, 'invitation accept');
      operationFeedbackHandler.displayError('Could not add you to the group');
      return;
    }

    // Fetch required data for the new chatroom and cache it
    if (cachedChatrooms.value) {
      const { data: singleCrData, error: singleCrError } = await supabase.from('chatrooms_preview')
        .select('last_message')
        .eq('id', invitation.chatroom_id)
        .single();
      if (singleCrError) {
        logPostgrestError(singleCrError, 'entered chatroom fetching');
        operationFeedbackHandler.displayError('Could not load joined chatroom');
        return;
      }
      // Cache in the cached chatrooms object
      cachedChatrooms.value[invitation.chatroom_id] = {
        name: invitation.group_name!,
        type: 'group',
        other_user_id: null,
        current_user_role: invitation.as_role,
        last_activity: new Date().toISOString(),
        last_inside: new Date().toISOString(),
        last_message: singleCrData.last_message,
        number_new_messages: 0,
      };
    }
    // Open newly entered chatroom
    operationFeedbackHandler.displaySuccess(`Entered ${invitation.group_name ? `'${invitation.group_name}'` : 'new group'}`);
    navigateTo(`/chat/${invitation.chatroom_id}`);
  }

  async function leaveChatroom(id: string) {
    const { error } = await supabase.rpc('leave_chatroom', { cid: id });
    if (error) {
      logPostgrestError(error, 'Chatroom leave');
      operationFeedbackHandler.displayError(error.message ?? 'Could not leave the chatroom');
      return false;
    }
    // Remove from cached chatrooms
    if (cachedChatrooms.value) {
      cachedChatrooms.value = Object.fromEntries(
        Object.entries(cachedChatrooms.value).filter(([cid, _]) => cid !== id)
      );
    }
    operationFeedbackHandler.displaySuccess('Left the chatroom');
    return true;
  }

  async function deleteChatroom(id: string) {
    const { error } = await supabase
    .from("group_chatrooms")
    .delete()
    .eq("chatroom_id", id);
  if (error) {
    logPostgrestError(error, "group deletion");
    operationFeedbackHandler.displayError(
      getPostgrestErrorMessage(error, "Could not delete chatroom.")
    );
    return false
  } else {
    operationFeedbackHandler.displaySuccess("Deleted chatroom.");
    return true;
  }
  }

  return {
    createDirectChatroom,
    createGroupChatroom,
    inviteUsers,
    joinGroupWithInvitation,
    leaveChatroom,
    deleteChatroom,
  };
}
