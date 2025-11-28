import prisma from '../utils/db';
import invitationService from './invitation.service';
import { NotFoundError, UnprocessableEntityError, ConflictError, ForbiddenError } from '../utils/errors';
import { ReviewResponses } from '../types';
import notificationService from './notification.service';
import aiSynthesisService from './ai/synthesis.service';

export class ReviewSubmissionService {
  async submitReview(
    invitationToken: string,
    responses: ReviewResponses,
    userId?: string
  ) {
    // Validate invitation token
    const invitation = await prisma.invitation.findUnique({
      where: { invitationToken },
      include: {
        request: {
          select: {
            id: true,
            questions: true,
            status: true,
            deadline: true,
            minRespondents: true,
          },
        },
        submission: true,
      },
    });

    if (!invitation) {
      throw new NotFoundError('Invitation');
    }

    if (invitation.submission) {
      throw new ConflictError('This invitation has already been used to submit a review');
    }

    if (invitation.status === 'SUBMITTED') {
      throw new ConflictError('This invitation has already been submitted');
    }

    if (invitation.status === 'EXPIRED') {
      throw new UnprocessableEntityError('This invitation has expired');
    }

    if (invitation.request.status !== 'OPEN') {
      throw new UnprocessableEntityError('This review request is no longer accepting responses');
    }

    if (invitation.request.deadline && new Date() > invitation.request.deadline) {
      throw new UnprocessableEntityError('This review request has expired');
    }

    // Validate that all required questions are answered
    const questions = invitation.request.questions as any[];
    const requiredQuestions = questions.filter((q) => q.required);

    for (const question of requiredQuestions) {
      if (!responses[question.id]) {
        throw new UnprocessableEntityError(
          `Question "${question.question}" is required`
        );
      }
    }

    // Create submission
    const submission = await prisma.reviewSubmission.create({
      data: {
        requestId: invitation.request.id,
        invitationId: invitation.id,
        reviewerUserId: userId,
        responses: JSON.parse(JSON.stringify(responses)),
        isAnonymous: !userId,
      },
    });

    // Mark invitation as submitted
    await invitationService.markInvitationAsSubmitted(invitation.id);

    // Check if we've reached the minimum threshold and should trigger AI processing
    const submissionCount = await prisma.reviewSubmission.count({
      where: { requestId: invitation.request.id },
    });

    const shouldProcess = submissionCount >= invitation.request.minRespondents;

    // Check if all invitations have been submitted
    const totalInvitations = await prisma.invitation.count({
      where: { requestId: invitation.request.id },
    });

    const allSubmitted = submissionCount === totalInvitations;

    // Send notification about new response
    setImmediate(async () => {
      try {
        await notificationService.notifyResponseReceived(invitation.request.id);

        // Notify when minimum threshold reached
        if (submissionCount === invitation.request.minRespondents) {
          await notificationService.notifyMinRespondentsReached(invitation.request.id);
        }
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    });

    // If minimum reached and all submitted, auto-close and trigger processing
    if (shouldProcess && allSubmitted) {
      await prisma.reviewRequest.update({
        where: { id: invitation.request.id },
        data: {
          status: 'CLOSED',
          closedAt: new Date(),
        },
      });

      // Trigger AI processing asynchronously
      setImmediate(async () => {
        try {
          await aiSynthesisService.processFeedback(invitation.request.id);
          await notificationService.notifyResultsReady(invitation.request.id);
        } catch (error) {
          console.error('Error processing feedback:', error);
        }
      });
    }

    return {
      submissionId: submission.id,
      message: 'Review submitted successfully',
      submittedAt: submission.submittedAt,
    };
  }

  async getSubmissionStats(requestId: string, userId: string) {
    const request = await prisma.reviewRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundError('Review request');
    }

    if (request.userId !== userId) {
      throw new ForbiddenError('You do not have permission to view submission stats');
    }

    const totalInvitations = await prisma.invitation.count({
      where: { requestId },
    });

    const submittedCount = await prisma.reviewSubmission.count({
      where: { requestId },
    });

    const pendingCount = totalInvitations - submittedCount;

    return {
      totalInvitations,
      submitted: submittedCount,
      pending: pendingCount,
      minRespondents: request.minRespondents,
      canClose: submittedCount >= request.minRespondents,
      status: request.status,
    };
  }
}

export default new ReviewSubmissionService();
