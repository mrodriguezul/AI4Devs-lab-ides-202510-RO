import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileUploadConfig } from './fileUpload';

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Ensure the directory exists
            if (!fs.existsSync(fileUploadConfig.cvStoragePath)) {
                      fs.mkdirSync(fileUploadConfig.cvStoragePath, { recursive: true });
            }
            cb(null, fileUploadConfig.cvStoragePath);
    },
    filename: (req, file, cb) => {
        // For now, use a temporary filename, will be renamed after candidate creation
        const timestamp = Date.now();
        const extension = path.extname(file.originalname);
        const tempFilename = `temp_${timestamp}_${file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        cb(null, tempFilename);
    }
});

// File filter function
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Check file type
    if (fileUploadConfig.isValidFileType(file.mimetype, file.originalname)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type. Only ${fileUploadConfig.allowedExtensions.join(', ')} files are allowed.`));
    }
};

// Configure multer
const upload = multer({
    storage,
    fileFilter,
        limits: {
            fileSize: fileUploadConfig.maxFileSize,
            files: 1 // Only allow one CV file per upload
        }
});

export { upload };

// Utility function to rename file after candidate creation
export const renameUploadedFile = (tempFilePath: string, candidateId: number, originalName: string): string => {
      const newFileName = fileUploadConfig.generateFileName(candidateId, originalName);
  const newFilePath = path.join(fileUploadConfig.cvStoragePath, newFileName);
  
  try {
    fs.renameSync(tempFilePath, newFilePath);
    return newFilePath;
  } catch (error) {
    console.error('Error renaming file:', error);
    // If rename fails, try to clean up the temp file
    try {
      fs.unlinkSync(tempFilePath);
    } catch (cleanupError) {
      console.error('Error cleaning up temp file:', cleanupError);
    }
    throw error;
  }
};

// Utility function to delete uploaded file
export const deleteUploadedFile = (filePath: string): void => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};