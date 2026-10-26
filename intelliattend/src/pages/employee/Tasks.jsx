import { useState } from 'react';
import { CheckCircle2, Plus, Calendar, Check, X } from 'lucide-react';
import clsx from 'clsx';

const INITIAL_TASKS = [
  {
    id: 1,
    title: 'Complete Q4 Performance Self-Review',
    description: 'Submit self-evaluation and goals achievement documentation in HR portal.',
    dueDate: '2026-10-31',
    priority: 'high',
    status: 'in_progress',
    category: 'HR & Compliance',
    assignedBy: 'Sarah Jenkins (HR)',
  },
  {
    id: 2,
    title: 'Migrate User Authentication to OAuth2 v2',
    description: 'Refactor session tokens and add multi-factor authentication fallback checks.',
    dueDate: '2026-11-05',
    priority: 'high',
    status: 'todo',
    category: 'Engineering',
    assignedBy: 'David Chen (Manager)',
  },
  {
    id: 3,
    title: 'Annual Information Security Training',
    description: 'Watch cybersecurity compliance modules and take the 20-question quiz.',
    dueDate: '2026-11-15',
    priority: 'medium',
    status: 'completed',
    category: 'Training',
    assignedBy: 'IT Security',
  },
  {
    id: 4,
    title: 'Prepare API Integration Specs for Client Portal',
    description: 'Document endpoints, error codes, and rate limits for third-party partners.',
    dueDate: '2026-11-02',
    priority: 'low',
    status: 'in_progress',
    category: 'Engineering',
    assignedBy: 'David Chen (Manager)',
  },
];

export default function EmployeeTasks() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    category: 'Work Item',
  });

  const toggleTaskStatus = (id) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: t.status === 'completed' ? 'in_progress' : 'completed',
        };
      }
      return t;
    }));
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTask.title) return;

    const task = {
      id: Date.now(),
      title: newTask.title,
      description: newTask.description || 'Personal work objective',
      dueDate: newTask.dueDate || '2026-11-10',
      priority: newTask.priority,
      status: 'todo',
      category: newTask.category,
      assignedBy: 'Self Assigned',
    };

    setTasks([task, ...tasks]);
    setIsModalOpen(false);
    setNewTask({ title: '', description: '', dueDate: '', priority: 'medium', category: 'Work Item' });
  };

  const filteredTasks = tasks.filter(t => {
    if (filterStatus === 'all') return true;
    return t.status === filterStatus;
  });

  const stats = {
    total: tasks.length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    todo: tasks.filter(t => t.status === 'todo').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">Tasks & Objectives</h1>
          <p className="text-sm text-slate-500 mt-1">Track assigned departmental deliverables and quarterly goals</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Personal Task</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Total Tasks</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-amber-600">In Progress</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{stats.inProgress}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-blue-600">To Do</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{stats.todo}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-emerald-600">Completed</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{stats.completed}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex gap-1 sm:gap-2">
          {[
            { id: 'all', label: 'All Tasks' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'todo', label: 'To Do' },
            { id: 'completed', label: 'Completed' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={clsx(
                'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all',
                filterStatus === tab.id
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400 font-medium px-2">{filteredTasks.length} items</span>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-white p-12 text-center text-slate-400 rounded-2xl border border-slate-200">
            <CheckCircle2 className="h-10 w-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No tasks in this section</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div
              key={task.id}
              className={clsx(
                'bg-white p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm',
                task.status === 'completed' ? 'border-slate-200 opacity-75' : 'border-slate-200 hover:border-slate-300'
              )}
            >
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => toggleTaskStatus(task.id)}
                  className={clsx(
                    'mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-colors flex-shrink-0',
                    task.status === 'completed'
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 hover:border-indigo-600 text-transparent'
                  )}
                  aria-label={task.status === 'completed' ? 'Mark incomplete' : 'Mark completed'}
                >
                  <Check className="h-4 w-4" />
                </button>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className={clsx(
                      'font-semibold text-sm text-slate-900',
                      task.status === 'completed' && 'line-through text-slate-400'
                    )}>
                      {task.title}
                    </h3>
                    <span className={clsx(
                      'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full',
                      task.priority === 'high' ? 'bg-rose-100 text-rose-700'
                        : task.priority === 'medium' ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-700'
                    )}>
                      {task.priority}
                    </span>
                    <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                      {task.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{task.description}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="h-3.5 w-3.5" />
                      Due: {task.dueDate}
                    </span>
                    <span>•</span>
                    <span>Assigned by: {task.assignedBy}</span>
                  </div>
                </div>
              </div>

              <div className="self-end sm:self-auto flex items-center gap-2">
                <span className={clsx(
                  'px-2.5 py-1 rounded-full text-xs font-bold capitalize',
                  task.status === 'completed' ? 'bg-emerald-100 text-emerald-800'
                    : task.status === 'in_progress' ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-800'
                )}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-display text-lg font-bold text-slate-900">Add Task</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="e.g. Prepare architecture diagram"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Task details and milestones..."
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}