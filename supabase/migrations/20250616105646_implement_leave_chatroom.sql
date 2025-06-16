create or replace function public.leave_chatroom(cid uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  _cr_type public.chatroom_type;
  _user1_id uuid;
  _members_count integer;
  _admins_count integer;
begin
  select type from public.chatrooms c where c.id = cid into _cr_type;
  if _cr_type is null then
    raise exception 'Chatroom not found';
  end if;
  if _cr_type = 'group' then
    -- Do not allow leaving if the user is the only admin and not the last member
    select count(1) from public.user_to_group utg where utg.chatroom_id = cid
    into _members_count;
    if _members_count > 1 then
      -- Check if user is the only admin
      select count(1) from public.user_to_group utg where utg.chatroom_id = cid and utg.role = 'admin'
      into _admins_count;
      if _admins_count <= 1 then
        raise exception 'Last admin cannot leave before appointing a new admin';
      end if;
    end if;

    delete from public.user_to_group utg
    where utg.chatroom_id = cid
    and utg.user_id = (select auth.uid());
  else
    select user1_id from public.direct_chatrooms dc into _user1_id
    where dc.chatroom_id = cid;
    if _user1_id = (select auth.uid()) then
      update public.direct_chatrooms dc
      set user1_id = null where dc.chatroom_id = cid;
    else
      update public.direct_chatrooms dc
      set user2_id = null where dc.chatroom_id = cid;
    end if;
  end if;
end;
$$;
