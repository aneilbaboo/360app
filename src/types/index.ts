import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface TokenPayload {
  userId: string;
  email: string;
}

export interface AIProviderConfig {
  name: 'claude' | 'openai' | 'perplexity';
  apiKey: string;
  endpoint: string;
  model: string;
}

export interface FeedbackSynthesisResult {
  anonymizedSummary: string;
  themes: {
    [theme: string]: {
      frequency: number;
      examples: string[];
    };
  };
  sentimentAnalysis: {
    positive: number;
    negative: number;
    neutral: number;
    distribution: {
      [sentiment: string]: number;
    };
  };
  skillCategories: {
    leadership: string[];
    communication: string[];
    technical: string[];
    collaboration: string[];
    other: string[];
  };
  actionableItems: Array<{
    category: string;
    item: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  strengthsVsImprovements: {
    strengths: string[];
    improvements: string[];
  };
}

export interface ReviewQuestion {
  id: string;
  question: string;
  type: 'text' | 'rating' | 'multipleChoice';
  required: boolean;
  options?: string[];
}

export interface ReviewResponses {
  [questionId: string]: string | number;
}
