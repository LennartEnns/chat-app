import type { Message } from '~/types/messages/messageLoading';
import { logPostgrestError } from '~~/errors/postgrestErrors';

const scrollTopTreshold = 50; // px
const messagesChunkSize = 20; // Load max. 20 messages at once
const alwaysFutureDate = new Date(86400000000000);

export const useLazyFetchedMessages = (chatroomId: Ref<string>, messagesContainer: Ref<HTMLElement | null>) => {
  const supabase = useSupabaseClient();
  const operationFeedbackHandler = useOperationFeedbackHandler();
  const containerScrollTop = ref(0);
  const almostAtTheTop = computed(() => containerScrollTop.value <= scrollTopTreshold);

  const messages = ref<Message[]>([]);
  const earliestMessageTime = computed(() => messages.value.length === 0 ? alwaysFutureDate : new Date(messages.value[0]!.created_at));
  const { data: initialMessages } = useAsyncData(`chatMessages-${chatroomId.value}`, async () => {
    return await fetchEarlierMessages();
  });
  watch(initialMessages, (msgs) => {
    if (msgs) {
      messages.value = msgs.toReversed();
    }
  }, {
    immediate: true,
  })

  let reachedEarliestMessage = false;

  async function updateScrollTop() {
    if (messagesContainer.value) {
      containerScrollTop.value = messagesContainer.value.scrollTop;
    }
  }

  async function insertMessages(newMessages: Message[]) {
    if (newMessages.length === 0) return;
    const oldScrollHeight = messagesContainer.value?.scrollHeight ?? 0;
    // New messages are in descending order, so insert each one at the start of messages
    newMessages.forEach((newMsg) => messages.value.unshift(newMsg));
    // Adjust scrollTop to keep the view "pinned"
    await nextTick(() => {
      if (!messagesContainer.value) return;
      const container = messagesContainer.value;
      const newScrollHeight = container.scrollHeight;
      container.scrollTo({
        top: container.scrollTop + (newScrollHeight - oldScrollHeight),
        behavior: 'instant', // Override smooth scrolling
      });
    });
  }
  async function fetchEarlierMessages() {
    const { data, error } = await supabase.from('messages_view')
      .select('content, created_at, user_id, username')
      .eq('chatroom_id', chatroomId.value)
      .lt('created_at', earliestMessageTime.value.toISOString())
      .order('created_at', { ascending: false })
      .limit(messagesChunkSize);

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
      const newMsgs = await fetchEarlierMessages();
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
    const { error } = await supabase.from('messages').insert({
      chatroom_id: chatroomId.value,
      content,
    });

    if (error) {
      logPostgrestError(error, "message insert");
      operationFeedbackHandler.displayError('Could not send the message');
      return;
    }
    messages.value.push({
      content,
      created_at: new Date(),
      // null because it's the user's own message
      user_id: null,
      username: null,
    });
  }

  return {
    messages,
    sendMessage,
  }
}
