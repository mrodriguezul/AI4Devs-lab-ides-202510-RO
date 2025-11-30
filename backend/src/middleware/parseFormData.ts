import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to parse JSON strings in FormData before validation
 * This is needed because when using multipart/form-data, complex objects
 * need to be sent as JSON strings and parsed on the server side.
 */
export const parseFormDataFields = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Parse education field if present
    if (req.body.education && typeof req.body.education === 'string') {
      try {
        req.body.education = JSON.parse(req.body.education);
      } catch (error) {
        console.warn('Failed to parse education field:', error);
        req.body.education = [];
      }
    }

    // Parse workExperience field if present
    if (req.body.workExperience && typeof req.body.workExperience === 'string') {
      try {
        req.body.workExperience = JSON.parse(req.body.workExperience);
      } catch (error) {
        console.warn('Failed to parse workExperience field:', error);
        req.body.workExperience = [];
      }
    }

    // Ensure arrays exist even if not provided
    if (!req.body.education || req.body.education === undefined) {
      req.body.education = [];
    }
    
    if (!req.body.workExperience || req.body.workExperience === undefined) {
      req.body.workExperience = [];
    }

    next();
  } catch (error) {
    console.error('Error in parseFormDataFields middleware:', error);
    res.status(400).json({
      success: false,
      message: 'Invalid form data format',
      errors: ['Failed to parse form data']
    });
  }
};