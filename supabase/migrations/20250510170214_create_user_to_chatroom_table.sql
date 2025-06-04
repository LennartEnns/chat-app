create type chatroom_role as enum (
  'admin',
  'mod',
  'member',
  'viewer'
);

create table if not exists user_to_chatroom (
  user_id uuid references auth.users(id) on delete cascade,
  chatroom_id uuid references public.chatrooms(id) on delete cascade,
  role chatroom_role not null,
  primary key (user_id, chatroom_id)
);