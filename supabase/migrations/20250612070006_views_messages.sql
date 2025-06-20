-- create or replace view public.messages_view
-- with (security_invoker)
-- as
-- select
--   (msg.user_id = (select auth.uid())) as is_own,

--   -- User only needs to know message ID for own messages (to update/delete)
--   case when msg.user_id = (select auth.uid())
--     then msg.id
--     else null
--   end as id,
--   msg.chatroom_id,
--   msg.content,
--   msg.created_at,
--   msg.message_type,

--   -- Those are only needed to display message authors in group chatroom
--   case when msg.user_id = (select auth.uid()) or cr.type = 'direct'
--     then null
--     else msg.user_id
--   end as user_id,
--   case when msg.user_id = (select auth.uid()) or cr.type = 'direct'
--     then null
--     else p.username
--   end as username,

--   case when exists (select 1 from public.messages_to_media mtm where mtm.message_id = msg.id)
--     then (
--       select json_agg(
--         json_build_object(
--           'id', mtm.media_id,
--           'type', mtm.type,
--           'file_path', case 
--             when mtm.type = 'image' then msg.user_id || '/image/' || mtm.media_id || '.jpg'
--             when mtm.type = 'audio' then msg.user_id || '/audio/' || mtm.media_id || '.mp3'
--             else null
--           end
--         )
--       )
--       from public.messages_to_media mtm 
--       where mtm.message_id = msg.id
--     )
--     else null
--   end as media

-- from public.messages msg
-- join public.profiles p on p.user_id = msg.user_id
-- join public.chatrooms cr on cr.id = msg.chatroom_id;


create or replace view public.messages_view
with (security_invoker)
as
select
  (msg.user_id = (select auth.uid())) as is_own,

  -- ALWAYS return the actual message ID. Permissions are handled by RLS.
  msg.id as id,
  msg.chatroom_id,
  msg.content,
  msg.created_at,
  msg.message_type,

  -- These are only needed to display message authors in group chatroom
  -- (Keep original logic for user_id and username for direct messages / own messages)
  case when msg.user_id = (select auth.uid()) or cr.type = 'direct'
    then null
    else msg.user_id
  end as user_id,
  case when msg.user_id = (select auth.uid()) or cr.type = 'direct'
    then null
    else p.username
  end as username,

  -- Use COALESCE to ensure 'media' is an empty JSONB array '[]' if no media entries are found, instead of NULL.
  COALESCE(
    (
      select jsonb_agg( -- Using jsonb_agg for consistency and better handling of JSON data
        jsonb_build_object(
          'id', mtm.media_id,
          'type', mtm.type,
          'file_path', case 
            when mtm.type = 'image' then msg.user_id || '/image/' || mtm.media_id || '.jpg'
            when mtm.type = 'audio' then msg.user_id || '/audio/' || mtm.media_id || '.mp3'
            else null
          end
        )
      )
      from public.messages_to_media mtm 
      where mtm.message_id = msg.id
    ),
    '[]'::jsonb -- If the subquery returns NULL (no media), return an empty JSONB array
  ) as media

from public.messages msg
join public.profiles p on p.user_id = msg.user_id
join public.chatrooms cr on cr.id = msg.chatroom_id;
