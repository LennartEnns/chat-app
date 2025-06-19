export default (
  type: string,
  id: string,
  otherUserId: string | null
) => {
  return type === "direct"
    ? ref(otherUserId ? getAvatarUrl(otherUserId) : undefined)
    : useCachedSignedImageUrl(
        "chatroom_avatars",
        getGroupAvatarPath(id),
        true
      );
}