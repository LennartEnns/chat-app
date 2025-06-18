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
begin
  if new.pinned_message_id is distinct from old.pinned_message_id then
    select utils.get_role_in_chatroom((select auth.uid()), new.id) into role;
    if role ='admin' then
    return new;
    end if;
    if role = 'mod' then
      return new;
    end if;
    
  end if;
      raise exception 'Only mods and admins can pin messages';
end;
$$;

create trigger before_update_verify_role_on_message_pinning
before update on public.chatrooms
for each row
execute function verify_role_on_message_pinning();
