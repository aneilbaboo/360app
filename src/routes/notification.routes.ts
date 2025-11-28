import { Router } from 'express';
import notificationController from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';
import { validateUUID } from '../utils/validators';
import { handleValidationErrors } from '../middleware/validation';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

router.get('/', notificationController.getUserNotifications);

router.put(
  '/:id/read',
  [validateUUID('id'), handleValidationErrors],
  notificationController.markAsRead
);

router.put('/read-all', notificationController.markAllAsRead);

export default router;
