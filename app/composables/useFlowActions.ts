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
        return true;
      }
      return false;
    },
    requestUserDeletion: async () => {
      const errorMessage = 'Account deletion failed';
      try {
        const res = await supabase.functions.invoke('delete-me');
        if (res.error) {
          operationFeedbackHandler.displayError(errorMessage);
        } else {
          operationFeedbackHandler.displaySuccess(res.data.message ?? 'You have been deleted');
          return true;
        }
      } catch {
        operationFeedbackHandler.displayError(errorMessage);
      }
      return false;
    }
  };
}
