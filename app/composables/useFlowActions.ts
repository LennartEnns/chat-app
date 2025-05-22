export const useFlowActions = () => {
  const supabase = useSupabaseClient();
  const userData = useUserData();
  const operationFeedbackHandler = useOperationFeedbackHandler();

  return {
    requestPasswordReset: async () => {
      const { error } = await supabase.auth
        .resetPasswordForEmail(userData.email, {
          redirectTo: toFullUrl('/flow/reset-password'),
        });
      if (error) {
        operationFeedbackHandler.displayError('Could not send a password reset link.');
      } else {
        operationFeedbackHandler.displaySuccess('We sent a password reset link to your email address.');
      }
    }
  };
}
