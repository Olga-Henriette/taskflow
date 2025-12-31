import toast from 'react-hot-toast';

/**
 * Hook personnalisé pour afficher des notifications
 */
const useToast = () => {
  return {
    success: (message) => toast.success(message),
    error: (message) => toast.error(message),
    loading: (message) => toast.loading(message),
    dismiss: (toastId) => toast.dismiss(toastId),
  };
};

export default useToast;