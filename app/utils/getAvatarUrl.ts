import getAvatarPath from "./getAvatarPath";

export default (userId: string) => {
  const supabase = useSupabaseClient();

  const avatarPath = getAvatarPath(userId);
  const avatarUrlData = supabase.storage
    .from("avatars")
    .getPublicUrl(avatarPath);
  return avatarUrlData.data.publicUrl;
}
