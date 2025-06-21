import type { Tables } from "~~/database.types";
import type { RequireNonNull } from "./tsUtils/helperTypes";

type ChatInvitationNullable = Pick<
  Tables<"group_invitations_preview">,
  "id" | "invitee_id" | "as_role" | "invitee_username"
>;
export type ChatInvitation = RequireNonNull<ChatInvitationNullable, keyof ChatInvitationNullable>;