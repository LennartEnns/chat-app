create table if not exists group_invitations (
  id uuid primary key default gen_random_uuid(),
  invitee_id uuid not null references auth.users(id) on delete cascade,
  chatroom_id uuid not null references public.group_chatrooms(chatroom_id) on delete cascade,
  invitor_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  as_role chatroom_role not null,
  created_at timestamptz not null default now(),

  unique (invitee_id, chatroom_id)
);

alter table group_invitations enable row level security;

create policy "Mods/Admins can see group invitations to their chatroom"
on group_invitations for select to authenticated
using (
  get_role_in_chatroom((select auth.uid()), group_invitations.chatroom_id) in ('mod', 'admin')
);

create policy "Invitees can see their group invitations"
on group_invitations for select to authenticated
using (
  group_invitations.invitee_id = (select auth.uid())
);

create policy "Mods can invite users as member/viewer"
on group_invitations for insert to authenticated
with check (
  get_role_in_chatroom((select auth.uid()), group_invitations.chatroom_id) = 'mod'
  and group_invitations.as_role in ('member', 'viewer')
);

create policy "Admins can invite users as any role"
on group_invitations for insert to authenticated
with check (
  get_role_in_chatroom((select auth.uid()), group_invitations.chatroom_id) = 'admin'
);

-- Allow only inserts of invitee_id, chatroom_id and as_role
revoke insert
on table public.group_invitations
from authenticated;

grant insert (invitee_id, chatroom_id, as_role)
on table public.group_invitations
to authenticated;

-- Updating group_invitations is not allowed, so no permissive update policies

create policy "Admins/Mods can delete group invitations where they are the invitor"
on group_invitations for delete to authenticated
using (
  get_role_in_chatroom((select auth.uid()), group_invitations.chatroom_id) in ('admin', 'mod')
  and group_invitations.invitor_id = (select auth.uid())
);

create policy "Admins can delete group invitations where the invitor is a non-admin"
on group_invitations for delete to authenticated
using (
  get_role_in_chatroom((select auth.uid()), group_invitations.chatroom_id) = 'admin'
  and get_role_in_chatroom(group_invitations.invitor_id, group_invitations.chatroom_id) != 'admin'
);

create policy "Invitees can delete their group invitations manually to reject them"
on group_invitations for delete to authenticated
using (
  group_invitations.invitee_id = (select auth.uid())
);