import { useState } from 'react';
import {
  Plus, Calendar, Check, X,
  Filter, Search, User
} from 'lucide-react';
import clsx from 'clsx';

const INITIAL_TEAM_TASKS = [
  {
    id: 1,
    title: 'Migrate Core Services to PostgreSQL',
    assignee: 'Sarah Miller',
    role: 'Lead Full Stack Engineer',
    dueDate: '2026-10-31',
    priority: 'high',
    status: 'in_progress',
    description: 'Execute database migration scripts and test connection pooling resilience.',
  },
  {
    id: 2,
    title: 'Prepare Q4 Product Delivery Roadmap',
    assignee: 'Alex Rivera',
    role: 'Product Lead',
    dueDate: '2026-11-05',
    priority: 'medium',
    status: 'pending',
    description: 'Consolidate stakeholder feature requests into sprint milestones.',
  },
  {
    id: 3,
    title: 'Security Compliance & SOC2 Evidence Audit',
    assignee: 'David Chen',
    role: 'DevOps Engineer',
    dueDate: '2026-10-28',
    priority: 'high',
    status: 'completed',
    description: 'Gather IAM logs, review encryption keys, and export auditor package.',
  },
  {
    id: 4,
    title: 'Design Dark Mode UI Assets for Mobile App',
    assignee: 'Sarah Miller',
    role: 'Lead Full Stack Engineer',
    dueDate: '2026-11-02',
    priority: 'low',
    status: 'in_progress',
    description: 'Finalize Figma design tokens and hand off SVG specifications to developers.',
  },
];

export default function ManagerTasks() {
  const [tasks, setTasks] = useState(INITIAL_TEAM_TASKS);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    assignee: 'Sarah Miller',
    role: 'Lead Full Stack Engineer',
    dueDate: '',
    priority: 'medium',
    description: '',
  });

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignee.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleToggleStatus = (id) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === 'completed' ? 'in_progress' : 'completed' }
          : t
      )
    );
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.dueDate) return;

    const created = {
      id: Date.now(),
      title: newTask.title,
      assignee: newTask.assignee,
      role: newTask.assignee === 'Sarah Miller'
        ? 'Lead Full Stack Engineer'
        : newTask.assignee === 'Rahul Bariki'
        ? 'Platform Architect'
        : newTask.assignee === 'Alex Rivera'
        ? 'Operations Director'
        : 'Team Member',
      dueDate: newTask.dueDate,
      priority: newTask.priority,
      status: 'pending',
      description: newTask.description || 'Assigned by Manager',
    };

    setTasks([created, ...tasks]);
    setNewTask({
      title: '',
      assignee: 'Sarah Miller',
      role: 'Lead Full Stack Engineer',
      dueDate: '',
      priority: 'medium',
      description: '',
    });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Team Tasks</h1>
          <p className="text-muted mt-1">Assign deliverables, monitor team execution, and review progress</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Assign New Task
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-elevated p-5">
          <p className="text-sm font-medium text-muted">Total Tasks</p>
          <p className="font-display text-2xl font-bold text-primary mt-1">{tasks.length}</p>
        </div>
        <div className="card-elevated p-5">
          <p className="text-sm font-medium text-muted">In Progress</p>
          <p className="font-display text-2xl font-bold text-accent mt-1">
            {tasks.filter((t) => t.status === 'in_progress').length}
          </p>
        </div>
        <div className="card-elevated p-5">
          <p className="text-sm font-medium text-muted">Completed</p>
          <p className="font-display text-2xl font-bold text-emerald-600 mt-1">
            {tasks.filter((t) => t.status === 'completed').length}
          </p>
        </div>
        <div className="card-elevated p-5">
          <p className="text-sm font-medium text-muted">Pending Review</p>
          <p className="font-display text-2xl font-bold text-amber-600 mt-1">
            {tasks.filter((t) => t.status === 'pending').length}
          </p>
        </div>
      </div>

      <div className="card-elevated">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by task title or assignee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 h-10 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            {['all', 'in_progress', 'completed', 'pending'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors',
                  filterStatus === status
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center text-muted">No tasks found matching your criteria.</div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => handleToggleStatus(task.id)}
                    className={clsx(
                      'mt-1 w-6 h-6 rounded-md border flex items-center justify-center transition-colors',
                      task.status === 'completed'
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-300 hover:border-primary text-transparent'
                    )}
                  >
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className={clsx(
                          'text-base font-semibold',
                          task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-800'
                        )}
                      >
                        {task.title}
                      </h3>
                      <span
                        className={clsx(
                          'px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider',
                          task.priority === 'high' && 'bg-rose-100 text-rose-700',
                          task.priority === 'medium' && 'bg-amber-100 text-amber-700',
                          task.priority === 'low' && 'bg-slate-100 text-slate-700'
                        )}
                      >
                        {task.priority}
                      </span>
                    </div>

                    <p className="text-sm text-slate-500">{task.description}</p>

                    <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-400 font-medium">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <User className="h-3.5 w-3.5 text-primary" />
                        {task.assignee} ({task.role})
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        Due {task.dueDate}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <span
                    className={clsx(
                      'px-3 py-1 rounded-full text-xs font-semibold capitalize',
                      task.status === 'completed' && 'bg-emerald-100 text-emerald-700',
                      task.status === 'in_progress' && 'bg-blue-100 text-blue-700',
                      task.status === 'pending' && 'bg-amber-100 text-amber-700'
                    )}
                  >
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-elevated max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="font-display text-lg font-bold text-primary">Assign New Task</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Conduct Database Optimization"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="input-field text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assignee</label>
                  <select
                    value={newTask.assignee}
                    onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                    className="input-field text-sm"
                  >
                    <option value="Sarah Miller">Sarah Miller (Lead Full Stack Engineer)</option>
                    <option value="David Chen">David Chen (Engineering Manager)</option>
                    <option value="Alex Rivera">Alex Rivera (Operations Director)</option>
                    <option value="Rahul Bariki">Rahul Bariki (Platform Architect)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="input-field text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  placeholder="Provide context, acceptance criteria, or links..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="input-field text-sm resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary w-auto text-sm px-4"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary w-auto text-sm px-5">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}