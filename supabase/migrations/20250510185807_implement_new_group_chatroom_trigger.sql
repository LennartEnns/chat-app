-- inserts user into public.user_to_group with admin role
create function public.handle_new_group_chatroom()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if auth.uid() is null then 
    return new;
  end if;
  insert into public.user_to_group (user_id, chatroom_id, role)
  values (
    (select auth.uid()),
    new.id,
    'admin'
  );
  return new;
end;
$$;
revoke all on function public.handle_new_group_chatroom() from authenticated, anon;

-- trigger the function for each group chatroom that is inserted
create trigger after_insert_group_chatroom
  after insert on public.group_chatrooms
  for each row execute procedure public.handle_new_group_chatroom();
