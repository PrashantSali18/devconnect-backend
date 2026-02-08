import { body, param, query, validationResult } from 'express-validator';

// Validation error handler
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};

// Auth Validation Rules
export const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  validate
];

export const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  validate
];

export const forgotPasswordValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  validate
];

export const resetPasswordValidation = [
  param('resetToken')
    .notEmpty().withMessage('Reset token is required')
    .isLength({ min: 40, max: 40 }).withMessage('Invalid reset token format'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  validate
];

// User Validation Rules
export const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  
  body('skills')
    .optional()
    .custom((value) => {
      if (Array.isArray(value)) {
        if (value.length > 20) {
          throw new Error('Maximum 20 skills allowed');
        }
        value.forEach(skill => {
          if (typeof skill !== 'string' || skill.length > 30) {
            throw new Error('Each skill must be a string with max 30 characters');
          }
        });
      }
      return true;
    }),
  
  body('githubUrl')
    .optional()
    .trim()
    .isURL().withMessage('Please provide a valid GitHub URL'),
  
  body('linkedinUrl')
    .optional()
    .trim()
    .isURL().withMessage('Please provide a valid LinkedIn URL'),
  
  body('websiteUrl')
    .optional()
    .trim()
    .isURL().withMessage('Please provide a valid website URL'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Location cannot exceed 100 characters'),
  
  validate
];

// Post Validation Rules
export const createPostValidation = [
  body('content')
    .trim()
    .notEmpty().withMessage('Post content is required')
    .isLength({ min: 1, max: 2000 }).withMessage('Content must be between 1 and 2000 characters'),
  
  body('code')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Code snippet cannot exceed 5000 characters'),
  
  body('language')
    .optional()
    .isIn(['javascript', 'python', 'java', 'cpp', 'html', 'css', 'typescript', 'go', 'rust', 'other'])
    .withMessage('Invalid language selection'),
  
  body('tags')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        const tags = value.split(',').map(t => t.trim());
        if (tags.length > 10) {
          throw new Error('Maximum 10 tags allowed');
        }
      } else if (Array.isArray(value)) {
        if (value.length > 10) {
          throw new Error('Maximum 10 tags allowed');
        }
      }
      return true;
    }),
  
  validate
];

export const updatePostValidation = [
  body('content')
    .optional()
    .trim()
    .isLength({ min: 1, max: 2000 }).withMessage('Content must be between 1 and 2000 characters'),
  
  body('code')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Code snippet cannot exceed 5000 characters'),
  
  body('language')
    .optional()
    .isIn(['javascript', 'python', 'java', 'cpp', 'html', 'css', 'typescript', 'go', 'rust', 'other'])
    .withMessage('Invalid language selection'),
  
  validate
];

export const addCommentValidation = [
  body('text')
    .trim()
    .notEmpty().withMessage('Comment text is required')
    .isLength({ min: 1, max: 500 }).withMessage('Comment must be between 1 and 500 characters'),
  
  validate
];

// Message Validation Rules
export const sendMessageValidation = [
  body('receiverId')
    .notEmpty().withMessage('Receiver ID is required')
    .isMongoId().withMessage('Invalid receiver ID'),
  
  body('content')
    .trim()
    .notEmpty().withMessage('Message content is required')
    .isLength({ min: 1, max: 2000 }).withMessage('Message must be between 1 and 2000 characters'),
  
  validate
];

// Search Validation Rules
export const searchValidation = [
  query('q')
    .trim()
    .notEmpty().withMessage('Search query is required')
    .isLength({ min: 1, max: 100 }).withMessage('Search query must be between 1 and 100 characters'),
  
  validate
];

// Pagination Validation Rules
export const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  validate
];

// MongoDB ID Validation
export const mongoIdValidation = (paramName = 'id') => [
  param(paramName)
    .notEmpty().withMessage(`${paramName} is required`)
    .isMongoId().withMessage(`Invalid ${paramName} format`),
  
  validate
];