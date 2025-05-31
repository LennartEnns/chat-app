-- Deletes the invitation for the user to the chatroom, if any
create function public.handle_new_user_to_chatroom()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  delete from public.invitations
  where
    invitations.invitee_id = new.user_id
    and invitations.chatroom_id = new.chatroom_id;
  return new;
end;
$$;
revoke execute on function public.handle_new_user_to_chatroom() from authenticated, anon;

-- trigger the function for each user_to_chatroom association that is inserted
create trigger on_public_user_to_chatroom_created
  after insert on public.user_to_chatroom
  for each row execute procedure public.handle_new_user_to_chatroom();
