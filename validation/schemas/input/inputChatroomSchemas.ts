import { z } from 'zod';
import { groupChatroomLimits } from '~~/validation/commonLimits';
import type { TablesInsert } from '~~/database.types';
import type { UserSearchResult } from '~/types/userSearch';
import type { SelectedGroup } from '~/types/invitations/groupInvitationCreation';

type GroupInvitation = Pick<TablesInsert<'group_invitations'>, 'invitee_id' | 'as_role'> & {
  isInvalid: boolean,
}

export const createDirectChatroomSchema = z.object({
  otherUser: z.custom<UserSearchResult>((val) => !!val, 'You must specify a user'),
});

export const createGroupChatroomSchema = z.object({
  name: z.string().max(groupChatroomLimits.name, `Group name cannot be over ${groupChatroomLimits.name} characters long`).nonempty("Required"),
  description: z.string().max(groupChatroomLimits.description, `Description cannot be over ${groupChatroomLimits.description} characters long`).optional(),
  invitations: z.array(z.custom<Pick<TablesInsert<'group_invitations'>, 'invitee_id' | 'as_role'>>()),
});

export const inviteUsersToGroupSchema = z.object({
  group: z.custom<SelectedGroup>((val) => !!val, 'You must specify a group'),
  invitations: z.array(z.custom<GroupInvitation>())
    .refine((arr) => arr.length > 0, 'Create at least 1 invitation')
    .refine((arr) => !arr.find((inv) => inv.isInvalid), 'You have invalid invitations'),
});
