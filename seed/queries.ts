export const updateStorageObjectOwnerQuery =
  'UPDATE storage.objects SET owner=$1::uuid, owner_id=$1::text WHERE id=$2'

export const createGroupQuery =
  'INSERT INTO public.group_chatrooms (chatroom_id, name, description) VALUES ($1, $2, $3)'

export const addUserToGroupQuery =
  'INSERT INTO public.user_to_group (user_id, chatroom_id, role) VALUES ($1, $2, $3)'