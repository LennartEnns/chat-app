alter table user_to_group enable row level security;

create policy "Members can see other members' memberships"
on user_to_group for select to authenticated
using (
  utils.get_role_in_chatroom((select auth.uid()), chatroom_id) is not null
);

create policy "Users can add themselves as members based on an invitation"
on user_to_group for insert to authenticated
with check (
  user_to_group.user_id = (select auth.uid())
  and user_to_group.role is not null
  and utils.get_role_in_invitation(user_to_group.user_id, user_to_group.chatroom_id) = user_to_group.role
);

create policy "Members can update memberships"
on user_to_group for update to authenticated
using (
  utils.get_role_in_chatroom((select auth.uid()), chatroom_id) is not null
);

create or replace function enforce_user_to_group_update_policies()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare _current_role public.chatroom_role;
begin
  -- Only the role column shall be changed
  if (new.user_id != old.user_id) or (new.chatroom_id != old.chatroom_id) then
    raise exception 'Update operation not allowed';
  end if;
  if new.user_id = (select auth.uid()) then
    raise exception 'Cannot change your own role';
  end if;
  if old.role = 'admin' then
   raise exception 'Cannot change the role of an admin';
  end if;

  select utg.role into _current_role from public.user_to_group utg
    where utg.user_id = (select auth.uid()) and utg.chatroom_id = new.chatroom_id;
  if _current_role not in ('mod', 'admin') then
    raise exception 'Must be admin or mod to edit member roles';
  end if;
  if _current_role = 'mod' and (old.role not in ('viewer', 'member') or new.role not in ('viewer', 'member')) then
    raise exception 'Mods can only convert viewers to members and vice versa';
  end if;

  return new;
end;
$$;
revoke all on function enforce_user_to_group_update_policies() from authenticated, anon;

create trigger trigger_enforce_user_to_group_update_policies
before update on public.user_to_group
for each row
execute procedure enforce_user_to_group_update_policies();

create policy "Admins can remove non-admins from the chatroom"
on user_to_group for delete to authenticated
using (
  user_id != (select auth.uid())
  and utils.get_role_in_chatroom((select auth.uid()), chatroom_id) = 'admin'
  and role != 'admin'
);
