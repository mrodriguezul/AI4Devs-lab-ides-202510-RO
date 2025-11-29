// API Configuration and Types
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3010';

export const API_ENDPOINTS = {
  candidates: `${API_BASE_URL}/api/candidates`,
  candidateById: (id: number) => `${API_BASE_URL}/api/candidates/${id}`,
  candidateCV: (id: number) => `${API_BASE_URL}/api/candidates/${id}/cv`,
};

export const APP_CONFIG = {
  name: process.env.REACT_APP_NAME || 'ATS - Applicant Tracking System',
  version: process.env.REACT_APP_VERSION || '1.0.0',
  enableDebug: process.env.REACT_APP_ENABLE_DEBUG === 'true',
  enableToastNotifications: process.env.REACT_APP_ENABLE_TOAST_NOTIFICATIONS === 'true',
  maxFileSize: parseInt(process.env.REACT_APP_MAX_FILE_SIZE || '10485760'),
  allowedFileTypes: process.env.REACT_APP_ALLOWED_FILE_TYPES?.split(',') || [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
};

// Type Definitions for API responses
export interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  cvFilePath?: string;
  createdAt: string;
  updatedAt: string;
  education: Education[];
  workExperience: WorkExperience[];
}

export interface Education {
  id: number;
  degree: string;
  institution: string;
  graduationYear: number;
  candidateId: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkExperience {
  id: number;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
  candidateId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCandidateRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  education: Omit<Education, 'id' | 'candidateId' | 'createdAt' | 'updatedAt'>[];
  workExperience: Omit<WorkExperience, 'id' | 'candidateId' | 'createdAt' | 'updatedAt'>[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: string[];
}