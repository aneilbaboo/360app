export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
}

export interface Question {
  id: string;
  question: string;
  type: 'text' | 'textarea' | 'rating';
  required: boolean;
}

export interface ReviewRequest {
  id: string;
  userId: string;
  title: string;
  questions: Question[];
  minRespondents: number;
  deadline?: string;
  status: 'open' | 'closed' | 'processing' | 'completed';
  shareableToken: string;
  createdAt: string;
  closedAt?: string;
  _count?: {
    invitations: number;
    submissions: number;
  };
}

export interface CreateReviewRequestData {
  title: string;
  questions: Question[];
  minRespondents: number;
  deadline?: string;
}

export interface Invitation {
  id: string;
  requestId: string;
  inviteeEmail?: string;
  inviteeUserId?: string;
  invitationToken: string;
  status: 'pending' | 'submitted' | 'expired';
  sentAt: string;
  submittedAt?: string;
}

export interface CreateInvitationsData {
  invitations: Array<{
    email?: string;
    userId?: string;
  }>;
}

export interface ReviewSubmissionData {
  invitationToken: string;
  responses: Record<string, string>;
}

export interface AIProcessingResult {
  id: string;
  requestId: string;
  provider: 'claude' | 'openai' | 'perplexity';
  anonymizedSummary: string;
  themes: {
    name: string;
    frequency: number;
    sentiment: 'positive' | 'negative' | 'neutral';
  }[];
  sentimentAnalysis: {
    positive: number;
    negative: number;
    neutral: number;
  };
  skillCategories: {
    category: string;
    score: number;
    feedback: string[];
  }[];
  actionableItems: {
    priority: 'high' | 'medium' | 'low';
    item: string;
    category: string;
  }[];
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  processedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'min_reached' | 'response_received' | 'results_ready' | 'reminder';
  requestId: string;
  message: string;
  read: boolean;
  sentAt: string;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface SubmissionStats {
  totalInvitations: number;
  totalSubmissions: number;
  pendingCount: number;
  submittedCount: number;
  canViewResults: boolean;
  minRespondentsMet: boolean;
}

export interface InvitationValidation {
  valid: boolean;
  request?: {
    id: string;
    title: string;
    questions: Question[];
  };
  invitation?: {
    id: string;
    status: string;
  };
  error?: string;
}
