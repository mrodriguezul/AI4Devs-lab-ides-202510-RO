import { body, ValidationChain } from 'express-validator';
// Candidate validation rules
export const candidateValidation: ValidationChain[] = [
    body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .matches(/^[a-zA-ZÀ-ÿ\\s'-]+$/)
    .withMessage('First name contains invalid characters')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .matches(/^[a-zA-ZÀ-ÿ\\s'-]+$/)
    .withMessage('Last name contains invalid characters')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
    body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
    body('phone')
    .optional()
    .trim()
    .matches(/^[+]?[0-9\\s().-]{10,20}$/)
    .withMessage('Please provide a valid phone number'),
    body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address must be less than 200 characters'),
];
// Education validation rules
export const educationValidation: ValidationChain[] = [
    body('education')
    .isArray({ min: 0 })
    .withMessage('Education must be an array'),
    body('education.*.degree')
    .if(body('education').isArray({ min: 1 }))
    .trim()
    .notEmpty()
    .withMessage('Degree is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Degree must be between 2 and 100 characters'),
    body('education.*.institution')
    .if(body('education').isArray({ min: 1 }))
    .trim()
    .notEmpty()
    .withMessage('Institution is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Institution must be between 2 and 100 characters'),
    body('education.*.graduationYear')
    .optional()
    .isInt({ min: 1950, max: new Date().getFullYear() + 10 })
    .withMessage('Please provide a valid graduation year'),
];

// Work experience validation rules
export const workExperienceValidation: ValidationChain[] = [
    body('workExperience')
    .isArray({ min: 0 })
    .withMessage('Work experience must be an array'),
    body('workExperience.*.company')
    .if(body('workExperience').isArray({ min: 1 }))
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
    body('workExperience.*.position')
    .if(body('workExperience').isArray({ min: 1 }))
    .trim()
    .notEmpty()
    .withMessage('Position is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Position must be between 2 and 100 characters'),
    body('workExperience.*.startDate')
    .if(body('workExperience').isArray({ min: 1 }))
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Please provide a valid start date (YYYY-MM-DD)'),
    body('workExperience.*.endDate')
    .optional({ nullable: true })
    .custom((endDate, { req }) => {
        if (endDate === null || endDate === undefined || endDate === '') {
            return true; // Allow null, undefined, or empty string
        }
        
        // Validate date format if value is provided
        if (!Date.parse(endDate)) {
            throw new Error('Please provide a valid end date (YYYY-MM-DD)');
        }
        
        // Check if end date is after start date
        const workExpIndex = req.body.workExperience?.findIndex((exp: any) => exp.endDate === endDate);
        if (workExpIndex !== -1 && req.body.workExperience[workExpIndex].startDate) {
            const start = new Date(req.body.workExperience[workExpIndex].startDate);
            const end = new Date(endDate);
            if (end <= start) {
                throw new Error('End date must be after start date');
            }
        }
        return true;
    }),
    body('workExperience.*.description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
];// Combined validation for creating a candidate
export const createCandidateValidation = [
    ...candidateValidation,
    ...educationValidation,
    ...workExperienceValidation,
];