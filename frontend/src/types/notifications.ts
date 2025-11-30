export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface ToastOptions {
  type?: ToastType;
  autoClose?: number | false;
  hideProgressBar?: boolean;
  closeOnClick?: boolean;
  pauseOnHover?: boolean;
  draggable?: boolean;
  position?: 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center';
}

export interface NotificationManager {
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  warning: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
  loading: (message: string, options?: ToastOptions) => void;
  dismiss: (toastId?: string | number) => void;
  clear: () => void;
}

export interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  lastConnected: Date | null;
  connectionType?: 'wifi' | '4g' | '3g' | 'unknown';
}