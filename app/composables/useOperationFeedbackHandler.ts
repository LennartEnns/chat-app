export const useOperationFeedbackHandler = () => {
  const toast = useToast();
  async function displayError(description: string) {
    toast.add({
      title: 'Error',
      description,
      color: 'error',
    })
  }
  async function displaySuccess(description: string) {
    toast.add({
      title: 'Success',
      description,
      color: 'success',
    })
  }

  return {
    displayError,
    displaySuccess,
  };
}
