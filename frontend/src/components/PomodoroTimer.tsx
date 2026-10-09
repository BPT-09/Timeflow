import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Bell, 
  CheckCircle2, 
  Link2,
  Volume2,
  VolumeX,
  FileText
} from 'lucide-react';
import { Task, TimeLogRequest } from '../types';
import { timeLogApi } from '../services/api';

interface PomodoroTimerProps {
  tasks: Task[];
  selectedTaskId?: number | null;
  onSessionLogged?: () => void;
}

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

const TIMER_CONFIG: Record<TimerMode, { label: string; defaultMinutes: number; color: string; badgeColor: string }> = {
  work: { label: 'Deep Work', defaultMinutes: 25, color: 'emerald', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  shortBreak: { label: 'Short Break', defaultMinutes: 5, color: 'teal', badgeColor: 'bg-teal-50 text-teal-700 border-teal-200' },
  longBreak: { label: 'Long Break', defaultMinutes: 15, color: 'indigo', badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
};

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  tasks,
  selectedTaskId: initialSelectedTaskId,
  onSessionLogged,
}) => {
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(TIMER_CONFIG.work.defaultMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [attachedTaskId, setAttachedTaskId] = useState<number | null>(initialSelectedTaskId || null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (initialSelectedTaskId) {
      setAttachedTaskId(initialSelectedTaskId);
    }
  }, [initialSelectedTaskId]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Web Audio API synthesized completion chime
  const playAlertSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      // Harmonic chime (A5 -> E6)
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1318.51, audioCtx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  };

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setMode(newMode);
    setTimeLeftSeconds(TIMER_CONFIG[newMode].defaultMinutes * 60);
    setSessionStartTime(null);
  };

  const handleSessionComplete = async () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);

    playAlertSound();

    const endTime = new Date();
    const startTime = sessionStartTime || new Date(endTime.getTime() - TIMER_CONFIG[mode].defaultMinutes * 60 * 1000);
    const durationMinutes = TIMER_CONFIG[mode].defaultMinutes;

    // Auto-post time log to Spring Boot backend if in work mode
    if (mode === 'work') {
      try {
        const logPayload: TimeLogRequest = {
          taskId: attachedTaskId || undefined,
          startTime: startTime.toISOString().replace('Z', ''),
          endTime: endTime.toISOString().replace('Z', ''),
          durationMinutes,
          notes: sessionNotes.trim() || `Pomodoro completed (${durationMinutes} mins)`,
        };

        await timeLogApi.logSession(logPayload);
        setNotificationMessage(`Work session logged! +${durationMinutes} mins added.`);
        if (onSessionLogged) {
          onSessionLogged();
        }
      } catch (err) {
        console.error('Failed to auto-save time log', err);
        setNotificationMessage('Session ended (offline save)');
      }
    } else {
      setNotificationMessage(`${TIMER_CONFIG[mode].label} completed! Ready for focus.`);
    }

    // Auto transition to break or work
    setTimeout(() => {
      if (mode === 'work') {
        switchMode('shortBreak');
      } else {
        switchMode('work');
      }
      setTimeout(() => setNotificationMessage(null), 5000);
    }, 1500);
  };

  // Timer Tick Handler
  useEffect(() => {
    if (isRunning) {
      if (!sessionStartTime) {
        setSessionStartTime(new Date());
      }
      timerRef.current = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, sessionStartTime, attachedTaskId, sessionNotes]);

  const toggleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeftSeconds(TIMER_CONFIG[mode].defaultMinutes * 60);
    setSessionStartTime(null);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const currentTotalSeconds = TIMER_CONFIG[mode].defaultMinutes * 60;
  const progressPercent = ((currentTotalSeconds - timeLeftSeconds) / currentTotalSeconds) * 100;
  const attachedTask = tasks.find((t) => t.id === attachedTaskId);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-xl mx-auto flex flex-col items-center">
      {/* Mode Selector Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl mb-6 w-full max-w-xs justify-between">
        {(Object.keys(TIMER_CONFIG) as TimerMode[]).map((key) => {
          const active = mode === key;
          return (
            <button
              key={key}
              onClick={() => switchMode(key)}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
                active
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {TIMER_CONFIG[key].label}
            </button>
          );
        })}
      </div>

      {/* Notification Toast */}
      {notificationMessage && (
        <div className="mb-4 px-4 py-2 bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs font-medium rounded-lg flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{notificationMessage}</span>
        </div>
      )}

      {/* Circular Progress & Clock Face */}
      <div className="relative w-64 h-64 flex items-center justify-center my-2">
        {/* SVG Progress Circle */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="44"
            className="stroke-slate-100"
            strokeWidth="5"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r="44"
            className={`transition-all duration-1000 ease-linear ${
              mode === 'work' ? 'stroke-emerald-500' : mode === 'shortBreak' ? 'stroke-teal-500' : 'stroke-indigo-500'
            }`}
            strokeWidth="5"
            strokeDasharray={2 * Math.PI * 44}
            strokeDashoffset={(2 * Math.PI * 44) * (1 - progressPercent / 100)}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-5xl font-mono font-bold tracking-tight text-slate-800">
            {formatTime(timeLeftSeconds)}
          </span>
          <span className={`text-[11px] font-semibold mt-2 px-2.5 py-0.5 rounded-full border ${TIMER_CONFIG[mode].badgeColor}`}>
            {isRunning ? 'FOCUSING' : 'READY'}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-4 mt-6">
        <button
          onClick={resetTimer}
          title="Reset Timer"
          className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={toggleStartPause}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-md transition ${
            isRunning
              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4 fill-white" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              Start Focus
            </>
          )}
        </button>

        <button
          onClick={() => handleSessionComplete()}
          title="Skip / Finish Early"
          className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition shadow-sm"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? 'Mute Alert Sound' : 'Enable Alert Sound'}
          className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition shadow-sm"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
        </button>
      </div>

      {/* Task Attachment & Notes Section */}
      <div className="w-full mt-8 pt-6 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 uppercase tracking-wider">
            <Link2 className="w-3.5 h-3.5 text-emerald-600" />
            Attach to Task
          </label>
          {attachedTask && (
            <span className="text-[11px] text-emerald-600 font-medium">
              Logged: {attachedTask.actualTimeLoggedMinutes}m / Est: {attachedTask.estimatedTimeMinutes}m
            </span>
          )}
        </div>

        <select
          value={attachedTaskId || ''}
          onChange={(e) => setAttachedTaskId(e.target.value ? Number(e.target.value) : null)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">No task attached (General Time Log)</option>
          {tasks.map((task) => (
            <option key={task.id} value={task.id}>
              [{task.category}] {task.title} {task.completed ? '✓' : ''}
            </option>
          ))}
        </select>

        <div>
          <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 uppercase tracking-wider mb-1">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            Session Notes (Optional)
          </label>
          <input
            type="text"
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            placeholder="What will you accomplish during this session?"
            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </div>
      </div>
    </div>
  );
};
