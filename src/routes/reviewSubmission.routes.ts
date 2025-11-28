import { Router } from 'express';
import reviewSubmissionController from '../controllers/reviewSubmission.controller';
import { optionalAuth, authenticate } from '../middleware/auth';
import { submissionRateLimiter } from '../middleware/rateLimiter';
import { validateUUID } from '../utils/validators';
import { handleValidationErrors } from '../middleware/validation';
import { body } from 'express-validator';

const router = Router();

// Submit review (can be anonymous or authenticated)
router.post(
  '/',
  submissionRateLimiter,
  optionalAuth,
  [
    body('invitationToken').isUUID().withMessage('Invalid invitation token'),
    body('responses').isObject().withMessage('Responses must be an object'),
    handleValidationErrors,
  ],
  reviewSubmissionController.submitReview
);

// Get submission stats (authenticated only)
router.get(
  '/requests/:id/stats',
  authenticate,
  [validateUUID('id'), handleValidationErrors],
  reviewSubmissionController.getSubmissionStats
);

export default router;
