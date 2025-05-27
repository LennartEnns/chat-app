alter table messages enable row level security;

create policy "Users can read any messages from chatrooms they belong to"
on messages for select to authenticated
using (
  is_user_in_chatroom((select auth.uid()), messages.chatroom_id)
);

create policy "Users can insert own messages into own chatrooms"
on messages for insert to authenticated
with check (
  is_user_in_chatroom((select auth.uid()), messages.chatroom_id)
  and (select auth.uid()) = user_id
);

create policy "Users can update their own messages"
on messages for update to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can delete their own messages"
on messages for delete to authenticated
using ((select auth.uid()) = user_id);
