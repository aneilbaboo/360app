import axios from 'axios';
import type { AuthResponse, ReviewRequest, Invitation, Submission, AIResult, Notification } from '../types';

const API_BASE_URL = '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
          headers: { Authorization: `Bearer ${refreshToken}` }
        });
        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        error.config.headers.Authorization = `Bearer ${accessToken}`;
        return api(error.config);
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

// Auth endpoints
export const authAPI = {
  register: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/register', { email, password }),

  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

// Review Request endpoints
export const reviewRequestAPI = {
  create: (data: Partial<ReviewRequest>) =>
    api.post<ReviewRequest>('/reviews/requests', data),

  list: () =>
    api.get<ReviewRequest[]>('/reviews/requests'),

  get: (id: string) =>
    api.get<ReviewRequest>(`/reviews/requests/${id}`),

  update: (id: string, data: Partial<ReviewRequest>) =>
    api.put<ReviewRequest>(`/reviews/requests/${id}`, data),

  close: (id: string) =>
    api.post(`/reviews/requests/${id}/close`),

  delete: (id: string) =>
    api.delete(`/reviews/requests/${id}`),

  getResults: (id: string) =>
    api.get<AIResult>(`/reviews/requests/${id}/results`),

  getStatus: (id: string) =>
    api.get<{ status: string; progress?: number }>(`/reviews/requests/${id}/status`)
};

// Invitation endpoints
export const invitationAPI = {
  create: (requestId: string, invitations: Array<{ email?: string; userId?: string }>) =>
    api.post<Invitation[]>(`/reviews/requests/${requestId}/invitations`, { invitations }),

  list: (requestId: string) =>
    api.get<Invitation[]>(`/reviews/requests/${requestId}/invitations`),

  validate: (token: string) =>
    api.get<{ reviewRequest: ReviewRequest; invitation: Invitation }>(`/invitations/${token}`)
};

// Submission endpoints
export const submissionAPI = {
  submit: (invitationToken: string, responses: Record<string, string>) =>
    api.post<Submission>('/reviews/submissions', { invitationToken, responses }),

  getStats: (requestId: string) =>
    api.get<{ total: number; completed: number; pending: number }>(`/reviews/submissions/requests/${requestId}/stats`)
};

// Notification endpoints
export const notificationAPI = {
  list: (unreadOnly = false) =>
    api.get<Notification[]>('/notifications', { params: { unreadOnly } }),

  markAsRead: (id: string) =>
    api.put(`/notifications/${id}/read`),

  markAllAsRead: () =>
    api.put('/notifications/read-all')
};

export default api;
