export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Question {
  id: string;
  question: string;
  type: 'text' | 'rating' | 'multipleChoice';
  required: boolean;
  options?: string[];
}

export interface ReviewRequest {
  id: string;
  userId: string;
  title: string;
  questions: Question[];
  minRespondents: number;
  deadline: string;
  status: 'draft' | 'active' | 'closed' | 'processing' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface Invitation {
  id: string;
  reviewRequestId: string;
  email?: string;
  userId?: string;
  status: 'pending' | 'completed' | 'expired';
  token: string;
  createdAt: string;
}

export interface Submission {
  id: string;
  reviewRequestId: string;
  invitationId: string;
  responses: Record<string, string>;
  submittedAt: string;
}

export interface AIResult {
  id: string;
  reviewRequestId: string;
  summary: string;
  themes: Array<{
    theme: string;
    description: string;
    frequency: number;
  }>;
  strengths: string[];
  areasForImprovement: string[];
  skillCategories: Record<string, {
    level: string;
    evidence: string[];
  }>;
  sentimentAnalysis: {
    overall: 'positive' | 'neutral' | 'negative' | 'mixed';
    breakdown: Record<string, number>;
  };
  actionableRecommendations: string[];
  processedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
