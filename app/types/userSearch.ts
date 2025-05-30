import type { Tables } from "~~/database.types";
import type { CommandPaletteItem } from '@nuxt/ui';

export type UserSearchColumns = 'user_id' | 'username' | 'displayname';
export type UserSearchResult = Pick<Tables<'profiles'>, UserSearchColumns>;
export interface UserCommandPaletteItem extends CommandPaletteItem {
  user: UserSearchResult,
}
