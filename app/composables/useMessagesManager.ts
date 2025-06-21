import type { Message } from '~/types/messages/messageLoading';
import { logPostgrestError } from '~~/errors/postgrestErrors';

const scrollTopTreshold = 50; // px
const messagesChunkSize = 20; // Load max. 20 messages at once
const alwaysFutureDate = new Date(86400000000000);

async function waitForScrollHeightChange(container: HTMLElement, oldHeight: number) {
  const maxTries = 40; // Generous timeout for even the slowest users
  let tries = 0;
  while (tries < maxTries && container.scrollHeight === oldHeight) {
    await new Promise((resolve) => setTimeout(resolve, 16)); // wait ~1 frame
    tries++;
  }
}

export const useMessagesManager = (chatroomId: string, messagesContainer: Ref<HTMLElement | null>, immediateOwnMessageManipulation: Ref<boolean>) => {
  const supabase = useSupabaseClient();
  const updateLastInsideChatroom = useUpdateLastInsideChatroom();
  const operationFeedbackHandler = useOperationFeedbackHandler();

  const containerScrollTop = ref(0);
  const almostAtTheTop = computed(() => containerScrollTop.value <= scrollTopTreshold);

  const { data: messages } = useLazyAsyncData(`chatMessages-${chatroomId}`, async () => {
    const msgs = (await fetchEarlierMessages(false)).toReversed();
    updateLastInsideChatroom(chatroomId);

    return msgs;
  });
  const messagesManipulator = useLocalMessagesManipulator(chatroomId, messages);

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

    messagesManipulator.insertOlderMessagesDescending(newMessages);

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

  watch(messagesContainer, (container) => {
    if (container) {
      container.addEventListener('scroll', updateScrollTop);
    }
  }, {
    immediate: true,
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

    // Only insert new message directly if realtime connection is not up
    // Otherwise, the realtime handler will insert the message upon arrival
    // and update last inside chatroom
    if (!immediateOwnMessageManipulation.value) return;

    updateLastInsideChatroom(chatroomId);
    const newMessage = {
      id: newId,
      content,
      created_at: new Date(),
      // null because it's the user's own message
      user_id: null,
      username: null,
      is_own: true,
    };
    messagesManipulator.appendMessage(newMessage);
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

    if (!immediateOwnMessageManipulation.value) return;
    // Remove message from local list after successful deletion
    messagesManipulator.deleteMessage(index);
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

    if (!immediateOwnMessageManipulation.value) return;
    // Update displayed message after successful db update
    messagesManipulator.updateMessageContent(index, newContent);
  }

  return {
    messages,
    sendMessage,
    deleteMessage,
    updateMessage,
  }
}
