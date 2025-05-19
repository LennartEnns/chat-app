alter table user_to_chatroom enable row level security;

create policy "Users can access their own memberships"
on user_to_chatroom for all
using (
  (select auth.uid()) = user_id
);