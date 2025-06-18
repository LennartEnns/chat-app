import type { CachedChatroomsMap } from '~/types/chatroom';
import type { Message } from '~/types/messages/messageLoading';
import { logPostgrestError } from '~~/errors/postgrestErrors';

const scrollTopTreshold = 50; // px
const messagesChunkSize = 20; // Load max. 20 messages at once
const alwaysFutureDate = new Date(86400000000000);

async function waitForScrollHeightChange(container: HTMLElement, oldHeight: number) {
  const maxTries = 40; // Generous timeout for even the 
  let tries = 0;
  while (tries < maxTries && container.scrollHeight === oldHeight) {
    await new Promise((resolve) => setTimeout(resolve, 16)); // wait ~1 frame
    tries++;
  }
}

export const useLazyFetchedMessages = (chatroomId: string, messagesContainer: Ref<HTMLElement | null>) => {
  const supabase = useSupabaseClient();
  const operationFeedbackHandler = useOperationFeedbackHandler();
  const cachedChatrooms = useState<CachedChatroomsMap | undefined>('chatrooms');
  const cachedChatroom = computed(() => cachedChatrooms.value ? cachedChatrooms.value[chatroomId] : undefined);

  const containerScrollTop = ref(0);
  const almostAtTheTop = computed(() => containerScrollTop.value <= scrollTopTreshold);

  // Causes the corresponding database field to be set to the current time
  // Should be called after potentially new messages have been fetched or after sending a message
  async function updateLastInsideChatroom() {
    await supabase.rpc('update_last_inside_chatroom', { cid: chatroomId });
  }

  const { data: messages } = useLazyAsyncData(`chatMessages-${chatroomId}`, async () => {
    const msgs = (await fetchEarlierMessages(false)).toReversed();
    updateLastInsideChatroom();

    return msgs;
  });

  function getEarliestMessageTime() {
    return (!messages.value || messages.value.length === 0) ? alwaysFutureDate : new Date(messages.value[0]!.created_at);
  }

  let reachedEarliestMessage = false;

  async function updateScrollTop() {
    if (messagesContainer.value) {
      containerScrollTop.value = messagesContainer.value.scrollTop;
    }
  }

  async function insertMessages(newMessages: Message[]) {
    if (!messages.value || newMessages.length === 0) return;
    const oldScrollHeight = messagesContainer.value?.scrollHeight ?? 0;
    // New messages are in descending order, so insert each one at the start of messages
    newMessages.forEach((newMsg) => messages.value!.unshift(newMsg));
    // Adjust scrollTop to keep the view "pinned"
    if (!messagesContainer.value) return;
    const container = messagesContainer.value;

    // Ensure to only scroll after the messages have been inserted!
    await waitForScrollHeightChange(container, oldScrollHeight);
    const newScrollHeight = container.scrollHeight;
    container.scrollTo({
      top: container.scrollTop + (newScrollHeight - oldScrollHeight),
      behavior: 'instant', // Override smooth scrolling
    });
  }
  async function fetchEarlierMessages(checkBeforeTime: boolean) {
    let query = supabase.from('messages_view')
      .select('is_own, id, content, created_at, user_id, username')
      .eq('chatroom_id', chatroomId)
      .order('created_at', { ascending: false })
      .limit(messagesChunkSize);
    if (checkBeforeTime) {
      query = query.lt('created_at', getEarliestMessageTime().toISOString());
    }
    const { data, error } = await query;

    if (error) {
      logPostgrestError(error, 'message fetching');
      operationFeedbackHandler.displayError('Could not load messages');
      return [];
    }
    if (data) {
      if (data.length === 0) {
        reachedEarliestMessage = true;
        return [];
      }
      const dataWithDates = data.map((msg) => ({
        ...msg,
        created_at: new Date(msg.created_at!),
      })) as Message[];

      return dataWithDates;
    }
    return [];
  }

  watch(almostAtTheTop, async (val) => {
    if (val && !reachedEarliestMessage) {
      const newMsgs = await fetchEarlierMessages(true);
      insertMessages(newMsgs);
    };
  });

  onMounted(() => {
    messagesContainer.value?.addEventListener('scroll', updateScrollTop);
  });
  onUnmounted(() => {
    messagesContainer.value?.removeEventListener('scroll', updateScrollTop);
  })

  async function sendMessage(content: string) {
    const newId = crypto.randomUUID();
    const { error } = await supabase.from('messages').insert({
      id: newId,
      chatroom_id: chatroomId,
      content,
    });

    if (error) {
      logPostgrestError(error, "message insert");
      operationFeedbackHandler.displayError('Could not send the message');
      return;
    }
    const newMessage = {
      id: newId,
      content,
      created_at: new Date(),
      // null because it's the user's own message
      user_id: null,
      username: null,
      is_own: true,
    };
    updateLastInsideChatroom();
    // Update chatroom state
    if (cachedChatroom.value) {
      // Insert was performed, so update last activity
      cachedChatroom.value.last_activity = new Date().toISOString();
      cachedChatroom.value.last_message = content;
    }
    messages.value?.push(newMessage);
  }
  async function deleteMessage(id: string, index: number) {
    // Request deletion
    const { error } = await supabase.from('messages')
      .delete()
      .eq('id', id);

    if (error) {
      logPostgrestError(error, "message deletion");
      operationFeedbackHandler.displayError('Could not delete message');
      return;
    }

    // Remove message from local list after successful deletion
    messages.value = messages.value?.toSpliced(index, 1);
    if (cachedChatroom.value && index === messages.value?.length) {
      // Last message deleted => Update chatroom state
      cachedChatroom.value.last_message = messages.value[messages.value.length - 1]?.content ?? null;
    }
  }
  async function updateMessage(id: string, index: number, newContent: string) {
    // Request update
    const { error } = await supabase.from('messages')
      .update({
        content: newContent,
      })
      .eq('id', id);
    
    if (error) {
      logPostgrestError(error, "message update");
      operationFeedbackHandler.displayError('Could not update message');
      return;
    }

    // Update displayed message after successful db update
    if (!messages.value || messages.value.length <= index) return;
    const oldMsg = messages.value[index]!;
    const newMsg = {
      ...oldMsg,
      content: newContent,
    };
    messages.value = messages.value.toSpliced(index, 1, newMsg); // Remove old + insert new
    if (cachedChatroom.value && index === messages.value.length - 1) {
      // Last message updated => Update chatroom state
      cachedChatroom.value.last_message = newContent;
    }
  }

  return {
    messages,
    sendMessage,
    deleteMessage,
    updateMessage,
  }
}
