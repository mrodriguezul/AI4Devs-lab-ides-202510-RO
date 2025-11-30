import { toast, ToastOptions as ReactToastifyOptions, Id } from 'react-toastify';
import { ToastType, ToastOptions, NotificationManager } from '../types/notifications';

// Simple toast content without React components
const getIconText = (type: ToastType): string => {
  switch (type) {
    case 'success':
      return '✓';
    case 'error':
      return '✗';
    case 'warning':
      return '⚠';
    case 'info':
      return 'ℹ';
    case 'loading':
      return '⏳';
    default:
      return '';
  }
};

const formatMessage = (message: string, type: ToastType): string => {
  const icon = getIconText(type);
  return icon ? `${icon} ${message}` : message;
};

// Default options for different toast types
const defaultToastOptions: Record<ToastType, ReactToastifyOptions> = {
  success: {
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  },
  error: {
    autoClose: 8000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  },
  warning: {
    autoClose: 6000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  },
  info: {
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  },
  loading: {
    autoClose: false,
    hideProgressBar: true,
    closeOnClick: false,
    pauseOnHover: false,
    draggable: false,
  },
};

// Queue for managing multiple notifications
class NotificationQueue {
  private queue: Array<{ message: string; type: ToastType; options?: ToastOptions }> = [];
  private processing = false;
  private maxConcurrent = 3;

  add(message: string, type: ToastType, options?: ToastOptions) {
    // Check if we're at max capacity
    if (toast.isActive('loading') || this.getCurrentToastCount() >= this.maxConcurrent) {
      this.queue.push({ message, type, options });
      return;
    }

    this.showToast(message, type, options);
  }

  private getCurrentToastCount(): number {
    return document.querySelectorAll('.Toastify__toast').length;
  }

  private showToast(message: string, type: ToastType, options?: ToastOptions) {
    const baseOptions = defaultToastOptions[type];
    const customOptions = options || {};
    
    // Create a clean options object for react-toastify
    const toastOptions: ReactToastifyOptions = {
      autoClose: customOptions.autoClose ?? baseOptions.autoClose,
      hideProgressBar: customOptions.hideProgressBar ?? baseOptions.hideProgressBar,
      closeOnClick: customOptions.closeOnClick ?? baseOptions.closeOnClick,
      pauseOnHover: customOptions.pauseOnHover ?? baseOptions.pauseOnHover,
      draggable: customOptions.draggable ?? baseOptions.draggable,
    };

    const formattedMessage = formatMessage(message, type);

    switch (type) {
      case 'success':
        toast.success(formattedMessage, toastOptions);
        break;
      case 'error':
        toast.error(formattedMessage, toastOptions);
        break;
      case 'warning':
        toast.warning(formattedMessage, toastOptions);
        break;
      case 'info':
        toast.info(formattedMessage, toastOptions);
        break;
      case 'loading':
        toast.info(formattedMessage, { ...toastOptions, toastId: 'loading' });
        break;
    }

    // Process queue after showing toast
    setTimeout(() => this.processQueue(), 100);
  }

  private processQueue() {
    if (this.processing || this.queue.length === 0) return;
    if (this.getCurrentToastCount() >= this.maxConcurrent) return;

    this.processing = true;
    const next = this.queue.shift();
    if (next) {
      this.showToast(next.message, next.type, next.options);
    }
    this.processing = false;

    // Continue processing if there are more items
    if (this.queue.length > 0) {
      setTimeout(() => this.processQueue(), 200);
    }
  }

  clear() {
    this.queue = [];
  }
}

const notificationQueue = new NotificationQueue();

// Main notification manager
export const notifications: NotificationManager = {
  success: (message: string, options?: ToastOptions) => {
    notificationQueue.add(message, 'success', options);
  },

  error: (message: string, options?: ToastOptions) => {
    notificationQueue.add(message, 'error', options);
  },

  warning: (message: string, options?: ToastOptions) => {
    notificationQueue.add(message, 'warning', options);
  },

  info: (message: string, options?: ToastOptions) => {
    notificationQueue.add(message, 'info', options);
  },

  loading: (message: string, options?: ToastOptions) => {
    // Dismiss any existing loading toast first
    toast.dismiss('loading');
    notificationQueue.add(message, 'loading', options);
  },

  dismiss: (toastId?: string | number) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },

  clear: () => {
    toast.dismiss();
    notificationQueue.clear();
  },
};

// Utility functions for common notification patterns
export const notifySuccess = (message: string) => notifications.success(message);
export const notifyError = (message: string) => notifications.error(message);
export const notifyWarning = (message: string) => notifications.warning(message);
export const notifyInfo = (message: string) => notifications.info(message);

export const notifyLoading = (message: string) => notifications.loading(message);
export const dismissLoading = () => toast.dismiss('loading');

// Form-specific notifications
export const notifyFormSuccess = (action: string) => 
  notifications.success(`${action} completed successfully!`);

export const notifyFormError = (error: string) => 
  notifications.error(`Operation failed: ${error}`);

export const notifyValidationError = (message: string) => 
  notifications.warning(`Please check: ${message}`);

// Network-specific notifications
export const notifyNetworkError = () => 
  notifications.error('Network connection failed. Please check your internet connection.');

export const notifyOffline = () => 
  notifications.warning('You are offline. Some features may not be available.');

export const notifyOnline = () => 
  notifications.success('Connection restored!');

export const notifySlowConnection = () => 
  notifications.info('Slow connection detected. Operations may take longer.');

// File upload notifications
export const notifyUploadStart = (filename: string) => 
  notifications.loading(`Uploading ${filename}...`);

export const notifyUploadSuccess = (filename: string) => 
  notifications.success(`${filename} uploaded successfully!`);

export const notifyUploadError = (filename: string, error: string) => 
  notifications.error(`Failed to upload ${filename}: ${error}`);

export default notifications;