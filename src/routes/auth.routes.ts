import { Router } from 'express';
import { body } from 'express-validator';
import authController from '../controllers/auth.controller';
import { validateEmail, validatePassword } from '../utils/validators';
import { handleValidationErrors } from '../middleware/validation';
import { authRateLimiter } from '../middleware/rateLimiter';
import { authenticate } from '../middleware/auth';
import passport from '../config/passport';

const router = Router();

// Email/Password Authentication
router.post(
  '/register',
  authRateLimiter,
  [validateEmail(), validatePassword(), handleValidationErrors],
  authController.register
);

router.post(
  '/login',
  authRateLimiter,
  [validateEmail(), body('password').notEmpty(), handleValidationErrors],
  authController.login
);

router.post('/logout', authController.logout);

router.post('/refresh', authenticate, authController.refreshToken);

// Google OAuth
router.get(
  '/oauth/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/oauth/google/callback',
  passport.authenticate('google', { session: false }),
  authController.googleCallback
);

// Facebook OAuth
router.get(
  '/oauth/facebook',
  passport.authenticate('facebook', { scope: ['email'], session: false })
);

router.get(
  '/oauth/facebook/callback',
  passport.authenticate('facebook', { session: false }),
  authController.facebookCallback
);

export default router;
