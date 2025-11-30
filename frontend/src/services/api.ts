import axios, { AxiosResponse } from 'axios';
import { toast } from 'react-toastify';
import { 
  API_ENDPOINTS, 
  APP_CONFIG,
  Candidate, 
  CreateCandidateRequest, 
  ApiResponse, 
  PaginatedResponse
} from '../types/api';

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

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    if (APP_CONFIG.enableDebug) {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error);
    
    if (APP_CONFIG.enableToastNotifications) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      toast.error(`API Error: ${errorMessage}`);
    }
    
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
    const response = await api.get<PaginatedResponse<Candidate>>(
      API_ENDPOINTS.candidates,
      { params }
    );
    return response.data;
  },

  // Get candidate by ID
  async getCandidateById(id: number): Promise<ApiResponse<Candidate>> {
    const response = await api.get<ApiResponse<Candidate>>(
      API_ENDPOINTS.candidateById(id)
    );
    return response.data;
  },

  // Create new candidate
  async createCandidate(formData: FormData): Promise<ApiResponse<Candidate>> {
    try {
      const response = await api.post<ApiResponse<Candidate>>(
        API_ENDPOINTS.candidates,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000, // 30 seconds timeout
          // Disable any interceptors that might conflict with MetaMask
          transformRequest: [(data) => data], // Pass FormData as-is
        }
      );
      
      return response.data;
    } catch (error: any) {
      // Check if this is a MetaMask related error and provide better error handling
      if (error.message?.includes('MetaMask') || error.message?.includes('ethereum')) {
        console.warn('MetaMask interference detected in API call');
        throw new Error('Browser extension interference detected. Please try disabling wallet extensions or use incognito mode.');
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