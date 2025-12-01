import axios, { AxiosResponse, AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { 
  API_ENDPOINTS, 
  APP_CONFIG,
  Candidate, 
  CreateCandidateRequest, 
  ApiResponse, 
  PaginatedResponse
} from '../types/api';

// Error handling types and configuration
interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
  errors?: Array<{ path: string; msg: string }>;
}

interface RetryConfig {
  retries: number;
  retryDelay: number;
  retryCondition: (error: AxiosError) => boolean;
}

const RETRY_CONFIG: RetryConfig = {
  retries: 3,
  retryDelay: 1000, // 1 second
  retryCondition: (error: AxiosError) => {
    // Retry on network errors or 5xx status codes
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
  }
};

// Error categorization
const categorizeError = (error: AxiosError): { type: string; message: string; isRetryable: boolean } => {
  if (!error.response) {
    return {
      type: 'NETWORK_ERROR',
      message: 'Unable to connect to the server. Please check your internet connection.',
      isRetryable: true
    };
  }

  const status = error.response.status;
  const errorData = error.response.data as ApiErrorResponse;

  switch (status) {
    case 400:
      return {
        type: 'VALIDATION_ERROR',
        message: errorData.message || 'Please check your input and try again.',
        isRetryable: false
      };
    case 401:
      return {
        type: 'AUTHENTICATION_ERROR',
        message: 'Authentication required. Please log in.',
        isRetryable: false
      };
    case 403:
      return {
        type: 'PERMISSION_ERROR',
        message: 'You do not have permission to perform this action.',
        isRetryable: false
      };
    case 404:
      return {
        type: 'NOT_FOUND_ERROR',
        message: 'The requested resource was not found.',
        isRetryable: false
      };
    case 429:
      return {
        type: 'RATE_LIMIT_ERROR',
        message: 'Too many requests. Please wait a moment and try again.',
        isRetryable: true
      };
    case 500:
    case 502:
    case 503:
    case 504:
      return {
        type: 'SERVER_ERROR',
        message: 'Server error occurred. We\'re working to fix this issue.',
        isRetryable: true
      };
    default:
      return {
        type: 'UNKNOWN_ERROR',
        message: errorData.message || 'An unexpected error occurred.',
        isRetryable: false
      };
  }
};

// Retry logic implementation
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const axiosRetry = async <T>(operation: () => Promise<T>, config: RetryConfig): Promise<T> => {
  let lastError: AxiosError;
  
  for (let attempt = 0; attempt <= config.retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as AxiosError;
      
      if (attempt === config.retries || !config.retryCondition(lastError)) {
        throw lastError;
      }
      
      const delay = config.retryDelay * Math.pow(2, attempt); // Exponential backoff
      console.warn(`API request failed, retrying in ${delay}ms... (attempt ${attempt + 1}/${config.retries})`);
      await sleep(delay);
    }
  }
  
  throw lastError!;
};

// Configure axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3010',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    if (APP_CONFIG.enableDebug) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for enhanced error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    if (APP_CONFIG.enableDebug) {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error: AxiosError) => {
    const errorInfo = categorizeError(error);
    
    console.error('❌ API Error:', {
      type: errorInfo.type,
      message: errorInfo.message,
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      isRetryable: errorInfo.isRetryable
    });
    
    // Show user-friendly error notification
    if (APP_CONFIG.enableToastNotifications) {
      // Don't show toast for validation errors as they should be handled in forms
      if (errorInfo.type !== 'VALIDATION_ERROR') {
        toast.error(errorInfo.message, {
          toastId: `${errorInfo.type}_${error.config?.url}`, // Prevent duplicate toasts
          autoClose: errorInfo.type === 'NETWORK_ERROR' ? 5000 : 3000
        });
      }
    }
    
    // Add error metadata to the error object
    (error as any).errorInfo = errorInfo;
    
    return Promise.reject(error);
  }
);

