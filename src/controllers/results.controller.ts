import { Response, NextFunction } from 'express';
import aiSynthesisService from '../services/ai/synthesis.service';
import { AuthenticatedRequest } from '../types';

export class ResultsController {
  async getResults(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;
      const results = await aiSynthesisService.getResults(id, req.user.id);

      res.status(200).json(results);
    } catch (error) {
      next(error);
    }
  }

  async getStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;
      const results = await aiSynthesisService.getResults(id, req.user.id);

      res.status(200).json({
        status: results.available ? 'completed' : 'pending',
        message: results.message || 'Results ready',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ResultsController();
