import { v4 as uuidv4 } from 'uuid';
import prisma from '../utils/db';
import { NotFoundError, ForbiddenError, ValidationError, UnprocessableEntityError } from '../utils/errors';
import notificationService from './notification.service';

export class InvitationService {
  async createInvitations(
    requestId: string,
    userId: string,
    invitations: Array<{ email?: string; userId?: string }>
  ) {
    const request = await prisma.reviewRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundError('Review request');
    }

    if (request.userId !== userId) {
      throw new ForbiddenError('You do not have permission to invite reviewers for this request');
    }

    if (request.status !== 'OPEN') {
      throw new UnprocessableEntityError(
        'Cannot send invitations for a closed or completed review request'
      );
    }

    const createdInvitations = await Promise.all(
      invitations.map(async (inv) => {
        return prisma.invitation.create({
          data: {
            requestId,
            inviteeEmail: inv.email,
            inviteeUserId: inv.userId,
            invitationToken: uuidv4(),
          },
        });
      })
    );

    // Send email invitations asynchronously
    setImmediate(async () => {
      for (const invitation of createdInvitations) {
        try {
          await notificationService.sendInvitationEmail(invitation.id);
        } catch (error) {
          console.error('Error sending invitation email:', error);
        }
      }
    });

    return createdInvitations;
  }

  async listInvitations(requestId: string, userId: string) {
    const request = await prisma.reviewRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundError('Review request');
    }

    if (request.userId !== userId) {
      throw new ForbiddenError('You do not have permission to view invitations for this request');
    }

    const invitations = await prisma.invitation.findMany({
      where: { requestId },
      include: {
        inviteeUser: {
          select: {
            id: true,
            email: true,
          },
        },
        submission: {
          select: {
            id: true,
            submittedAt: true,
          },
        },
      },
      orderBy: { sentAt: 'desc' },
    });

    return invitations;
  }

  async validateInvitationToken(token: string) {
    const invitation = await prisma.invitation.findUnique({
      where: { invitationToken: token },
      include: {
        request: {
          select: {
            id: true,
            title: true,
            questions: true,
            status: true,
            deadline: true,
          },
        },
      },
    });

    if (!invitation) {
      throw new NotFoundError('Invitation');
    }

    if (invitation.status === 'SUBMITTED') {
      throw new UnprocessableEntityError('This invitation has already been used');
    }

    if (invitation.status === 'EXPIRED') {
      throw new UnprocessableEntityError('This invitation has expired');
    }

    if (invitation.request.status !== 'OPEN') {
      throw new UnprocessableEntityError('This review request is no longer accepting responses');
    }

    if (invitation.request.deadline && new Date() > invitation.request.deadline) {
      // Mark as expired
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' },
      });
      throw new UnprocessableEntityError('This invitation has expired');
    }

    return {
      invitationId: invitation.id,
      requestId: invitation.request.id,
      title: invitation.request.title,
      questions: invitation.request.questions,
    };
  }

  async markInvitationAsSubmitted(invitationId: string) {
    await prisma.invitation.update({
      where: { id: invitationId },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
    });
  }
}

export default new InvitationService();
