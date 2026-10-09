import axios from 'axios';
import { Task, TaskRequest, TimeLog, TimeLogRequest, AnalyticsSummary, AuthResponse, TaskCategory, TaskPriority } from '../types';

const API_BASE_URL = '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Bearer token from localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('tm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for session expiry handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('tm_token');
        localStorage.removeItem('tm_user');
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  signup: async (data: { username: string; email: string; password: string }): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/signup', data);
    return res.data;
  },
  login: async (data: { username: string; password: string }): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', data);
    return res.data;
  },
  getCurrentUser: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },
};

export const taskApi = {
  getAll: async (params?: { category?: TaskCategory; priority?: TaskPriority; completed?: boolean }): Promise<Task[]> => {
    const res = await apiClient.get<Task[]>('/tasks', { params });
    return res.data;
  },
  getById: async (id: number): Promise<Task> => {
    const res = await apiClient.get<Task>(`/tasks/${id}`);
    return res.data;
  },
  create: async (data: TaskRequest): Promise<Task> => {
    const res = await apiClient.post<Task>('/tasks', data);
    return res.data;
  },
  update: async (id: number, data: TaskRequest): Promise<Task> => {
    const res = await apiClient.put<Task>(`/tasks/${id}`, data);
    return res.data;
  },
  toggleComplete: async (id: number): Promise<Task> => {
    const res = await apiClient.patch<Task>(`/tasks/${id}/toggle-complete`);
    return res.data;
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },
};

export const timeLogApi = {
  logSession: async (data: TimeLogRequest): Promise<TimeLog> => {
    const res = await apiClient.post<TimeLog>('/timelogs', data);
    return res.data;
  },
  getAll: async (): Promise<TimeLog[]> => {
    const res = await apiClient.get<TimeLog[]>('/timelogs');
    return res.data;
  },
  getByTaskId: async (taskId: number): Promise<TimeLog[]> => {
    const res = await apiClient.get<TimeLog[]>(`/timelogs/task/${taskId}`);
    return res.data;
  },
};

export const analyticsApi = {
  getSummary: async (): Promise<AnalyticsSummary> => {
    const res = await apiClient.get<AnalyticsSummary>('/analytics/summary');
    return res.data;
  },
};

export default apiClient;
