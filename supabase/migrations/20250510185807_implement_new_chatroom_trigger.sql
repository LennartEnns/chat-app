-- inserts user into public.user_to_chatroom with admin role
create function public.handle_new_chatroom()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.user_to_chatroom (user_id, chatroom_id, role)
  values (
    (select auth.uid()),
    new.id,
    'admin'
  );
  return new;
end;
$$;
revoke all on function public.handle_new_chatroom() from authenticated, anon;

-- trigger the function for each chatroom that is inserted
create trigger on_public_chatroom_created
  after insert on public.chatrooms
  for each row execute procedure public.handle_new_chatroom();
