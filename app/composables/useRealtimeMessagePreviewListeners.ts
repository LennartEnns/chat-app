import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Tables } from "~~/database.types";
import type { Nullable, RequireNonNull } from "~/types/tsUtils/helperTypes";
import type { CachedChatroomsMap } from "~/types/chatroom";

// Array of channels for the preview topics, extended with the ID of their room
type PreviewChannels = { channel: RealtimeChannel, roomId: string }[];

// Payload types aligned with the payload contents from the DB
type PayloadInsertMsg = Pick<Tables<'messages'>, 'content' | 'created_at'>;
type PayloadUpdateLast = RequireNonNull<Nullable<PayloadInsertMsg>, 'created_at'>;
type PayloadDeleteMsg = Pick<Tables<'messages'>, 'created_at'>;

/**
 * Composable for listening to realtime events concerning the message previews of a user's chatrooms.
 * Manages subscriptions based on the chatroom previews map from shared state.
 * Modifies the map when an event occurs.
 */
export const useRealtimeMessagePreviewListeners = async () => {
  const supabase = useSupabaseClient();
  const cachedChatrooms = useState<CachedChatroomsMap | undefined>('chatrooms');
  const routeChatroomId = useRouteIdParam();
  const subscribedChannels: PreviewChannels = [];

  async function handleInsertMsgPayload(payload: PayloadInsertMsg, roomId: string) {
    if (!cachedChatrooms.value) return;
    const cachedCr = cachedChatrooms.value[roomId];
    if (!cachedCr) return;

    cachedCr.number_new_messages++;

    const insertedDate = new Date(payload.created_at);
    const lastMessageDate = new Date(cachedCr.last_activity);
    // Check whether this event is not deprecated (sent after a newer message has been inserted)
    if (insertedDate.getTime() < lastMessageDate.getTime()) return;
    cachedCr.last_message = payload.content;
    cachedCr.last_activity = payload.created_at;
  }
  async function handleUpdateLastPayload(payload: PayloadUpdateLast, roomId: string) {
    if (!cachedChatrooms.value) return;
    const cachedCr = cachedChatrooms.value[roomId];
    if (!cachedCr) return;

    const newLastCreationDate = new Date(payload.created_at);
    const lastMessageDate = new Date(cachedCr.last_activity);
    // Check whether this event is not deprecated (sent after a newer message has been inserted)
    if (newLastCreationDate.getTime() < lastMessageDate.getTime()) return;
    cachedCr.last_message = payload.content;
  }
  async function handleDeleteMsgPayload(payload: PayloadDeleteMsg, roomId: string) {
    if (!cachedChatrooms.value) return;
    const cachedCr = cachedChatrooms.value[roomId];
    if (!cachedCr) return;

    const deletedCreationDate = new Date(payload.created_at);
    const lastInsideDate = new Date(cachedCr.last_activity);
    // Only decrease new messages counter if the deleted message has been written after user was last inside the chatroom
    if (deletedCreationDate.getTime() < lastInsideDate.getTime()) return;
    if (cachedCr.number_new_messages > 0) {
      cachedCr.number_new_messages--;
    }
  }

  // Preview channels are (re-)computed and subscribed/unsubscribed when chatrooms list changes.
  watch(cachedChatrooms, async (cached) => {
    if (!cached) {
      subscribedChannels.forEach((ch) => supabase.removeChannel(ch.channel));
      subscribedChannels.length = 0;
      return;
    };
    // Unsubscribe from channels that do not have an associated cached preview anymore
    // Also, just in case the active chatroom is somehow subscribed to for preview, unsubscribe from its preview channel
    const unsubscribeFrom = subscribedChannels.filter((ch) => (!cached[ch.roomId] || ch.roomId === routeChatroomId.value));
    const shouldBeSubscribed: Set<string> = new Set();
    // Find out which channels should be subscribed to in this moment
    for (const [id, room] of Object.entries(cached)) {
      if (!room || id === routeChatroomId.value) continue;
      shouldBeSubscribed.add(id);
    }
    // Filter out the channels that are already subscribed
    for (const subscribed of subscribedChannels) {
      shouldBeSubscribed.delete(subscribed.roomId);
    }

    // Unsubscribe and remove
    unsubscribeFrom.forEach((ch) => {
      supabase.removeChannel(ch.channel);
      const index = subscribedChannels.findIndex((sch) => sch.roomId === ch.roomId);
      if (index < 0) return;
      subscribedChannels.splice(index, 1);
    });

    // Subscribe to new and add
    shouldBeSubscribed.forEach((id) => {
      const newChannel = supabase
        .channel(`preview:${id}`, {
          config: { private: true },
        })
        .on('broadcast', { event: 'insert-msg' }, (msg) => handleInsertMsgPayload(msg.payload as PayloadInsertMsg, id))
        .on('broadcast', { event: 'update-last' }, (msg) => handleUpdateLastPayload(msg.payload as PayloadUpdateLast, id))
        .on('broadcast', { event: 'delete-msg' }, (msg) => handleDeleteMsgPayload(msg.payload as PayloadDeleteMsg, id))
        .subscribe((status, error) => {
          if (error) {
            console.error(`Error during realtime preview channel subscription: ${error}`);
          } else {
            console.log(`Preview listener status: ${status}`);
          }
        });
      subscribedChannels.push({ channel: newChannel, roomId: id });
    });
  }, {
    immediate: true,
  });

  onMounted(async () => {
    await supabase.realtime.setAuth(); // Needed for Realtime Authorization
  });
  // Unsubscribe from all preview channels when leaving a page that uses the chat layout
  onUnmounted(() => {
    Object.values(subscribedChannels).forEach((ch) => {
      supabase.removeChannel(ch.channel);
    });
  });
}
