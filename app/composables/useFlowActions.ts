export const useFlowActions = () => {
  const supabase = useSupabaseClient();
  const operationFeedbackHandler = useOperationFeedbackHandler();

  return {
    requestPasswordReset: async (email: string) => {
      const res = await supabase.auth
        .resetPasswordForEmail(email, {
          redirectTo: toFullUrl('/flow/reset-password'),
        });
      if (res.error) {
        operationFeedbackHandler.displayError('Could not send a password reset link.');
      } else {
        operationFeedbackHandler.displaySuccess('We sent a password reset link to your email address.');
      }
      return res;
    }
  };
}
