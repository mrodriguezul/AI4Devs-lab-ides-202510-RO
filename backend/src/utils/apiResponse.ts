// API Response utilities for consistent response format
interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
}

export const successResponse = <T>(
  data: T, 
  message?: string, 
  meta?: ApiResponse['meta']
): ApiResponse<T> => {
  return {
    success: true,
    data,
    message,
    meta
  };
};

export const errorResponse = (
  error: string, 
  message?: string
): ApiResponse => {
  return {
    success: false,
    error,
    message
  };
};

export const validationErrorResponse = (
  errors: any[]
): ApiResponse => {
  return {
    success: false,
    error: 'Validation failed',
    message: 'Please check the provided data',
    data: errors
  };
};