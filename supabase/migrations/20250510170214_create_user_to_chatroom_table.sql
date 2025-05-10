create table if not exists user_to_chatroom (
  user_id uuid references auth.users(id) on delete cascade,
  chatroom_id uuid references public.chatrooms(id) on delete cascade,
  primary key (user_id, chatroom_id)
);