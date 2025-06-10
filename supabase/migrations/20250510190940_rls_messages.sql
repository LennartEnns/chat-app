alter table messages enable row level security;

create policy "Users can read any messages from chatrooms they belong to"
on messages for select to authenticated
using (
  utils.get_role_in_chatroom((select auth.uid()), chatroom_id) is not null
);

-- user_id and created_at will be set to default values on insert
create policy "Non-viewers can insert own messages into own chatrooms"
on messages for insert to authenticated
with check (
  utils.get_role_in_chatroom((select auth.uid()), chatroom_id) in ('member', 'mod', 'admin')
);

-- Allow only inserts of content and chatroom_id
revoke insert
on table public.messages
from authenticated;

grant insert (content, chatroom_id)
on table public.messages
to authenticated;

create policy "Non-viewers can update their own message content"
on messages for update to authenticated
using (
  (select auth.uid()) = user_id
  and utils.get_role_in_chatroom((select auth.uid()), chatroom_id) in ('member', 'mod', 'admin')
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
  and utils.get_role_in_chatroom((select auth.uid()), chatroom_id) is not null
);
