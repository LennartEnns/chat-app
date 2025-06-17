alter table public.chatrooms
  add constraint chatrooms_pinned_message_fkey
  foreign key (id, pinned_message) references public.messages (chatroom_id, id) on delete set null;