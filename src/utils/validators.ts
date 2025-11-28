import { body, param, ValidationChain } from 'express-validator';

export const validateEmail = (): ValidationChain =>
  body('email')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail();

export const validatePassword = (): ValidationChain =>
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    );

export const validateUUID = (field: string = 'id'): ValidationChain =>
  param(field).isUUID().withMessage(`Invalid ${field} format`);

export const validateMinRespondents = (): ValidationChain =>
  body('minRespondents')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Minimum respondents must be between 1 and 50');

export const validateReviewTitle = (): ValidationChain =>
  body('title')
    .isString()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters');

export const validateQuestions = (): ValidationChain =>
  body('questions')
    .isArray({ min: 1 })
    .withMessage('At least one question is required')
    .custom((questions) => {
      for (const q of questions) {
        if (!q.id || !q.question || !q.type) {
          throw new Error('Each question must have id, question, and type');
        }
        if (!['text', 'rating', 'multipleChoice'].includes(q.type)) {
          throw new Error('Invalid question type');
        }
      }
      return true;
    });
