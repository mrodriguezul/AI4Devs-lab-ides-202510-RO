import { Request, Response, NextFunction } from 'express';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileUploadConfig } from './config/fileUpload';

dotenv.config();
const prisma = new PrismaClient();

export const app = express();
export default prisma;

const port = 3010;

// Ensure upload directory exists
if (!fs.existsSync(fileUploadConfig.uploadDirectory)) {
  fs.mkdirSync(fileUploadConfig.uploadDirectory, { recursive: true });
}
if (!fs.existsSync(fileUploadConfig.cvStoragePath)) {
  fs.mkdirSync(fileUploadConfig.cvStoragePath, { recursive: true });
}
if (!fs.existsSync(fileUploadConfig.tempStoragePath)) {
  fs.mkdirSync(fileUploadConfig.tempStoragePath, { recursive: true });
}

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'ATS API Server Running', 
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes will be added here
// app.use('/api/candidates', candidateRoutes);

// Global error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  
  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: 'File too large. Maximum size is 10MB.'
    });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      error: 'Unexpected file field.'
    });
  }
  
  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: err.message
    });
  }
  
  // Database errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      error: 'A record with this data already exists.'
    });
  }
  
  // Default error response
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
