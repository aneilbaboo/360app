import { Response, NextFunction } from 'express';
import notificationService from '../services/notification.service';
import { AuthenticatedRequest } from '../types';

export class NotificationController {
  async getUserNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const unreadOnly = req.query.unreadOnly === 'true';
      const notifications = await notificationService.getUserNotifications(
        req.user.id,
        unreadOnly
      );

      res.status(200).json(notifications);
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;
      await notificationService.markNotificationAsRead(id, req.user.id);

      res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await notificationService.markAllAsRead(req.user.id);

      res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
      next(error);
    }
  }
}

export default new NotificationController();
