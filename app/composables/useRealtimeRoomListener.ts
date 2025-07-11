import type { Message } from "~/types/messages/messageLoading";
import type { REALTIME_SUBSCRIBE_STATES, RealtimeChannel } from '@supabase/supabase-js';
import type { Tables } from "~~/database.types";

// Payload types aligned with the payload contents from the DB
type PayloadInsertMessage = Omit<Tables<'messages'>, 'chatroom_id'> & { username: string };
type PayloadUpdateMessage = Pick<Tables<'messages'>, 'id' | 'content'>;
type PayloadDeleteMessage = Pick<Tables<'messages'>, 'id'>;

/**
 * Composable for listening to realtime events concerning the specified chatroom.
 * Modifies the passed `messages` array ref when an event occurs.
 */
export const useRealtimeRoomListener = (roomId: string, messages: Ref<Message[] | undefined>, onNewMessage: (msg: Message) => unknown) => {
  const supabase = useSupabaseClient();
  const updateLastInsideChatroom = useUpdateLastInsideChatroom();
  const messagesManipulator = useLocalMessagesManipulator(roomId, messages);
  const operationFeedbackHandler = useOperationFeedbackHandler();
  const user = useSupabaseUser();

  let channel: RealtimeChannel;
  const channelStatus = ref<REALTIME_SUBSCRIBE_STATES | null>(null);

  async function handleInsertPayload(payload: PayloadInsertMessage) {
    if (!messages.value) return;
    // Insert the message before the last message that is newer.
    // This is done because it might be an older message that has arrived after newer messages.
    // Using the created_at timestamp from the database ensures consistency.
    updateLastInsideChatroom(roomId);
    const newMsg: Message  = {
      ...payload,
      created_at: new Date(payload.created_at),
      is_own: payload.user_id === user.value?.id,
    }
    messagesManipulator.appendMessageTimeAware(newMsg);
    onNewMessage(newMsg);
  }
  async function handleUpdatePayload(payload: PayloadUpdateMessage) {
    if (!messages.value) return;
    const index = messages.value.findLastIndex((msg) => msg.id === payload.id);
    if (index < 0) return;
    messagesManipulator.updateMessageContent(index, payload.content);
  }
  async function handleDeletePayload(payload: PayloadDeleteMessage) {
    if (!messages.value) return;
    const index = messages.value.findLastIndex((msg) => msg.id === payload.id);
    if (index < 0) return;
    messagesManipulator.deleteMessage(index);
  }

  // Subscribe when entering chatroom page
  onMounted(async () => {
    await supabase.realtime.setAuth(); // Needed for Realtime Authorization
    channel = supabase
      .channel(`room:${roomId}`, {
        config: { private: true },
      })
      .on('broadcast', { event: 'insert' }, (msg) => handleInsertPayload(msg.payload as PayloadInsertMessage))
      .on('broadcast', { event: 'update' }, (msg) => handleUpdatePayload(msg.payload as PayloadUpdateMessage))
      .on('broadcast', { event: 'delete' }, (msg) => handleDeletePayload(msg.payload as PayloadDeleteMessage))
      .subscribe((status, error) => {
        channelStatus.value = status;
        if (error) {
          console.error(`Error during realtime room channel subscription: ${error}`);
          const message = getRealtimeStatusMessage(status);
          operationFeedbackHandler.displayError(`Could not connect to realtime stream: ${message}`);
        } else {
          console.log(`Messages listener status: ${status}`);
        }
      });
  });

  // Unsubscribe when leaving chatroom page
  onUnmounted(() => {
    supabase.removeChannel(channel);
  });

  return channelStatus;
}
