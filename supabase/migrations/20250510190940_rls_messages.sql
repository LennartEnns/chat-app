alter table messages enable row level security;

create policy "Users can read any messages from chatrooms they belong to"
on messages for select to authenticated
using (
  get_role_in_chatroom((select auth.uid()), messages.chatroom_id) is not null
);

-- user_id and created_at will be set to default values on insert
create policy "Non-viewers can insert own messages into own chatrooms"
on messages for insert to authenticated
with check (
  get_role_in_chatroom((select auth.uid()), messages.chatroom_id) in ('member', 'mod', 'admin')
  and user_id is null
  and created_at is null
);

create policy "Non-viewers can update their own message content"
on messages for update to authenticated
using (
  (select auth.uid()) = messages.user_id
  and get_role_in_chatroom((select auth.uid()), messages.chatroom_id) in ('member', 'mod', 'admin')
);

-- Allow only updates of the content column of a message
revoke update
on table public.messages
from authenticated;

grant update (content)
on table public.messages
to authenticated;

create policy "Users can delete their own messages from their chatrooms"
on messages for delete to authenticated
using (
  (select auth.uid()) = user_id
  and get_role_in_chatroom((select auth.uid()), messages.chatroom_id) is not null
);
