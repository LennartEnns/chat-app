import type { Tables } from '~~/database.types';
import type { PartialBy, RequireNonNull } from '~/types/tsUtils/helperTypes';

// Invitee ID + name should not be provided if it is the current user
// Invitor ID + name should not be provided if it is the current user
// Group ID + name should not be provided if we are on a specific group's info page
type InvNotNull = RequireNonNull<
  Tables<'group_invitations_preview'>,
  keyof Tables<'group_invitations_preview'>
>;
export type InvitationPreview = PartialBy<InvNotNull, 'invitee_username'> | 
                  PartialBy<InvNotNull, 'invitor_username'> |
                  PartialBy<InvNotNull, 'chatroom_id' | 'group_name'>;
