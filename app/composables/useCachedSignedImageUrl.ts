export const useCachedSignedImageUrl = (bucket: string, path: string, loadImmediately = false) => {
  const imageUrl = ref<string | undefined>(undefined);

  async function loadSignedUrl() {
    imageUrl.value = await getCachedSignedImageUrl(bucket, path);
  }

  if (loadImmediately) {
    loadSignedUrl();
  } else {
    onMounted(loadSignedUrl);
  }

  return imageUrl;
}
