import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { CandidateService, CreateCandidateData } from '../services/candidateService';
import { successResponse, errorResponse, validationErrorResponse } from '../utils/apiResponse';
import { renameUploadedFile, deleteUploadedFile } from '../config/multer';
import path from 'path';

const candidateService = new CandidateService();

export class CandidateController {
  async getAllCandidates(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      let result;
      
      if (search) {
        result = await candidateService.searchCandidates(search, page, limit);
      } else {
        result = await candidateService.getAllCandidates(page, limit);
      }

      res.json(successResponse(
        result.candidates,
        search ? `Found ${result.total} candidates matching "${search}"` : 'Candidates retrieved successfully',
        {
          page,
          limit,
          total: result.total,
          totalPages: result.totalPages
        }
      ));
    } catch (error) {
      next(error);
    }
  }

  async getCandidateById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json(errorResponse('Invalid candidate ID'));
      }

      const candidate = await candidateService.getCandidateById(id);
      
      if (!candidate) {
        return res.status(404).json(errorResponse('Candidate not found'));
      }

      res.json(successResponse(candidate, 'Candidate retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async createCandidate(req: Request, res: Response, next: NextFunction) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Clean up uploaded file if validation fails
        if (req.file) {
          deleteUploadedFile(req.file.path);
        }
        return res.status(400).json(validationErrorResponse(errors.array()));
      }

      const candidateData: CreateCandidateData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        education: req.body.education ? JSON.parse(req.body.education) : [],
        workExperience: req.body.workExperience ? JSON.parse(req.body.workExperience) : []
      };

      let cvFilePath: string | undefined;

      // Handle file upload
      if (req.file) {
        try {
          // Create candidate first to get ID
          const tempCandidate = await candidateService.createCandidate(candidateData);
          
          // Rename uploaded file with candidate ID
          cvFilePath = renameUploadedFile(req.file.path, tempCandidate.id, req.file.originalname);
          
          // Update candidate with final CV path
          const candidate = await candidateService.updateCandidate(tempCandidate.id, {}, cvFilePath);
          
          res.status(201).json(successResponse(
            candidate,
            'Candidate created successfully with CV upload'
          ));
        } catch (error) {
          // Clean up file if something goes wrong
          deleteUploadedFile(req.file.path);
          throw error;
        }
      } else {
        // Create candidate without CV
        const candidate = await candidateService.createCandidate(candidateData);
        
        res.status(201).json(successResponse(
          candidate,
          'Candidate created successfully'
        ));
      }
    } catch (error) {
      next(error);
    }
  }

  async updateCandidate(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        if (req.file) {
          deleteUploadedFile(req.file.path);
        }
        return res.status(400).json(errorResponse('Invalid candidate ID'));
      }

      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        if (req.file) {
          deleteUploadedFile(req.file.path);
        }
        return res.status(400).json(validationErrorResponse(errors.array()));
      }

      const candidateData: Partial<CreateCandidateData> = {};
      
      if (req.body.firstName) candidateData.firstName = req.body.firstName;
      if (req.body.lastName) candidateData.lastName = req.body.lastName;
      if (req.body.email) candidateData.email = req.body.email;
      if (req.body.phone !== undefined) candidateData.phone = req.body.phone;
      if (req.body.address !== undefined) candidateData.address = req.body.address;

      let cvFilePath: string | undefined;

      // Handle file upload
      if (req.file) {
        cvFilePath = renameUploadedFile(req.file.path, id, req.file.originalname);
      }

      const candidate = await candidateService.updateCandidate(id, candidateData, cvFilePath);
      
      if (!candidate) {
        if (cvFilePath) {
          deleteUploadedFile(cvFilePath);
        }
        return res.status(404).json(errorResponse('Candidate not found'));
      }

      res.json(successResponse(
        candidate,
        cvFilePath ? 'Candidate updated successfully with new CV' : 'Candidate updated successfully'
      ));
    } catch (error) {
      if (req.file) {
        deleteUploadedFile(req.file.path);
      }
      next(error);
    }
  }

  async deleteCandidate(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json(errorResponse('Invalid candidate ID'));
      }

      const deleted = await candidateService.deleteCandidate(id);
      
      if (!deleted) {
        return res.status(404).json(errorResponse('Candidate not found'));
      }

      res.json(successResponse(
        null,
        'Candidate deleted successfully'
      ));
    } catch (error) {
      next(error);
    }
  }

  async downloadCV(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json(errorResponse('Invalid candidate ID'));
      }

      const candidate = await candidateService.getCandidateById(id);
      
      if (!candidate) {
        return res.status(404).json(errorResponse('Candidate not found'));
      }

      if (!candidate.cvFilePath) {
        return res.status(404).json(errorResponse('CV not found for this candidate'));
      }

      const fileName = path.basename(candidate.cvFilePath);
      res.download(candidate.cvFilePath, fileName);
    } catch (error) {
      next(error);
    }
  }
}