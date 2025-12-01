import { Router } from 'express';
import { CandidateController } from '../controllers/candidateController';
import { createCandidateValidation } from '../validators/candidateValidator';
import { upload } from '../config/multer';
import { parseFormDataFields } from '../middleware/parseFormData';

const router = Router();
const candidateController = new CandidateController();

/**
 * @route GET /api/candidates
 * @description Get all candidates with pagination and search
 * @query page - Page number (default: 1)
 * @query limit - Items per page (default: 10)  
 * @query search - Search term for filtering candidates
 * @access Public (will be protected with JWT later)
 */
router.get('/', candidateController.getAllCandidates);

/**
 * @route GET /api/candidates/:id
 * @description Get a specific candidate by ID
 * @param id - Candidate ID
 * @access Public (will be protected with JWT later)
 */
router.get('/:id', candidateController.getCandidateById);

/**
 * @route POST /api/candidates
 * @description Create a new candidate with optional CV upload
 * @body firstName, lastName, email, phone, address, education[], workExperience[]
 * @file cv - Optional CV file (PDF or DOCX, max 10MB)
 * @access Public (will be protected with JWT later)
 */
router.post(
  '/',
  upload.single('cv'), // Handle CV file upload
  parseFormDataFields, // Parse JSON strings in FormData
  createCandidateValidation, // Validate request data
  candidateController.createCandidate
);

/**
 * @route PUT /api/candidates/:id
 * @description Update an existing candidate
 * @param id - Candidate ID
 * @body firstName, lastName, email, phone, address (all optional)
 * @file cv - Optional new CV file (PDF or DOCX, max 10MB)
 * @access Public (will be protected with JWT later)
 */
router.put(
  '/:id',
  upload.single('cv'),
  // Note: Using partial validation - only validate provided fields
  candidateController.updateCandidate
);

/**
 * @route DELETE /api/candidates/:id
 * @description Delete a candidate and their CV file
 * @param id - Candidate ID
 * @access Public (will be protected with JWT later)
 */
router.delete('/:id', candidateController.deleteCandidate);

/**
 * @route GET /api/candidates/:id/cv
 * @description Download candidate's CV file
 * @param id - Candidate ID
 * @access Public (will be protected with JWT later)
 */
router.get('/:id/cv', candidateController.downloadCV);

export default router;