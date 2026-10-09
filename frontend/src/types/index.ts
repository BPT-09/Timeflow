export type TaskCategory = 'WORK' | 'PERSONAL' | 'STUDY';
export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface User {
  id: number;
  username: string;
  email: string;
  role?: string;
  createdAt?: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate?: string;
  estimatedTimeMinutes: number;
  actualTimeLoggedMinutes: number;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskRequest {
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate?: string;
  estimatedTimeMinutes: number;
  completed?: boolean;
}

export interface TimeLog {
  id: number;
  taskId?: number;
  taskTitle?: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  notes?: string;
  createdAt: string;
}

export interface TimeLogRequest {
  taskId?: number;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  notes?: string;
}

export interface AnalyticsSummary {
  totalTasks: number;
  totalTasksCompleted: number;
  totalTasksPending: number;
  productivityScore: number;
  totalHoursLoggedToday: number;
  totalHoursLoggedThisWeek: number;
  totalHoursLoggedAllTime: number;
  categoryTaskCounts: Record<string, number>;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
}
