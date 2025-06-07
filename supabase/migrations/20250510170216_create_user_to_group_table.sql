create table if not exists user_to_group (
  user_id uuid references auth.users(id) on delete cascade,
  chatroom_id uuid references public.group_chatrooms(chatroom_id) on delete cascade,
  role chatroom_role not null,
  primary key (user_id, chatroom_id)
);