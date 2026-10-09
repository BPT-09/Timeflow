import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { TasksPage } from './pages/TasksPage';
import { PomodoroPage } from './pages/PomodoroPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { TaskModal } from './components/TaskModal';
import { taskApi } from './services/api';
import { TaskRequest } from './types';

const MainApp: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'tasks' | 'pomodoro' | 'analytics'>('dashboard');
  const [pomodoroSelectedTaskId, setPomodoroSelectedTaskId] = useState<number | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400 text-sm">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading TimeFlow...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return authView === 'login' ? (
      <LoginPage onSwitchToSignup={() => setAuthView('signup')} />
    ) : (
      <SignupPage onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  const handleStartPomodoroForTask = (taskId: number) => {
    setPomodoroSelectedTaskId(taskId);
    setCurrentTab('pomodoro');
  };

  const handleCreateTask = async (data: TaskRequest) => {
    await taskApi.create(data);
  };

  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Overview Dashboard';
      case 'tasks':
        return 'Task Management Board';
      case 'pomodoro':
        return 'Pomodoro Focus Timer';
      case 'analytics':
        return 'Time Tracking Analytics';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Fixed Sidebar */}
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Navbar
          title={getPageTitle()}
          onOpenCreateTask={() => setIsTaskModalOpen(true)}
          onQuickStartTimer={() => {
            setPomodoroSelectedTaskId(null);
            setCurrentTab('pomodoro');
          }}
        />

        <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardPage
              onNavigateToTasks={() => setCurrentTab('tasks')}
              onStartPomodoroForTask={handleStartPomodoroForTask}
            />
          )}

          {currentTab === 'tasks' && (
            <TasksPage onStartPomodoroForTask={handleStartPomodoroForTask} />
          )}

          {currentTab === 'pomodoro' && (
            <PomodoroPage initialTaskId={pomodoroSelectedTaskId} />
          )}

          {currentTab === 'analytics' && <AnalyticsPage />}
        </main>
      </div>

      {/* Quick Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
