alter table public.chatrooms
  add constraint chatrooms_pinned_message_id_fkey
  foreign key (id, pinned_message_id) references public.messages (chatroom_id, id) on delete set null;


create or replace function verify_role_on_message_pinning()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare 
  role text;
  old_with_pinned_msg public.chatrooms;

begin
old_with_pinned_msg := old;
      old_with_pinned_msg.pinned_message_id := new.pinned_message_id;
      -- for eunsuring only the pinned_message_id is updated

 if old_with_pinned_msg is distinct from new then
    raise exception 'only the pinned_message_id can be updated';
  end if;
  if new.pinned_message_id is distinct from old.pinned_message_id then
    select utils.get_role_in_chatroom((select auth.uid()), new.id) into role;
    if role is null then
        raise exception 'You are not a member of this chatroom';
    end if;
    if role not in ('mod','admin') then
      raise exception 'Only mods and admins can pin messages';
    end if;
  end if;
  return new;
end;
$$;

create trigger before_update_verify_role_on_message_pinning
before update on public.chatrooms
for each row
execute function verify_role_on_message_pinning();
