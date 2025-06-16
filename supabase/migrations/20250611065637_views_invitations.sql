create or replace view public.group_invitations_preview
with (security_invoker)
as
select
  inv.*,
  (
    select p.username
    from public.profiles p
    where p.user_id = inv.invitee_id
  ) as invitee_username,
  (
    select p.username
    from public.profiles p
    where p.user_id = inv.invitor_id
  ) as invitor_username,
  (
    select gc.name
    from public.group_chatrooms gc
    where gc.chatroom_id = inv.chatroom_id
  ) as group_name
from public.group_invitations inv;
