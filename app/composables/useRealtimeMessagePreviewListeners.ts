import type { Message } from "~/types/messages/messageLoading";
import type { REALTIME_SUBSCRIBE_STATES, RealtimeChannel } from '@supabase/supabase-js';

// Payload types aligned with the payload contents from the DB


/**
 * Composable for listening to realtime events concerning the message previews of a user's chatrooms.
 * Manages subscriptions based on the chatroom previews map from shared state.
 * Modifies the map when an event occurs.
 */
export const useRealtimeMessagePreviewListeners = async () => {
  const supabase = useSupabaseClient();
  const operationFeedbackHandler = useOperationFeedbackHandler();
  const user = useSupabaseUser();

  let channel: RealtimeChannel;
  const channelStatus = ref<REALTIME_SUBSCRIBE_STATES | null>(null);

  

  // Subscribe when entering chatroom page
  onMounted(async () => {
    await supabase.realtime.setAuth(); // Needed for Realtime Authorization
    channel = supabase
      .channel(`preview:${roomId}`, {
        config: { private: true },
      })
      .on('broadcast', { event: 'insert' }, (msg) => handleInsertPayload(msg.payload as MessageInsertPayload))
      .on('broadcast', { event: 'update' }, (msg) => handleUpdatePayload(msg.payload as MessageUpdatePayload))
      .on('broadcast', { event: 'delete' }, (msg) => handleDeletePayload(msg.payload as MessageDeletePayload))
      .subscribe((status, error) => {
        channelStatus.value = status;
        if (error) {
          const message = getRealtimeStatusMessage(status);
          console.error(`Error during realtime room channel subscription: ${error}`);
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
