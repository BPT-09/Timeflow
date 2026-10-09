import React from 'react';
import { Plus, Play, Sparkles } from 'lucide-react';

interface NavbarProps {
  title: string;
  onOpenCreateTask?: () => void;
  onQuickStartTimer?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ title, onOpenCreateTask, onQuickStartTimer }) => {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 px-8 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center gap-3">
        {onQuickStartTimer && (
          <button
            onClick={onQuickStartTimer}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-emerald-500/30 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold transition shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
            Quick Pomodoro
          </button>
        )}

        {onOpenCreateTask && (
          <button
            onClick={onOpenCreateTask}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm shadow-emerald-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        )}
      </div>
    </header>
  );
};
