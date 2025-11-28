import { Response, NextFunction } from 'express';
import reviewRequestService from '../services/reviewRequest.service';
import { AuthenticatedRequest } from '../types';

export class ReviewRequestController {
  async createReviewRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { title, questions, minRespondents, deadline } = req.body;

      const reviewRequest = await reviewRequestService.createReviewRequest(
        req.user.id,
        title,
        questions,
        minRespondents,
        deadline ? new Date(deadline) : undefined
      );

      res.status(201).json(reviewRequest);
    } catch (error) {
      next(error);
    }
  }

  async listReviewRequests(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const requests = await reviewRequestService.listUserReviewRequests(req.user.id);
      res.status(200).json(requests);
    } catch (error) {
      next(error);
    }
  }

  async getReviewRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;
      const request = await reviewRequestService.getReviewRequest(id, req.user.id);
      res.status(200).json(request);
    } catch (error) {
      next(error);
    }
  }

  async updateReviewRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;
      const updates = req.body;

      if (updates.deadline) {
        updates.deadline = new Date(updates.deadline);
      }

      const request = await reviewRequestService.updateReviewRequest(
        id,
        req.user.id,
        updates
      );

      res.status(200).json(request);
    } catch (error) {
      next(error);
    }
  }

  async closeReviewRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;
      const request = await reviewRequestService.closeReviewRequest(id, req.user.id);
      res.status(200).json(request);
    } catch (error) {
      next(error);
    }
  }

  async deleteReviewRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;
      const result = await reviewRequestService.deleteReviewRequest(id, req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new ReviewRequestController();
