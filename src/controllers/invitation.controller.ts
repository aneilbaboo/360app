import { Response, NextFunction, Request } from 'express';
import invitationService from '../services/invitation.service';
import { AuthenticatedRequest } from '../types';

export class InvitationController {
  async createInvitations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;
      const { invitations } = req.body;

      const createdInvitations = await invitationService.createInvitations(
        id,
        req.user.id,
        invitations
      );

      res.status(201).json(createdInvitations);
    } catch (error) {
      next(error);
    }
  }

  async listInvitations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;
      const invitations = await invitationService.listInvitations(id, req.user.id);

      res.status(200).json(invitations);
    } catch (error) {
      next(error);
    }
  }

  async validateInvitationToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;
      const invitation = await invitationService.validateInvitationToken(token);

      res.status(200).json(invitation);
    } catch (error) {
      next(error);
    }
  }
}

export default new InvitationController();
