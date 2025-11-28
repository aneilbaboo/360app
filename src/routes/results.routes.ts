import { Router } from 'express';
import resultsController from '../controllers/results.controller';
import { authenticate } from '../middleware/auth';
import { validateUUID } from '../utils/validators';
import { handleValidationErrors } from '../middleware/validation';

const router = Router();

// All results routes require authentication
router.use(authenticate);

router.get(
  '/:id/results',
  [validateUUID('id'), handleValidationErrors],
  resultsController.getResults
);

router.get(
  '/:id/status',
  [validateUUID('id'), handleValidationErrors],
  resultsController.getStatus
);

export default router;
