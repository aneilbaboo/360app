import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type {
  User,
  AuthTokens,
  LoginCredentials,
  RegisterData,
  ReviewRequest,
  CreateReviewRequestData,
  Invitation,
  CreateInvitationsData,
  ReviewSubmissionData,
  AIProcessingResult,
  Notification,
  ApiError,
  SubmissionStats,
  InvitationValidation,
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post<AuthTokens>(
          `${API_BASE_URL}/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: async (data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Review Requests API
export const reviewRequestsApi = {
  create: async (data: CreateReviewRequestData): Promise<ReviewRequest> => {
    const response = await api.post('/reviews/requests', data);
    return response.data;
  },

  list: async (): Promise<ReviewRequest[]> => {
    const response = await api.get('/reviews/requests');
    return response.data;
  },

  get: async (id: string): Promise<ReviewRequest> => {
    const response = await api.get(`/reviews/requests/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateReviewRequestData>): Promise<ReviewRequest> => {
    const response = await api.put(`/reviews/requests/${id}`, data);
    return response.data;
  },

  close: async (id: string): Promise<ReviewRequest> => {
    const response = await api.post(`/reviews/requests/${id}/close`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/reviews/requests/${id}`);
  },
};

// Invitations API
export const invitationsApi = {
  create: async (requestId: string, data: CreateInvitationsData): Promise<Invitation[]> => {
    const response = await api.post(`/reviews/requests/${requestId}/invitations`, data);
    return response.data;
  },

  list: async (requestId: string): Promise<Invitation[]> => {
    const response = await api.get(`/reviews/requests/${requestId}/invitations`);
    return response.data;
  },

  validate: async (token: string): Promise<InvitationValidation> => {
    const response = await api.get(`/invitations/${token}`);
    return response.data;
  },
};

// Review Submissions API
export const reviewSubmissionsApi = {
  submit: async (data: ReviewSubmissionData): Promise<void> => {
    await api.post('/reviews/submissions', data);
  },

  getStats: async (requestId: string): Promise<SubmissionStats> => {
    const response = await api.get(`/reviews/submissions/requests/${requestId}/stats`);
    return response.data;
  },
};

// Results API
export const resultsApi = {
  get: async (requestId: string): Promise<AIProcessingResult> => {
    const response = await api.get(`/reviews/requests/${requestId}/results`);
    return response.data;
  },

  getStatus: async (requestId: string): Promise<{ status: string; canView: boolean }> => {
    const response = await api.get(`/reviews/requests/${requestId}/status`);
    return response.data;
  },
};

// Notifications API
export const notificationsApi = {
  list: async (unreadOnly = false): Promise<Notification[]> => {
    const response = await api.get('/notifications', {
      params: { unreadOnly },
    });
    return response.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    await api.put(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.put('/notifications/read-all');
  },
};

export default api;
