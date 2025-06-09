type CachedSignedUrl = {
  url: string,
  expiresAt: number,
}

const EXPIRES_IN = 60 * 60; // Number of seconds before a signed URL expires
const EXPIRATION_BUFFER = 60; // Safety margin in seconds due to potential race condition

export const useCachedSignedImageUrl = (bucket: string, path: string) => {
  const supabase = useSupabaseClient();
  const imageUrl = ref<string | undefined>(undefined);
  const storageKey = `signed-url:${bucket}:${path}`;

  async function loadSignedUrl() {
    const now = Math.floor(Date.now() / 1000); // In seconds

    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const cached: CachedSignedUrl = JSON.parse(raw);
        if (cached.expiresAt > now + EXPIRATION_BUFFER) {
          imageUrl.value = cached.url;
          return;
        }
      }
    } catch {
      // Ignore malformed cache
    }

    // If no valid cached URL, create a new one
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .createSignedUrl(path, EXPIRES_IN);

    if (data?.signedUrl) {
      imageUrl.value = data.signedUrl;
      localStorage.setItem(storageKey, JSON.stringify({
        url: data.signedUrl,
        expiresAt: now + EXPIRES_IN
      }));
    } else {
      console.error('Error generating signed URL: ', error);
    }
  }

  onMounted(loadSignedUrl);

  return imageUrl;
}
