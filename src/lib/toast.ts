import toast from 'react-hot-toast';

export interface ToastOptions {
    duration?: number;
    position?: 'top-center' | 'top-right' | 'bottom-center' | 'bottom-right';
}

export const showSuccess = (message: string, options?: ToastOptions) => {
    toast.success(message, {
        duration: options?.duration || 3000,
        position: options?.position || 'top-right',
        style: {
            background: '#10B981',
            color: '#fff',
        },
    });
};

export const showError = (message: string, options?: ToastOptions) => {
    toast.error(message, {
        duration: options?.duration || 4000,
        position: options?.position || 'top-right',
        style: {
            background: '#EF4444',
            color: '#fff',
        },
    });
};

export const showInfo = (message: string, options?: ToastOptions) => {
    toast(message, {
        duration: options?.duration || 3000,
        position: options?.position || 'top-right',
        icon: 'ℹ️',
    });
};

export const showLoading = (message: string) => {
    return toast.loading(message, {
        position: 'top-right',
    });
};

export const dismissToast = (toastId: string) => {
    toast.dismiss(toastId);
};
