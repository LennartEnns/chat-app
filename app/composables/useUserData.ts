import type { Reactive } from "vue";

export interface UserData {
  id: string,
  email: string,
  username: string,
  displayname: string | null,
  description: string | null,
  avatarPath: string,
  avatarUrl: string,
};

export function useUserData(): Reactive<UserData> {
  const user = useSupabaseUser();

  const profileData = user.value?.user_metadata;
  const avatarPath = getAvatarPath(user.value?.id || '');
  const avatarUrl = getAvatarUrl(user.value?.id || '');

  const userData = reactive<UserData>({
    id: user.value?.id ?? '',
    email: user.value?.email ?? '',
    username: profileData?.username ?? '',
    displayname: profileData?.displayname ?? null,
    description: profileData?.description ?? null,
    avatarPath,
    avatarUrl,
  });

  watch(user, () => { // Update data along with the user ref
    const profileData = user.value?.user_metadata;
    userData.email = user.value?.email ?? '';
    userData.username = profileData?.username ?? '';
    userData.displayname = profileData?.displayname ?? null;
    userData.description = profileData?.description ?? null;
  });

  return userData;
}
