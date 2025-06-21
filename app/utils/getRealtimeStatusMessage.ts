import type { REALTIME_SUBSCRIBE_STATES } from '@supabase/supabase-js';

const messages: Record<REALTIME_SUBSCRIBE_STATES, string> = {
  'SUBSCRIBED': 'Connected',
  'TIMED_OUT': 'Connection timed out',
  'CLOSED': 'Connection closed',
  'CHANNEL_ERROR': 'Connection error',
};

export default (status: REALTIME_SUBSCRIBE_STATES) => {
  return messages[status];
}
