-- 'single:[user_id]' for events concerning a single user
-- => 'invite' event: id, invitor_id, chatroom_id, invitor_username, group_name, as_role => Client can display invitation dialog
-- => 'new-direct' event: id, other_user_id, other_user_name => Client adds direct chatroom to list and subscribes to its preview events
-- => 'remove-chat' event: id => Checked after delete on direct_chatrooms and after delete on user_to_group

-- Will not be implemented for now
