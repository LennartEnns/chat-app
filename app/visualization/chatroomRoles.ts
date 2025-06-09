import type { Enums } from "~~/database.types";

const chatroomRoles: { [k in Enums<'chatroom_role'>]: {
  label: string,
  icon: string,
} } = {
  'admin': {
    label: 'Admin',
    icon: 'i-lucide-crown',
  },
  'mod': {
    label: 'Mod',
    icon: 'i-lucide-sword',
  },
  'member': {
    label: 'Member',
    icon: 'i-lucide-user-round',
  },
  'viewer': {
    label: 'Viewer',
    icon: 'i-lucide-eye',
  },
};
export default chatroomRoles;
