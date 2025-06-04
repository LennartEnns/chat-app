-- Deletes a chatroom when it has no members
create function public.auto_delete_empty_chatroom()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.user_to_chatroom
    where chatroom_id = old.chatroom_id
  ) then
    delete from public.chatrooms
    where id = old.chatroom_id;
  end if;

  return null;
end;
$$;
revoke all on function public.auto_delete_empty_chatroom() from authenticated, anon;

create trigger auto_delete_empty_chatroom
  after delete on public.user_to_chatroom
  for each row
  execute procedure public.auto_delete_empty_chatroom();
