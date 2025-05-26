export const useUseUserData = () => {
  return ref()
}
import type { Reactive } from "vue";

export interface UserData {
  id: string,
  email: string,
  username: ComputedRef<string>,
  displayname: string | null,
  description: string | null,
  avatarPath: string,
  avatarUrl: string,
  existsAvatarAtUrl: boolean,
};

export function useUserData(): Reactive<UserData> {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  const avatarPath = `public/${user.value?.id}.jpg`;
  const profileData = user.value?.user_metadata;
  const avatarUrlData = supabase.storage
    .from("avatars")
    .getPublicUrl(avatarPath);
  const avatarUrl = avatarUrlData.data.publicUrl;

  const userData = reactive<UserData>({
    id: user.value?.id ?? '',
    email: user.value?.email ?? '',
    username: profileData?.username ?? '',
    displayname: profileData?.displayname ?? null,
    description: profileData?.description ?? null,
    avatarPath,
    avatarUrl,

    existsAvatarAtUrl: false,
  });

  onNuxtReady(async () => {
    const {data} = await supabase.storage.from('avatars').exists(avatarPath);
    userData.existsAvatarAtUrl = data;
  })

  watch(user, () => { // Update data along with the user ref
    const profileData = user.value?.user_metadata;
    userData.email = user.value?.email ?? '';
    userData.username = profileData?.username ?? '';
    userData.displayname = profileData?.displayname ?? null;
    userData.description = profileData?.description ?? null;
  });

  return userData;
}
