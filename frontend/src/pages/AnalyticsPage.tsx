import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Calendar, 
  PieChart, 
  Award,
  Zap
} from 'lucide-react';
import { AnalyticsSummary, TimeLog } from '../types';
import { analyticsApi, timeLogApi } from '../services/api';

export const AnalyticsPage: React.FC = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [sumRes, logsRes] = await Promise.all([
          analyticsApi.getSummary(),
          timeLogApi.getAll(),
        ]);
        setSummary(sumRes);
        setTimeLogs(logsRes);
      } catch (err) {
        console.error('Failed to load analytics data', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalCatCount = summary?.categoryTaskCounts
    ? Object.values(summary.categoryTaskCounts).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Time & Productivity Analytics</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time metrics calculated from your Spring Boot database logs.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Productivity Score</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{summary?.productivityScore ?? 0}%</div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, summary?.productivityScore ?? 0)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Hours Logged Today</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {summary?.totalHoursLoggedToday ?? 0}
            <span className="text-sm font-normal text-slate-400 ml-1">hrs</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Target: 4.0 hrs focus / day</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Hours This Week</span>
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {summary?.totalHoursLoggedThisWeek ?? 0}
            <span className="text-sm font-normal text-slate-400 ml-1">hrs</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Target: 20.0 hrs / week</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed Tasks</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {summary?.totalTasksCompleted ?? 0}
            <span className="text-sm font-normal text-slate-400 ml-1">/ {summary?.totalTasks ?? 0}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">{summary?.totalTasksPending ?? 0} remaining pending</p>
        </div>
      </div>

      {/* Breakdown Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-600" />
            Task Distribution by Category
          </h3>

          <div className="space-y-3 pt-2">
            {['WORK', 'PERSONAL', 'STUDY'].map((cat) => {
              const count = summary?.categoryTaskCounts?.[cat] ?? 0;
              const percent = totalCatCount > 0 ? Math.round((count / totalCatCount) * 100) : 0;
              const color =
                cat === 'WORK' ? 'bg-blue-500' : cat === 'STUDY' ? 'bg-purple-500' : 'bg-amber-500';

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600 font-medium">
                    <span>{cat}</span>
                    <span>{count} tasks ({percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`${color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Productivity Badge & Insights */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-emerald-600" />
              Focus Achievement
            </h3>
            <p className="text-xs text-slate-500">
              Consistency builds momentum. Your overall time logged across all completed sessions is{' '}
              <strong className="text-slate-800 font-semibold">{summary?.totalHoursLoggedAllTime ?? 0} hours</strong>.
            </p>
          </div>

          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-900">Keep up the deep focus!</h4>
              <p className="text-[11px] text-emerald-700">
                Completing 4 Pomodoros (100 mins) daily dramatically improves retention and execution speed.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-sm text-slate-800">All Logged Pomodoro & Focus Sessions</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-5 py-3">Task</th>
                <th className="px-5 py-3">Duration</th>
                <th className="px-5 py-3">Notes</th>
                <th className="px-5 py-3">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {timeLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-5 py-3.5 font-medium text-slate-800">
                    {log.taskTitle || <span className="text-slate-400 italic">General Session</span>}
                  </td>
                  <td className="px-5 py-3.5 font-mono font-bold text-emerald-600">
                    +{log.durationMinutes} mins
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">
                    {log.notes || '—'}
                  </td>
                  <td className="px-5 py-3.5 text-slate-400">
                    {new Date(log.startTime).toLocaleString()}
                  </td>
                </tr>
              ))}

              {timeLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                    No time logs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
