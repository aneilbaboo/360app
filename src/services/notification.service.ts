import prisma from '../utils/db';
import nodemailer from 'nodemailer';

export class NotificationService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    if (process.env.EMAIL_PROVIDER === 'sendgrid' && process.env.SENDGRID_API_KEY) {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY,
        },
      });
    } else {
      console.warn('Email transporter not configured. Notifications will only be stored in database.');
    }
  }

  async notifyMinRespondentsReached(requestId: string) {
    const request = await prisma.reviewRequest.findUnique({
      where: { id: requestId },
      include: {
        user: true,
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    if (!request) return;

    const message = `Your review request "${request.title}" has reached the minimum ${request.minRespondents} respondents. You can now close the request to view results.`;

    await this.createNotification(
      request.userId,
      'MIN_REACHED',
      requestId,
      message
    );

    await this.sendEmail(
      request.user.email,
      'Minimum Responses Reached',
      message,
      `
        <h2>Minimum Responses Reached</h2>
        <p>${message}</p>
        <p>Current responses: ${request._count.submissions}</p>
        <p><a href="${process.env.FRONTEND_URL}/reviews/${requestId}">View Review Request</a></p>
      `
    );
  }

  async notifyResponseReceived(requestId: string) {
    const request = await prisma.reviewRequest.findUnique({
      where: { id: requestId },
      include: {
        user: true,
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    if (!request) return;

    const message = `A new response has been submitted for "${request.title}". Total responses: ${request._count.submissions}`;

    await this.createNotification(
      request.userId,
      'RESPONSE_RECEIVED',
      requestId,
      message
    );

    // Only send email every 5 responses to avoid spam
    if (request._count.submissions % 5 === 0) {
      await this.sendEmail(
        request.user.email,
        'New Responses Received',
        message,
        `
          <h2>New Responses Received</h2>
          <p>${message}</p>
          <p><a href="${process.env.FRONTEND_URL}/reviews/${requestId}">View Review Request</a></p>
        `
      );
    }
  }

  async notifyResultsReady(requestId: string) {
    const request = await prisma.reviewRequest.findUnique({
      where: { id: requestId },
      include: {
        user: true,
      },
    });

    if (!request) return;

    const message = `Your 360 review results for "${request.title}" are ready to view!`;

    await this.createNotification(
      request.userId,
      'RESULTS_READY',
      requestId,
      message
    );

    await this.sendEmail(
      request.user.email,
      '360 Review Results Ready',
      message,
      `
        <h2>Your Results Are Ready!</h2>
        <p>${message}</p>
        <p>AI has analyzed all responses and generated your comprehensive feedback report.</p>
        <p><a href="${process.env.FRONTEND_URL}/reviews/${requestId}/results">View Your Results</a></p>
      `
    );
  }

  async sendInvitationReminder(invitationId: string) {
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
      include: {
        request: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!invitation || !invitation.inviteeEmail) return;

    const message = `Reminder: You have been invited to provide feedback for "${invitation.request.title}"`;

    const invitationUrl = `${process.env.FRONTEND_URL}/review/${invitation.invitationToken}`;

    await this.sendEmail(
      invitation.inviteeEmail,
      'Reminder: Feedback Request',
      message,
      `
        <h2>Feedback Reminder</h2>
        <p>${invitation.request.user.email} is requesting your feedback.</p>
        <p>Review: ${invitation.request.title}</p>
        ${invitation.request.deadline ? `<p>Deadline: ${invitation.request.deadline.toDateString()}</p>` : ''}
        <p><a href="${invitationUrl}">Provide Feedback</a></p>
      `
    );
  }

  async sendInvitationEmail(invitationId: string) {
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
      include: {
        request: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!invitation || !invitation.inviteeEmail) return;

    const invitationUrl = `${process.env.FRONTEND_URL}/review/${invitation.invitationToken}`;

    await this.sendEmail(
      invitation.inviteeEmail,
      '360 Feedback Request',
      `You have been invited to provide feedback for "${invitation.request.title}"`,
      `
        <h2>You've Been Invited to Provide Feedback</h2>
        <p>${invitation.request.user.email} is requesting your honest feedback.</p>
        <p><strong>Review:</strong> ${invitation.request.title}</p>
        ${invitation.request.deadline ? `<p><strong>Deadline:</strong> ${invitation.request.deadline.toDateString()}</p>` : ''}
        <p>Your responses will be anonymized and combined with others to provide constructive insights.</p>
        <p><a href="${invitationUrl}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Provide Feedback</a></p>
      `
    );
  }

  private async createNotification(
    userId: string,
    type: 'MIN_REACHED' | 'RESPONSE_RECEIVED' | 'RESULTS_READY' | 'REMINDER',
    requestId: string,
    message: string
  ) {
    await prisma.notification.create({
      data: {
        userId,
        type,
        requestId,
        message,
      },
    });
  }

  private async sendEmail(
    to: string,
    subject: string,
    textContent: string,
    htmlContent: string
  ) {
    if (!this.transporter) {
      console.log('Email not sent (no transporter configured):', { to, subject });
      return;
    }

    try {
      await this.transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || '360 Review'}" <${process.env.EMAIL_FROM || 'noreply@360review.com'}>`,
        to,
        subject,
        text: textContent,
        html: htmlContent,
      });

      console.log('Email sent successfully:', { to, subject });
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  async getUserNotifications(userId: string, unreadOnly: boolean = false) {
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly && { read: false }),
      },
      orderBy: { sentAt: 'desc' },
      take: 50,
    });

    return notifications;
  }

  async markNotificationAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      throw new Error('Notification not found');
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }
}

export default new NotificationService();
