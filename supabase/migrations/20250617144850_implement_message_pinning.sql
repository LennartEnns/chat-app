alter table public.chatrooms
  add constraint chatrooms_pinned_message_fkey
  foreign key (pinned_message) references public.messages (id) on delete set null;