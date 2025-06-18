type CachedSignedUrl = {
  url: string,
  expiresAt: number,
}

const EXPIRES_IN = 60 * 60; // Number of seconds before a signed URL expires
const EXPIRATION_BUFFER = 60; // Safety margin in seconds due to potential race condition

export default async (bucket: string, path: string) => {
  const supabase = useSupabaseClient();
  const storageKey = `signed-url:${bucket}:${path}`;
  const now = Math.floor(Date.now() / 1000); // In seconds

  try {
    const raw = localStorage.getItem(storageKey)
    if (raw) {
      const cached: CachedSignedUrl = JSON.parse(raw);
      if (cached.expiresAt > now + EXPIRATION_BUFFER) {
        return cached.url;
      }
    }
  } catch {
    // Ignore malformed cache
  }

  // If no valid cached URL, create a new one
  const { data } = await supabase
    .storage
    .from(bucket)
    .createSignedUrl(path, EXPIRES_IN);

  if (data?.signedUrl) {
    localStorage.setItem(storageKey, JSON.stringify({
      url: data.signedUrl,
      expiresAt: now + EXPIRES_IN
    }));
  }

  return data?.signedUrl;
}
