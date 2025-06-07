-- Deletes the invitation for the user to the chatroom, if any
create function public.handle_new_user_to_group()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  delete from public.group_invitations gi
  where
    gi.invitee_id = new.user_id
    and gi.chatroom_id = new.chatroom_id;
  return new;
end;
$$;
revoke all on function public.handle_new_user_to_group() from authenticated, anon;

-- trigger the function for each user_to_group association that is inserted
create trigger on_public_user_to_group_created
  after insert on public.user_to_group
  for each row execute procedure public.handle_new_user_to_group();