// API Service Functions
export const candidateService = {
  // Get all candidates with optional pagination and search
  async getCandidates(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<Candidate>> {
    return axiosRetry(async () => {
      const response = await api.get<PaginatedResponse<Candidate>>(
        API_ENDPOINTS.candidates,
        { params }
      );
      return response.data;
    }, RETRY_CONFIG);
  },

  // Get candidate by ID
  async getCandidateById(id: number): Promise<ApiResponse<Candidate>> {
    return axiosRetry(async () => {
      const response = await api.get<ApiResponse<Candidate>>(
        API_ENDPOINTS.candidateById(id)
      );
      return response.data;
    }, RETRY_CONFIG);
  },

  // Create new candidate
  async createCandidate(formData: FormData): Promise<ApiResponse<Candidate>> {
    try {
      // Don't retry file uploads automatically as they may be large
      const response = await api.post<ApiResponse<Candidate>>(
        API_ENDPOINTS.candidates,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // 60 seconds for file uploads
          transformRequest: [(data) => data], // Pass FormData as-is
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              console.log(`Upload progress: ${percentCompleted}%`);
            }
          }
        }
      );
      
      // Show success notification
      if (APP_CONFIG.enableToastNotifications) {
        toast.success('Candidate created successfully!', {
          autoClose: 3000
        });
      }
      
      return response.data;
    } catch (error: any) {
      // Handle specific error cases
      if (error.message?.includes('MetaMask') || error.message?.includes('ethereum')) {
        const browserError = new Error('Browser extension interference detected. Please try disabling wallet extensions or use incognito mode.');
        (browserError as any).errorInfo = {
          type: 'BROWSER_EXTENSION_ERROR',
          message: 'Browser extension interference',
          isRetryable: false
        };
        throw browserError;
      }
      
      // Re-throw with additional context for file upload errors
      if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
        const timeoutError = new Error('File upload timed out. Please try again with a smaller file.');
        (timeoutError as any).errorInfo = {
          type: 'UPLOAD_TIMEOUT_ERROR',
          message: 'Upload timed out',
          isRetryable: true
        };
        throw timeoutError;
      }
      
      throw error;
    }
  },

  // Update candidate
  async updateCandidate(
    id: number,
    candidateData: Partial<CreateCandidateRequest>,
    cvFile?: File
  ): Promise<ApiResponse<Candidate>> {
    const formData = new FormData();
    
    formData.append('candidateData', JSON.stringify(candidateData));
    
    if (cvFile) {
      formData.append('cv', cvFile);
    }

    const response = await api.put<ApiResponse<Candidate>>(
      API_ENDPOINTS.candidateById(id),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    if (APP_CONFIG.enableToastNotifications && response.data.success) {
      toast.success('Candidate updated successfully!');
    }
    
    return response.data;
  },

  // Delete candidate
  async deleteCandidate(id: number): Promise<ApiResponse<{ deleted: boolean }>> {
    const response = await api.delete<ApiResponse<{ deleted: boolean }>>(
      API_ENDPOINTS.candidateById(id)
    );
    
    if (APP_CONFIG.enableToastNotifications && response.data.success) {
      toast.success('Candidate deleted successfully!');
    }
    
    return response.data;
  },

  // Download candidate CV
  async downloadCV(id: number): Promise<Blob> {
    const response = await api.get(
      API_ENDPOINTS.candidateCV(id),
      { responseType: 'blob' }
    );
    return response.data;
  },
};

// Helper function to handle file validation
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Check file size
  if (file.size > APP_CONFIG.maxFileSize) {
    return {
      valid: false,
      error: `File size must be less than ${Math.round(APP_CONFIG.maxFileSize / 1024 / 1024)}MB`,
    };
  }

  // Check file type
  if (!APP_CONFIG.allowedFileTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Only PDF and DOCX files are allowed',
    };
  }

  return { valid: true };
};

export default api;