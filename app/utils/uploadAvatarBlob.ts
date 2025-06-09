import { logStorageError, getStorageErrorMessage } from "~~/errors/storageErrors";

export default async (blob: Blob, bucket_name: string, path: string) => {
  const supabase = useSupabaseClient();
  const operationFeedbackHandler = useOperationFeedbackHandler();

  const { error } = await supabase.storage
    .from(bucket_name)
    .upload(path, blob, {
      upsert: true,
      contentType: "image/jpeg",
      cacheControl: "0",

      // Kind of unnecessary next to max-age=0, but better be on the safe side ;)
      headers: {
        "cache-control": "no-cache",
      },
    });
  if (error) {
    logStorageError(error, "avatar upload");
    operationFeedbackHandler.displayError(
      getStorageErrorMessage(error, "Unknown error uploading avatar")
    );
    return false;
  } else {
    operationFeedbackHandler.displaySuccess(
      "Avatar has been updated"
    );
    return true;
  }
}
