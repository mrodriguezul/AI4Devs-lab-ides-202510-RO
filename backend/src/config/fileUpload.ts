// File upload configuration for ATS system
export const fileUploadConfig = {
  // Storage paths
  uploadDirectory: 'D:/tmp/ats-files',
  cvStoragePath: 'D:/tmp/ats-files/cvs',
  tempStoragePath: 'D:/tmp/ats-files/temp',
  
  // File size limits (in bytes)
  maxFileSize: 10 * 1024 * 1024, // 10MB
  
  // Allowed file types
  allowedMimeTypes: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  ],
  
  // File extensions
  allowedExtensions: ['.pdf', '.docx'],
  
  // File naming
  generateFileName: (candidateId: number, originalName: string): string => {
    const timestamp = Date.now();
    const extension = originalName.substring(originalName.lastIndexOf('.'));
    const cleanName = originalName
      .replace(extension, '')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toLowerCase();
    return `${candidateId}_${timestamp}_${cleanName}${extension}`;
  },
  
  // Validation
  isValidFileType: (mimetype: string, filename: string): boolean => {
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return fileUploadConfig.allowedMimeTypes.includes(mimetype) && 
           fileUploadConfig.allowedExtensions.includes(extension);
  }
};