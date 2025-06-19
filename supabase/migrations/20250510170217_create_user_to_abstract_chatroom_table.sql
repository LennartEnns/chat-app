create table if not exists user_to_abstract_chatroom (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  chatroom_id uuid not null references public.chatrooms(id) on delete cascade,
  last_inside timestamptz not null default now(),

  primary key (user_id, chatroom_id)
);

alter table user_to_abstract_chatroom enable row level security;

create policy "Users can see their abstract chatroom associations"
on user_to_abstract_chatroom for select to authenticated
using (
  user_id = (select auth.uid())
);

-- Insert is done by "after insert on public.user_to_group" and "after insert on public.direct_chatrooms"
-- (Inside sync_chatroom_associations)

-- Update is currently only done by the public function below

-- Delete is done by "after delete on public.user_to_group" and "after update on public.direct_chatrooms"
-- (Inside sync_chatroom_associations)

create or replace function public.update_last_inside_chatroom(cid uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.user_to_abstract_chatroom utac
  set last_inside = now()
  where utac.user_id = (select auth.uid())
  and utac.chatroom_id = cid;
$$;

revoke all on function public.update_last_inside_chatroom(uuid) from authenticated, anon;
grant execute on function public.update_last_inside_chatroom(uuid) to authenticated;
