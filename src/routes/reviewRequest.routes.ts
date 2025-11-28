import { Router } from 'express';
import reviewRequestController from '../controllers/reviewRequest.controller';
import { authenticate } from '../middleware/auth';
import {
  validateReviewTitle,
  validateQuestions,
  validateMinRespondents,
  validateUUID,
} from '../utils/validators';
import { handleValidationErrors } from '../middleware/validation';
import { body } from 'express-validator';

const router = Router();

// All review request routes require authentication
router.use(authenticate);

router.post(
  '/',
  [
    validateReviewTitle(),
    validateQuestions(),
    validateMinRespondents(),
    body('deadline').optional().isISO8601().withMessage('Invalid deadline format'),
    handleValidationErrors,
  ],
  reviewRequestController.createReviewRequest
);

router.get('/', reviewRequestController.listReviewRequests);

router.get(
  '/:id',
  [validateUUID('id'), handleValidationErrors],
  reviewRequestController.getReviewRequest
);

router.put(
  '/:id',
  [
    validateUUID('id'),
    validateReviewTitle().optional(),
    validateQuestions().optional(),
    validateMinRespondents(),
    body('deadline').optional().isISO8601().withMessage('Invalid deadline format'),
    handleValidationErrors,
  ],
  reviewRequestController.updateReviewRequest
);

router.post(
  '/:id/close',
  [validateUUID('id'), handleValidationErrors],
  reviewRequestController.closeReviewRequest
);

router.delete(
  '/:id',
  [validateUUID('id'), handleValidationErrors],
  reviewRequestController.deleteReviewRequest
);

export default router;
