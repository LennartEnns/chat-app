import type { Enums } from "~~/database.types";

type ColorType = "error" | "primary" | "secondary" | "success" | "info" | "warning" | "neutral" | undefined;
const chatroomRoles: { [k in Enums<'chatroom_role'>]: {
  label: string,
  icon: string,
  color: ColorType,
} } = {
  'admin': {
    label: 'Admin',
    icon: 'i-lucide-crown',
    color: 'error',
  },
  'mod': {
    label: 'Mod',
    icon: 'i-lucide-sword',
    color: 'success',
  },
  'member': {
    label: 'Member',
    icon: 'i-lucide-user-round',
    color: 'primary',
  },
  'viewer': {
    label: 'Viewer',
    icon: 'i-lucide-eye',
    color: 'warning',
  },
};
export default chatroomRoles;
