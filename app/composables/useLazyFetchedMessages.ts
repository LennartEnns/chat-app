import type { Message } from '~/types/messages/messageLoading';
import { logPostgrestError } from '~~/errors/postgrestErrors';

const scrollTopTreshold = 1000; // px
const messagesChunkSize = 20; // Load max. 20 messages at once
const alwaysFutureDate = new Date(86400000000000);

export const useLazyFetchedMessages = (chatroomId: Ref<string>, containerScrollTop: Ref<number>) => {
  const supabase = useSupabaseClient();
  const operationFeedbackHandler = useOperationFeedbackHandler();
  const almostAtTheTop = computed(() => containerScrollTop.value < scrollTopTreshold);
  const messages = ref<Message[]>([]);
  const earliestMessageTime = computed(() => messages.value.length === 0 ? alwaysFutureDate : new Date(messages.value[0]!.created_at));

  let reachedEarliestMessage = false;

  async function fetchEarlierMessages() {
    const { data, error } = await supabase.from('messages_view')
      .select('content, created_at, user_id, username')
      .eq('chatroom_id', chatroomId.value)
      .lt('created_at', earliestMessageTime.value.toISOString())
      .order('created_at', { ascending: true })
      .limit(messagesChunkSize);

    if (error) {
      logPostgrestError(error, 'message fetching');
      operationFeedbackHandler.displayError('Could not load messages');
      return;
    }
    if (data) {
      if (data.length === 0) {
        reachedEarliestMessage = true;
        return;
      }
      const dataWithDates = data.map((msg) => ({
        ...msg,
        created_at: new Date(msg.created_at!),
      })) as Message[];
      messages.value = dataWithDates.concat(messages.value);
    }
  }

  watch(almostAtTheTop, (val) => {
    if (val && !reachedEarliestMessage) fetchEarlierMessages();
  }, {
    immediate: true,
  });

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
