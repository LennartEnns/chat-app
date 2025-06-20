const rpcTimeout = 3000; // Debounce timeout in ms
let updateAllowed = true; // Whether the update is not currently timeouted
let updateOnNext = false; // Whether to perform the RPC after the current timeout

/**
 * Causes the corresponding database field to be set to the current time.
 * Should be called after potentially new messages have been fetched (through DB or realtime) or after sending a message.
 * 
 * Performs a debounced RPC of the exposed database function to avoid spamming.
 */
export const useUpdateLastInsideChatroom = () => {
  const supabase = useSupabaseClient();

  async function performRPC(chatroomId: string) {
    console.log("Updating last inside chatroom");
    await supabase.rpc('update_last_inside_chatroom', { cid: chatroomId });
  }

  async function updateLastInsideChatroom(chatroomId: string) {
    if (!updateAllowed) {
      updateOnNext = true;
      return;
    }
    updateAllowed = false;
    performRPC(chatroomId);
    setTimeout(() => {
      updateAllowed = true;
      if (updateOnNext) {
        updateOnNext = false;
        updateLastInsideChatroom(chatroomId);
      }
    }, rpcTimeout);
  }

  return updateLastInsideChatroom;
}
