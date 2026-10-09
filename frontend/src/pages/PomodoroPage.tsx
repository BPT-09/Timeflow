import React, { useState, useEffect } from 'react';
import { Timer, CheckCircle, Clock, BookOpen, Briefcase, User as UserIcon } from 'lucide-react';
import { Task, TimeLog } from '../types';
import { taskApi, timeLogApi } from '../services/api';
import { PomodoroTimer } from '../components/PomodoroTimer';

interface PomodoroPageProps {
  initialTaskId?: number | null;
}

export const PomodoroPage: React.FC<PomodoroPageProps> = ({ initialTaskId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(initialTaskId || null);

  const loadData = async () => {
    try {
      const [fetchedTasks, fetchedLogs] = await Promise.all([
        taskApi.getAll({ completed: false }),
        timeLogApi.getAll(),
      ]);
      setTasks(fetchedTasks);
      setTimeLogs(fetchedLogs);
    } catch (err) {
      console.error('Failed to load Pomodoro page data', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div className="text-center max-w-lg mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Pomodoro Focus Timer</h2>
        <p className="text-xs text-slate-500 mt-1">
          Work in structured 25-minute sprints. Sessions automatically persist to your Spring Boot backend database.
        </p>
      </div>

      {/* The Central Timer Widget */}
      <PomodoroTimer
        tasks={tasks}
        selectedTaskId={selectedTaskId}
        onSessionLogged={loadData}
      />

      {/* Session History & Tasks to link */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Active Tasks Queue */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h4 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            Queued Tasks for Focus
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => setSelectedTaskId(task.id)}
                className={`w-full text-left p-3 rounded-xl border text-xs transition flex items-center justify-between ${
                  selectedTaskId === task.id
                    ? 'border-emerald-500 bg-emerald-50/60 font-semibold text-emerald-900'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="truncate mr-2">
                  <span className="font-medium">[{task.category}] {task.title}</span>
                  <p className="text-[10px] text-slate-400 font-normal">
                    {task.actualTimeLoggedMinutes}m logged / {task.estimatedTimeMinutes}m estimate
                  </p>
                </div>
                {selectedTaskId === task.id && (
                  <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                    ACTIVE
                  </span>
                )}
              </button>
            ))}

            {tasks.length === 0 && (
              <div className="py-8 text-center text-slate-400 text-xs">
                No active tasks found. All caught up!
              </div>
            )}
          </div>
        </div>

        {/* Recent Session Logs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h4 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            Logged Sessions Today
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {timeLogs.map((log) => (
              <div key={log.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-800">{log.taskTitle || 'General Focus Session'}</p>
                  <p className="text-[10px] text-slate-400">{log.notes || 'Completed focus session'}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-600">+{log.durationMinutes}m</span>
                  <p className="text-[10px] text-slate-400">{new Date(log.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))}

            {timeLogs.length === 0 && (
              <div className="py-8 text-center text-slate-400 text-xs">
                No sessions completed yet. Start the timer to record!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
