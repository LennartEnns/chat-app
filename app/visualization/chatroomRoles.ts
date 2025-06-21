import type { Enums } from "~~/database.types";

type ColorType = "error" | "primary" | "secondary" | "success" | "info" | "warning" | "neutral" | undefined;
const chatroomRoles: { [k in Enums<'chatroom_role'>]: {
  precedence: number,
  label: string,
  icon: string,
  color: ColorType,
} } = {
  'admin': {
    precedence: 4,
    label: 'Admin',
    icon: 'i-lucide-crown',
    color: 'error',
  },
  'mod': {
    precedence: 3,
    label: 'Mod',
    icon: 'i-lucide-sword',
    color: 'success',
  },
  'member': {
    precedence: 2,
    label: 'Member',
    icon: 'i-lucide-user-round',
    color: 'primary',
  },
  'viewer': {
    precedence: 1,
    label: 'Viewer',
    icon: 'i-lucide-eye',
    color: 'warning',
  },
};
export default chatroomRoles;
