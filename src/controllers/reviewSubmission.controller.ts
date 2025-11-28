import { Response, NextFunction } from 'express';
import reviewSubmissionService from '../services/reviewSubmission.service';
import { AuthenticatedRequest } from '../types';

export class ReviewSubmissionController {
  async submitReview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { invitationToken, responses } = req.body;
      const userId = req.user?.id;

      const result = await reviewSubmissionService.submitReview(
        invitationToken,
        responses,
        userId
      );

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getSubmissionStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;
      const stats = await reviewSubmissionService.getSubmissionStats(id, req.user.id);

      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }
}

export default new ReviewSubmissionController();
