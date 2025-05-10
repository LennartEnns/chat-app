alter table chatrooms enable row level security;

create policy "Members can access their chatrooms"
on chatrooms for all
using (
  is_user_in_chatroom(auth.uid(), id)
);
