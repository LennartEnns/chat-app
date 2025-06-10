import type { Tables, Enums } from "~~/database.types";
import type { UserSearchResult } from "./userSearch";
import type { RequireNonNull } from "./tsUtils/helperTypes";

export type SelectedGroup = RequireNonNull<Pick<Tables<'group_chatrooms_extended'>, 'chatroom_id' | 'name' | 'current_user_role'>, 'chatroom_id'>
export type UserInvitation = UserSearchResult & {
  asRole: Enums<'chatroom_role'>,
  alreadyInGroup: boolean,
  alreadyInvited: boolean,
};
