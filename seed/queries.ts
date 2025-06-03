export const updateStorageObjectOwnerQuery =
  'UPDATE storage.objects SET owner=$1::uuid, owner_id=$1::text WHERE id=$2'

export const createChatroomQuery =
  'INSERT INTO public.chatrooms (id, name, description) VALUES ($1, $2, $3)'

export const addUserToChatroomQuery =
  'INSERT INTO public.user_to_chatroom (user_id, chatroom_id, role) VALUES ($1, $2, $3)'