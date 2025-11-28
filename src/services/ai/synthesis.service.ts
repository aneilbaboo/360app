import prisma from '../../utils/db';
import { createAIProvider } from './providers';
import { ServiceUnavailableError, NotFoundError, ForbiddenError } from '../../utils/errors';

export class AISynthesisService {
  private maxRetries = 3;
  private retryDelay = 2000; // 2 seconds initial delay

  async processFeedback(requestId: string) {
    const request = await prisma.reviewRequest.findUnique({
      where: { id: requestId },
      include: {
        submissions: {
          select: {
            responses: true,
          },
        },
        questions: true,
      },
    });

    if (!request) {
      throw new NotFoundError('Review request');
    }

    const provider = process.env.AI_PROVIDER as 'claude' | 'openai' | 'perplexity' || 'claude';

    // Create or update processing result
    let processingResult = await prisma.aIProcessingResult.findUnique({
      where: { requestId },
    });

    if (!processingResult) {
      processingResult = await prisma.aIProcessingResult.create({
        data: {
          requestId,
          provider: provider.toUpperCase() as any,
          anonymizedSummary: '',
          themes: {},
          sentimentAnalysis: {},
          skillCategories: {},
          actionableItems: [],
          processingStatus: 'PROCESSING',
        },
      });
    } else {
      await prisma.aIProcessingResult.update({
        where: { id: processingResult.id },
        data: {
          processingStatus: 'PROCESSING',
        },
      });
    }

    // Update review request status
    await prisma.reviewRequest.update({
      where: { id: requestId },
      data: { status: 'PROCESSING' },
    });

    try {
      // Prepare responses for AI processing
      const questions = request.questions as any[];
      const allResponses = [];

      for (const submission of request.submissions) {
        const responses = submission.responses as any;
        for (const question of questions) {
          if (responses[question.id]) {
            allResponses.push({
              questionId: question.id,
              question: question.question,
              answer: responses[question.id].toString(),
            });
          }
        }
      }

      // Process with retry logic
      const result = await this.processWithRetry(provider, allResponses, processingResult.id);

      // Update processing result
      await prisma.aIProcessingResult.update({
        where: { id: processingResult.id },
        data: {
          anonymizedSummary: result.anonymizedSummary,
          themes: JSON.parse(JSON.stringify(result.themes)),
          sentimentAnalysis: JSON.parse(JSON.stringify(result.sentimentAnalysis)),
          skillCategories: JSON.parse(JSON.stringify(result.skillCategories)),
          actionableItems: JSON.parse(JSON.stringify(result.actionableItems)),
          processingStatus: 'COMPLETED',
          processedAt: new Date(),
        },
      });

      // Update review request status
      await prisma.reviewRequest.update({
        where: { id: requestId },
        data: { status: 'COMPLETED' },
      });

      // TODO: Send notification to requester

      return result;
    } catch (error) {
      console.error('AI processing failed:', error);

      await prisma.aIProcessingResult.update({
        where: { id: processingResult.id },
        data: {
          processingStatus: 'FAILED',
          retryCount: processingResult.retryCount + 1,
        },
      });

      throw new ServiceUnavailableError('AI processing failed. Please try again later.');
    }
  }

  private async processWithRetry(
    providerName: 'claude' | 'openai' | 'perplexity',
    responses: Array<{ questionId: string; question: string; answer: string }>,
    processingResultId: string,
    attempt: number = 0
  ): Promise<any> {
    try {
      const provider = createAIProvider(providerName);
      const result = await provider.synthesizeFeedback(responses);
      return result;
    } catch (error) {
      if (attempt < this.maxRetries) {
        console.log(`Retry attempt ${attempt + 1} of ${this.maxRetries}`);

        // Update retry count
        await prisma.aIProcessingResult.update({
          where: { id: processingResultId },
          data: {
            retryCount: attempt + 1,
          },
        });

        // Exponential backoff
        const delay = this.retryDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));

        return this.processWithRetry(providerName, responses, processingResultId, attempt + 1);
      }

      throw error;
    }
  }

  async getResults(requestId: string, userId: string) {
    const request = await prisma.reviewRequest.findUnique({
      where: { id: requestId },
      include: {
        result: true,
        _count: {
          select: {
            submissions: true,
            invitations: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundError('Review request');
    }

    if (request.userId !== userId) {
      throw new ForbiddenError('You do not have permission to view these results');
    }

    // Check if results are available
    if (request.status !== 'COMPLETED') {
      return {
        available: false,
        status: request.status,
        message: this.getStatusMessage(request.status, request._count),
      };
    }

    if (!request.result || request.result.processingStatus !== 'COMPLETED') {
      return {
        available: false,
        status: 'PROCESSING',
        message: 'Results are being processed',
      };
    }

    return {
      available: true,
      result: {
        anonymizedSummary: request.result.anonymizedSummary,
        themes: request.result.themes,
        sentimentAnalysis: request.result.sentimentAnalysis,
        skillCategories: request.result.skillCategories,
        actionableItems: request.result.actionableItems,
        strengthsVsImprovements: (request.result.actionableItems as any).strengthsVsImprovements || {
          strengths: [],
          improvements: [],
        },
      },
    };
  }

  private getStatusMessage(status: string, counts: any): string {
    if (status === 'OPEN') {
      return `Waiting for more responses. ${counts.submissions} of ${counts.invitations} submitted.`;
    }
    if (status === 'PROCESSING') {
      return 'AI is analyzing your feedback. This may take a minute.';
    }
    if (status === 'CLOSED') {
      return 'Review is closed but not yet processed.';
    }
    return 'Results not available';
  }
}

export default new AISynthesisService();
