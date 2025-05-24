import { WelcomeModal } from '#components'

/**
 * Detects whether the user is logged in for the first time.
 * If yes, triggers a welcome dialog and sets first_login to false.
 */
export const useFirstLoginDetector = () => {
  const user = useSupabaseUser();
  if (!user.value?.user_metadata.first_login) return;

  const overlay = useOverlay();
  const modal = overlay.create(WelcomeModal);
  const instance = modal.open();
  instance.result.then((res) => {
    if (res) {
      navigateTo('/profile');
    }
  })

  const supabase = useSupabaseClient();
  supabase.auth.updateUser({
    data: {
      first_login: false,
    }
  }).catch(() => {});
}