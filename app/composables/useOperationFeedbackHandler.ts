export const useOperationFeedbackHandler = () => {
  const toast = useToast();
  function displayError(description: string) {
    toast.add({
      title: 'Error',
      description,
      color: 'error',
    })
  }
  function displaySuccess(description: string) {
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
