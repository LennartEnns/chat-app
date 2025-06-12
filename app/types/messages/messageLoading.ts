import type { Tables } from "~~/database.types";
import type { RequireNonNull } from "../tsUtils/helperTypes";

type MessageNeeded = Omit<Tables<'messages_view'>, 'id' | 'chatroom_id' | 'created_at'>
export type Message = RequireNonNull<MessageNeeded, 'content'> & { created_at: Date }
