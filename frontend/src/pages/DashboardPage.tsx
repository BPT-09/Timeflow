import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Percent, 
  Clock, 
  Calendar, 
  Flame, 
  ArrowRight, 
  Play,
  Briefcase,
  BookOpen,
  User as UserIcon
} from 'lucide-react';
import { Task, TimeLog, AnalyticsSummary } from '../types';
import { taskApi, timeLogApi, analyticsApi } from '../services/api';
import { PomodoroTimer } from '../components/PomodoroTimer';

interface DashboardPageProps {
  onNavigateToTasks: () => void;
  onStartPomodoroForTask: (taskId: number) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateToTasks,
  onStartPomodoroForTask,
}) => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [recentLogs, setRecentLogs] = useState<TimeLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [sumRes, tasksRes, logsRes] = await Promise.all([
        analyticsApi.getSummary(),
        taskApi.getAll(),
        timeLogApi.getAll(),
      ]);
      setSummary(sumRes);
      setTasks(tasksRes);
      setRecentLogs(logsRes.slice(0, 5));
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'WORK':
        return <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200"><Briefcase className="w-2.5 h-2.5" /> Work</span>;
      case 'STUDY':
        return <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200"><BookOpen className="w-2.5 h-2.5" /> Study</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200"><UserIcon className="w-2.5 h-2.5" /> Personal</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">HIGH</span>;
      case 'MEDIUM':
        return <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">MED</span>;
      default:
        return <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">LOW</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 4 Core Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Tasks Completed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Tasks</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {summary?.totalTasksCompleted ?? 0}
              <span className="text-xs font-normal text-slate-400 ml-1.5">/ {summary?.totalTasks ?? 0} tasks</span>
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Productivity Score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Productivity Score</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {summary?.productivityScore ?? 0}%
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Percent className="w-6 h-6" />
          </div>
        </div>

        {/* Total Hours Logged Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Logged Today</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {summary?.totalHoursLoggedToday ?? 0}
              <span className="text-xs font-normal text-slate-400 ml-1">hrs</span>
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Total Hours Logged This Week */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Logged This Week</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {summary?.totalHoursLoggedThisWeek ?? 0}
              <span className="text-xs font-normal text-slate-400 ml-1">hrs</span>
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Pomodoro & High-Priority Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Pomodoro Focus Widget */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Flame className="w-4 h-4 text-emerald-600" />
              Focus Zone
            </h3>
            <span className="text-xs text-slate-400">Synced to REST API</span>
          </div>
          <PomodoroTimer tasks={tasks} onSessionLogged={loadData} />
        </div>

        {/* Right Column: Active Tasks & Recent Logs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Tasks Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-800">Active Tasks</h3>
                <p className="text-xs text-slate-500">Focus on what matters most today</p>
              </div>
              <button
                onClick={onNavigateToTasks}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition"
              >
                View all ({tasks.length}) <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {tasks.filter((t) => !t.completed).slice(0, 4).map((task) => (
                <div key={task.id} className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/60 px-2 rounded-lg transition">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getCategoryBadge(task.category)}
                      {getPriorityBadge(task.priority)}
                    </div>
                    <p className="text-sm font-semibold text-slate-800 truncate">{task.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Progress: {task.actualTimeLoggedMinutes}m / {task.estimatedTimeMinutes}m
                    </p>
                  </div>

                  <button
                    onClick={() => onStartPomodoroForTask(task.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition"
                    title="Start Pomodoro for this task"
                  >
                    <Play className="w-3 h-3 fill-emerald-600" />
                    Focus
                  </button>
                </div>
              ))}

              {tasks.filter((t) => !t.completed).length === 0 && (
                <div className="py-8 text-center text-slate-400 text-xs">
                  All tasks completed! Great job.
                </div>
              )}
            </div>
          </div>

          {/* Recent Time Tracking Activity */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">Recent Sessions Logged</h3>
              <span className="text-xs text-slate-400">{recentLogs.length} recent sessions</span>
            </div>

            <div className="mt-3 space-y-2.5">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <div>
                      <p className="font-semibold text-slate-700">{log.taskTitle || 'General Focus Session'}</p>
                      <p className="text-[10px] text-slate-400">{log.notes || 'No session notes'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-600">+{log.durationMinutes}m</span>
                    <p className="text-[10px] text-slate-400">{new Date(log.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}

              {recentLogs.length === 0 && (
                <div className="py-6 text-center text-slate-400 text-xs">
                  No sessions logged yet today. Hit Start Focus above to log your first session!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
