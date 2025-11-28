import { Router } from 'express';
import invitationController from '../controllers/invitation.controller';
import { authenticate } from '../middleware/auth';
import { validateUUID } from '../utils/validators';
import { handleValidationErrors } from '../middleware/validation';
import { body, param } from 'express-validator';

const router = Router();

// Public route to validate invitation token
router.get(
  '/:token',
  [param('token').isUUID().withMessage('Invalid token format'), handleValidationErrors],
  invitationController.validateInvitationToken
);

// Protected routes for creating and listing invitations
router.post(
  '/requests/:id/invitations',
  authenticate,
  [
    validateUUID('id'),
    body('invitations')
      .isArray({ min: 1 })
      .withMessage('At least one invitation is required'),
    body('invitations.*.email')
      .optional()
      .isEmail()
      .withMessage('Invalid email address'),
    body('invitations.*.userId')
      .optional()
      .isUUID()
      .withMessage('Invalid user ID format'),
    handleValidationErrors,
  ],
  invitationController.createInvitations
);

router.get(
  '/requests/:id/invitations',
  authenticate,
  [validateUUID('id'), handleValidationErrors],
  invitationController.listInvitations
);

export default router;
