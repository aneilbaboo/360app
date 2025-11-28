import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { AuthenticatedRequest } from '../types';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.register(email, password);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const tokens = await authService.refreshToken(req.user.id, req.user.email);
      res.status(200).json(tokens);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response) {
    // In a stateless JWT system, logout is typically handled client-side
    // by removing the tokens. For enhanced security, you could implement
    // a token blacklist here.
    res.status(200).json({ message: 'Logged out successfully' });
  }

  // OAuth callbacks will be handled by Passport strategies
  async googleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as any;
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${user.accessToken}`);
    } catch (error) {
      next(error);
    }
  }

  async facebookCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as any;
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${user.accessToken}`);
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
