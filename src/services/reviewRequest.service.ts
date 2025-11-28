import { v4 as uuidv4 } from 'uuid';
import prisma from '../utils/db';
import { NotFoundError, ForbiddenError, ValidationError, UnprocessableEntityError } from '../utils/errors';
import { ReviewQuestion } from '../types';
import aiSynthesisService from './ai/synthesis.service';
import notificationService from './notification.service';

export class ReviewRequestService {
  async createReviewRequest(
    userId: string,
    title: string,
    questions: ReviewQuestion[],
    minRespondents: number = 10,
    deadline?: Date
  ) {
    const reviewRequest = await prisma.reviewRequest.create({
      data: {
        userId,
        title,
        questions: JSON.parse(JSON.stringify(questions)),
        minRespondents,
        deadline,
        shareableToken: uuidv4(),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return reviewRequest;
  }

  async listUserReviewRequests(userId: string) {
    const requests = await prisma.reviewRequest.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            invitations: true,
            submissions: true,
          },
        },
        result: {
          select: {
            processingStatus: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return requests;
  }

  async getReviewRequest(requestId: string, userId?: string) {
    const request = await prisma.reviewRequest.findUnique({
      where: { id: requestId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        _count: {
          select: {
            invitations: true,
            submissions: true,
          },
        },
        result: {
          select: {
            processingStatus: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundError('Review request');
    }

    // Only the owner can view full details
    if (userId && request.userId !== userId) {
      throw new ForbiddenError('You do not have permission to view this review request');
    }

    return request;
  }

  async updateReviewRequest(
    requestId: string,
    userId: string,
    updates: {
      title?: string;
      questions?: ReviewQuestion[];
      minRespondents?: number;
      deadline?: Date;
    }
  ) {
    const request = await prisma.reviewRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundError('Review request');
    }

    if (request.userId !== userId) {
      throw new ForbiddenError('You do not have permission to update this review request');
    }

    if (request.status !== 'OPEN') {
      throw new UnprocessableEntityError('Cannot update a closed or completed review request');
    }

    const submissionCount = await prisma.reviewSubmission.count({
      where: { requestId },
    });

    if (submissionCount > 0) {
      throw new UnprocessableEntityError(
        'Cannot update review request after submissions have been received'
      );
    }

    const updatedRequest = await prisma.reviewRequest.update({
      where: { id: requestId },
      data: {
        ...(updates.title && { title: updates.title }),
        ...(updates.questions && { questions: JSON.parse(JSON.stringify(updates.questions)) }),
        ...(updates.minRespondents && { minRespondents: updates.minRespondents }),
        ...(updates.deadline !== undefined && { deadline: updates.deadline }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        _count: {
          select: {
            invitations: true,
            submissions: true,
          },
        },
      },
    });

    return updatedRequest;
  }

  async closeReviewRequest(requestId: string, userId: string) {
    const request = await prisma.reviewRequest.findUnique({
      where: { id: requestId },
      include: {
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundError('Review request');
    }

    if (request.userId !== userId) {
      throw new ForbiddenError('You do not have permission to close this review request');
    }

    if (request.status !== 'OPEN') {
      throw new UnprocessableEntityError('Review request is already closed');
    }

    if (request._count.submissions < request.minRespondents) {
      throw new UnprocessableEntityError(
        `Cannot close review request with fewer than ${request.minRespondents} responses`
      );
    }

    const updatedRequest = await prisma.reviewRequest.update({
      where: { id: requestId },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
      },
    });

    // Trigger AI processing asynchronously
    setImmediate(async () => {
      try {
        await aiSynthesisService.processFeedback(requestId);
        await notificationService.notifyResultsReady(requestId);
      } catch (error) {
        console.error('Error processing feedback:', error);
      }
    });

    return updatedRequest;
  }

  async deleteReviewRequest(requestId: string, userId: string) {
    const request = await prisma.reviewRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundError('Review request');
    }

    if (request.userId !== userId) {
      throw new ForbiddenError('You do not have permission to delete this review request');
    }

    await prisma.reviewRequest.delete({
      where: { id: requestId },
    });

    return { message: 'Review request deleted successfully' };
  }

  async getReviewRequestByToken(token: string) {
    const request = await prisma.reviewRequest.findUnique({
      where: { shareableToken: token },
      select: {
        id: true,
        title: true,
        questions: true,
        status: true,
        deadline: true,
      },
    });

    if (!request) {
      throw new NotFoundError('Review request');
    }

    if (request.status !== 'OPEN') {
      throw new UnprocessableEntityError('This review request is no longer accepting responses');
    }

    if (request.deadline && new Date() > request.deadline) {
      throw new UnprocessableEntityError('This review request has expired');
    }

    return request;
  }
}

export default new ReviewRequestService();
