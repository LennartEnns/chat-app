import { z } from 'zod';
import { groupChatroomLimits } from '~~/validation/commonLimits';
import type { UserSearchResult } from '~/types/userSearch';
import type { TablesInsert } from '~~/database.types';

export const createDirectChatroomSchema = z.object({
  otherUser: z.custom<UserSearchResult>((val) => !!val, 'You must specify a user'),
});

export const createGroupChatroomSchema = z.object({
  name: z.string().max(groupChatroomLimits.name, `Group name cannot be over ${groupChatroomLimits.name} characters long`).nonempty("Required"),
  description: z.string().max(groupChatroomLimits.description, `Description cannot be over ${groupChatroomLimits.description} characters long`).optional(),
  invitations: z.array(z.custom<Pick<TablesInsert<'group_invitations'>, 'invitee_id' | 'as_role'>>()),
});
