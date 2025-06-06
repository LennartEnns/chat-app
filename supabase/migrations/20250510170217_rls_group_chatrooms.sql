-- Group Chatrooms RLS
alter table group_chatrooms enable row level security;

create policy "Members can view their group chatrooms"
on group_chatrooms for select to authenticated
using (
  get_role_in_chatroom((select auth.uid()), chatroom_id) is not null
);

create policy "Users can create group chatrooms"
on group_chatrooms for insert to authenticated
with check (true);

create policy "Admins can change group chatroom properties"
on group_chatrooms for update to authenticated
using (
  get_role_in_chatroom((select auth.uid()), chatroom_id) = 'admin'
);

revoke update on public.group_chatrooms from authenticated;
grant update (name, description) on public.group_chatrooms to authenticated;

create policy "Admins can delete the group chatroom"
on group_chatrooms for delete to authenticated
using (
  get_role_in_chatroom((select auth.uid()), chatroom_id) = 'admin'
);

-- Deletes a group chatroom when it has no members anymore
create function public.auto_delete_empty_group_chatroom()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.user_to_group
    where chatroom_id = old.chatroom_id
  ) then
    delete from public.chatrooms
    where id = old.chatroom_id;
  end if;

  return null;
end;
$$;
revoke all on function public.auto_delete_empty_group_chatroom() from authenticated, anon;

create trigger auto_delete_empty_group_chatroom
  after delete on public.user_to_group
  for each row
  execute procedure public.auto_delete_empty_group_chatroom();
