import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  LayoutGrid, 
  List as ListIcon, 
  Play, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Clock, 
  Briefcase, 
  BookOpen, 
  User as UserIcon,
  Check
} from 'lucide-react';
import { Task, TaskCategory, TaskPriority, TaskRequest } from '../types';
import { taskApi } from '../services/api';
import { TaskModal } from '../components/TaskModal';

interface TasksPageProps {
  onStartPomodoroForTask: (taskId: number) => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({ onStartPomodoroForTask }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (categoryFilter !== 'ALL') params.category = categoryFilter as TaskCategory;
      if (priorityFilter !== 'ALL') params.priority = priorityFilter as TaskPriority;
      if (statusFilter === 'COMPLETED') params.completed = true;
      if (statusFilter === 'PENDING') params.completed = false;

      const data = await taskApi.getAll(params);
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [categoryFilter, priorityFilter, statusFilter]);

  const handleCreateOrUpdate = async (data: TaskRequest, id?: number) => {
    if (id) {
      await taskApi.update(id, data);
    } else {
      await taskApi.create(data);
    }
    fetchTasks();
  };

  const handleToggleComplete = async (id: number) => {
    try {
      await taskApi.toggleComplete(id);
      fetchTasks();
    } catch (err) {
      console.error('Failed to toggle completion', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskApi.delete(id);
        fetchTasks();
      } catch (err) {
        console.error('Failed to delete task', err);
      }
    }
  };

  // Filter with live search
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

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

  // Kanban groupings: To Do (0 mins logged, incomplete), In Progress (>0 mins logged, incomplete), Completed
  const kanbanColumns = [
    {
      id: 'todo',
      title: 'To Do',
      tasks: filteredTasks.filter((t) => !t.completed && (t.actualTimeLoggedMinutes === 0 || t.actualTimeLoggedMinutes == null)),
      accent: 'border-slate-300',
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      tasks: filteredTasks.filter((t) => !t.completed && t.actualTimeLoggedMinutes > 0),
      accent: 'border-amber-400',
    },
    {
      id: 'completed',
      title: 'Completed',
      tasks: filteredTasks.filter((t) => t.completed),
      accent: 'border-emerald-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Controls Bar: Search, Filters & View Toggle */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Live search tasks by title or notes..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Categories</option>
            <option value="WORK">Work</option>
            <option value="PERSONAL">Personal</option>
            <option value="STUDY">Study</option>
          </select>

          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('kanban')}
              title="Kanban Board View"
              className={`p-1.5 rounded-md transition ${viewMode === 'kanban' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-400'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              title="List View"
              className={`p-1.5 rounded-md transition ${viewMode === 'list' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-400'}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              setTaskToEdit(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition ml-auto md:ml-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Task
          </button>
        </div>
      </div>

      {/* Task Views */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {kanbanColumns.map((col) => (
            <div key={col.id} className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-4 flex flex-col h-full">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full border-2 ${col.accent}`}></span>
                  <h4 className="font-bold text-slate-800 text-sm">{col.title}</h4>
                </div>
                <span className="text-xs bg-slate-200/80 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                  {col.tasks.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto min-h-[300px]">
                {col.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        {getCategoryBadge(task.category)}
                        {getPriorityBadge(task.priority)}
                      </div>
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                        <button
                          onClick={() => {
                            setTaskToEdit(task);
                            setIsModalOpen(true);
                          }}
                          className="p-1 hover:text-blue-600 text-slate-400 rounded"
                          title="Edit Task"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="p-1 hover:text-rose-600 text-slate-400 rounded"
                          title="Delete Task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h5 className={`font-semibold text-sm text-slate-800 ${task.completed ? 'line-through text-slate-400' : ''}`}>
                      {task.title}
                    </h5>

                    {task.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{task.actualTimeLoggedMinutes}m / {task.estimatedTimeMinutes}m</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleComplete(task.id)}
                          className={`p-1.5 rounded-lg border transition ${
                            task.completed
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                              : 'text-slate-400 hover:text-emerald-600 border-slate-200'
                          }`}
                          title={task.completed ? 'Mark pending' : 'Mark completed'}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>

                        {!task.completed && (
                          <button
                            onClick={() => onStartPomodoroForTask(task.id)}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                            title="Start Pomodoro"
                          >
                            <Play className="w-3.5 h-3.5 fill-emerald-600" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {col.tasks.length === 0 && (
                  <div className="h-32 flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                    No tasks in {col.title}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filteredTasks.map((task) => (
              <div key={task.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggleComplete(task.id)}
                    className="text-slate-400 hover:text-emerald-600 transition"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-sm font-semibold text-slate-800 ${task.completed ? 'line-through text-slate-400' : ''}`}>
                        {task.title}
                      </span>
                      {getCategoryBadge(task.category)}
                      {getPriorityBadge(task.priority)}
                    </div>
                    {task.description && (
                      <p className="text-xs text-slate-400 truncate">{task.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{task.actualTimeLoggedMinutes}m / {task.estimatedTimeMinutes}m</span>
                  </div>

                  {task.dueDate && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{task.dueDate}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {!task.completed && (
                      <button
                        onClick={() => onStartPomodoroForTask(task.id)}
                        className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[11px] flex items-center gap-1 border border-emerald-200 transition"
                      >
                        <Play className="w-3 h-3 fill-emerald-600" />
                        Focus
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setTaskToEdit(task);
                        setIsModalOpen(true);
                      }}
                      className="p-1 hover:text-blue-600 text-slate-400"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-1 hover:text-rose-600 text-slate-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredTasks.length === 0 && (
              <div className="p-12 text-center text-slate-400 text-xs">
                No matching tasks found. Create one using the button above!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal for Create / Edit */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        taskToEdit={taskToEdit}
      />
    </div>
  );
};
