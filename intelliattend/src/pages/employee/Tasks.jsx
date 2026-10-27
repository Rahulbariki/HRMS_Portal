import { useState, useMemo } from 'react';
import {
  Search, Plus, FileSpreadsheet, X,
  Calendar, CheckCircle2, Clock,
  Send
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext';

const INITIAL_TASKS = [
  {
    id: 1,
    title: 'Go through Guides and setup git',
    subtitle: 'Go through Guides and setup git, GitHub workspace, clone repos, and configure local SSH keys.',
    scope: 'assignedToMe',
    assignees: [
      { name: 'Rahul Bariki', avatar: '/avatar_rahul.png' },
      { name: 'Edara Saichand', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
      { name: 'Faisal Khan', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150' },
      { name: 'Pavani Geddala', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
    ],
    assignedBy: 'Aditya Dhiman',
    assignedDate: '2026-10-10',
    priority: 'Medium',
    dueDate: '2026-10-15',
    dueDateFormatted: '15 Oct 2026',
    status: 'Completed',
    progress: 100,
    comments: [
      {
        id: 1,
        author: 'Aditya Dhiman',
        time: '12 Oct 2026, 10:30 AM',
        content: 'Please confirm when your local SSH keys and repository remotes are working properly.',
      },
      {
        id: 2,
        author: 'Rahul Bariki',
        time: '14 Oct 2026, 04:15 PM',
        content: 'Completed setup, verified git push and branches. All guides reviewed.',
      },
    ],
  },
  {
    id: 2,
    title: 'Work on dashboards implementation',
    subtitle: 'Work on dashboards implementation in the panels of employee, manager, and client views.',
    scope: 'assignedToMe',
    assignees: [
      { name: 'Rahul Bariki', avatar: '/avatar_rahul.png' },
      { name: 'Harish Gopal', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150' },
      { name: 'Sri Lakshmi', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' },
      { name: 'Kalyan Babu', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150' },
    ],
    assignedBy: 'Aditya Dhiman',
    assignedDate: '2026-10-16',
    priority: 'Medium',
    dueDate: '2026-10-23',
    dueDateFormatted: '23 Oct 2026',
    status: 'Completed',
    progress: 100,
    comments: [
      {
        id: 1,
        author: 'Aditya Dhiman',
        time: '18 Oct 2026, 11:00 AM',
        content: 'Ensure responsiveness on tablets and mobile screens for all quick action widgets.',
      },
      {
        id: 2,
        author: 'Rahul Bariki',
        time: '23 Oct 2026, 06:00 PM',
        content: 'Implemented and tested work timers, quick actions, leaves summary, and regularizations.',
      },
    ],
  },
  {
    id: 3,
    title: 'Implement Face Biometrics & Geo Attendance verification',
    subtitle: 'Integrate MediaPipe camera feed for facial match check during punch in/out workflow.',
    scope: 'assignedToMe',
    assignees: [
      { name: 'Rahul Bariki', avatar: '/avatar_rahul.png' },
      { name: 'Jashandeep Singh', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
    ],
    assignedBy: 'Aditya Dhiman',
    assignedDate: '2026-10-24',
    priority: 'High',
    dueDate: '2026-10-29',
    dueDateFormatted: '29 Oct 2026',
    status: 'In Progress',
    progress: 75,
    comments: [
      {
        id: 1,
        author: 'Aditya Dhiman',
        time: '25 Oct 2026, 02:20 PM',
        content: 'Add fallbacks for when webcam permission is denied or device does not have camera.',
      },
    ],
  },
  {
    id: 4,
    title: 'Review Organisation Chart & Branch Filter components',
    subtitle: 'Verify SVG link connectors, pan/zoom canvas, and employee detail cards.',
    scope: 'assignedByMe',
    assignees: [
      { name: 'Edara Saichand', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
      { name: 'Kishore R', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' },
    ],
    assignedBy: 'Rahul Bariki',
    assignedDate: '2026-10-25',
    priority: 'Medium',
    dueDate: '2026-10-31',
    dueDateFormatted: '31 Oct 2026',
    status: 'Pending',
    progress: 30,
    comments: [],
  },
];

export default function EmployeeTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [scope, setScope] = useState('assignedToMe'); // 'assignedToMe' | 'assignedByMe'
  const [filterDue, setFilterDue] = useState('all'); // 'all' | 'due_today' | 'overdue'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [assignedTodayOnly, setAssignedTodayOnly] = useState(false);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingTask, setViewingTask] = useState(null);
  const [newCommentText, setNewCommentText] = useState('');

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubtitle, setNewTaskSubtitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  // Counts for filter pills
  const counts = useMemo(() => {
    const today = '2026-10-26';
    const scoped = tasks.filter(t => t.scope === scope);
    const all = scoped.length;
    const dueToday = scoped.filter(t => t.dueDate === today).length;
    const overdue = scoped.filter(t => t.dueDate < today && t.status !== 'Completed').length;
    return { all, dueToday, overdue };
  }, [tasks, scope]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    const today = '2026-10-26';
    return tasks.filter(task => {
      if (task.scope !== scope) return false;

      // Filter due pills
      if (filterDue === 'due_today' && task.dueDate !== today) return false;
      if (filterDue === 'overdue' && !(task.dueDate < today && task.status !== 'Completed')) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchSub = task.subtitle.toLowerCase().includes(q);
        const matchAssignedBy = task.assignedBy.toLowerCase().includes(q);
        if (!matchTitle && !matchSub && !matchAssignedBy) return false;
      }

      // Status dropdown
      if (statusFilter !== 'All' && task.status !== statusFilter) return false;

      // Priority dropdown
      if (priorityFilter !== 'All' && task.priority !== priorityFilter) return false;

      // Date range
      if (startDate && task.dueDate < startDate) return false;
      if (endDate && task.dueDate > endDate) return false;

      // Assigned today checkbox
      if (assignedTodayOnly && task.assignedDate !== today) return false;

      return true;
    });
  }, [tasks, scope, filterDue, searchQuery, statusFilter, priorityFilter, startDate, endDate, assignedTodayOnly]);

  // Export tasks as CSV (Excel compatible)
  const handleExportExcel = () => {
    const headers = ['#', 'Task', 'Description', 'Assigned By', 'Priority', 'Due Date', 'Status', 'Progress'];
    const rows = filteredTasks.map((t, idx) => [
      idx + 1,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.subtitle.replace(/"/g, '""')}"`,
      `"${t.assignedBy}"`,
      t.priority,
      t.dueDate,
      t.status,
      `${t.progress}%`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tasks_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const formattedDate = newTaskDueDate
      ? new Date(newTaskDueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : '31 Oct 2026';

    const newTask = {
      id: Date.now(),
      title: newTaskTitle.trim(),
      subtitle: newTaskSubtitle.trim() || newTaskTitle.trim(),
      scope: 'assignedByMe',
      assignees: [
        { name: 'Rahul Bariki', avatar: '/avatar_rahul.png' },
      ],
      assignedBy: user?.name || 'Rahul Bariki',
      assignedDate: '2026-10-26',
      priority: newTaskPriority,
      dueDate: newTaskDueDate || '2026-10-31',
      dueDateFormatted: formattedDate,
      status: 'Pending',
      progress: 0,
      comments: [],
    };

    setTasks([newTask, ...tasks]);
    setScope('assignedByMe');
    setIsCreateModalOpen(false);
    setNewTaskTitle('');
    setNewTaskSubtitle('');
    setNewTaskPriority('Medium');
    setNewTaskDueDate('');
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !viewingTask) return;

    const newComment = {
      id: Date.now(),
      author: user?.name || 'Rahul Bariki',
      time: 'Just now',
      content: newCommentText.trim(),
    };

    const updatedTask = {
      ...viewingTask,
      comments: [...(viewingTask.comments || []), newComment],
    };

    setViewingTask(updatedTask);
    setTasks(tasks.map(t => (t.id === updatedTask.id ? updatedTask : t)));
    setNewCommentText('');
  };

  const handleUpdateStatus = (newStatus) => {
    if (!viewingTask) return;
    const updated = {
      ...viewingTask,
      status: newStatus,
      progress: newStatus === 'Completed' ? 100 : newStatus === 'In Progress' ? 50 : 0,
    };
    setViewingTask(updated);
    setTasks(tasks.map(t => (t.id === updated.id ? updated : t)));
  };

  return (
    <div className="space-y-4">
      {/* Top Header Row with Title and Action Buttons matching Screenshot 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            My Tasks
          </h1>
          <p className="font-body mt-1 text-xs text-slate-500">
            Tasks assigned to or created by you
          </p>
        </div>

        {/* Action Buttons: Export Excel and + Create Task */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-teal-400" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Scope Switcher Tabs: [Assigned to me] [Assigned by me] */}
      <div className="flex items-center gap-3">
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
          <button
            type="button"
            onClick={() => setScope('assignedToMe')}
            className={clsx(
              'px-4 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer',
              scope === 'assignedToMe'
                ? 'bg-slate-900 text-teal-300 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            Assigned to me
          </button>
          <button
            type="button"
            onClick={() => setScope('assignedByMe')}
            className={clsx(
              'px-4 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer',
              scope === 'assignedByMe'
                ? 'bg-slate-900 text-teal-300 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            Assigned by me
          </button>
        </div>
      </div>

      {/* Filter Tabs: [All Tasks] [Due Today] [Overdue] */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFilterDue('all')}
          className={clsx(
            'px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer',
            filterDue === 'all'
              ? 'bg-slate-900 text-teal-300 shadow-2xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          )}
        >
          All Tasks {counts.all > 0 && `(${counts.all})`}
        </button>

        <button
          type="button"
          onClick={() => setFilterDue('due_today')}
          className={clsx(
            'px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer',
            filterDue === 'due_today'
              ? 'bg-slate-900 text-teal-300 shadow-2xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          )}
        >
          Due Today {counts.dueToday > 0 && `(${counts.dueToday})`}
        </button>

        <button
          type="button"
          onClick={() => setFilterDue('overdue')}
          className={clsx(
            'px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer',
            filterDue === 'overdue'
              ? 'bg-slate-900 text-teal-300 shadow-2xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          )}
        >
          Overdue {counts.overdue > 0 && `(${counts.overdue})`}
        </button>
      </div>

      {/* Filter Form Row matching Screenshot 3 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search tasks */}
          <div className="md:col-span-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Status Dropdown */}
          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          {/* Priority Dropdown */}
          <div className="md:col-span-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Date Range: dd/mm/yyyy -> dd/mm/yyyy */}
          <div className="md:col-span-4 flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
            <span className="text-slate-400 text-xs font-bold">→</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
        </div>

        {/* Assigned Today Checkbox */}
        <div className="flex items-center gap-2 pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-slate-700">
            <input
              type="checkbox"
              checked={assignedTodayOnly}
              onChange={(e) => setAssignedTodayOnly(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <span>Assigned Today</span>
          </label>
        </div>
      </div>

      {/* Tasks Table matching Screenshot 3 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="text-[11px] font-bold text-slate-400 bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4 w-12">#</th>
                <th className="py-3 px-4">Task</th>
                <th className="py-3 px-4">Assignees</th>
                <th className="py-3 px-4">Assigned By</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task, idx) => (
                  <tr key={task.id} className="hover:bg-slate-50/70 transition">
                    {/* Index */}
                    <td className="py-4 px-4 font-semibold text-slate-400">{idx + 1}</td>

                    {/* Task Title & Subtitle */}
                    <td className="py-4 px-4 max-w-sm">
                      <p className="font-bold text-slate-900 text-xs line-clamp-1">{task.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{task.subtitle}</p>
                    </td>

                    {/* Assignees (Overlapping avatars + count badge) */}
                    <td className="py-4 px-4">
                      <div className="flex items-center -space-x-1.5 overflow-hidden">
                        {task.assignees.slice(0, 3).map((a, i) => (
                          <img
                            key={i}
                            src={a.avatar}
                            alt={a.name}
                            title={a.name}
                            className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover"
                          />
                        ))}
                        {task.assignees.length > 3 && (
                          <span className="flex items-center justify-center h-7 w-7 rounded-full bg-slate-100 ring-2 ring-white text-[10px] font-bold text-slate-600">
                            +{task.assignees.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Assigned By */}
                    <td className="py-4 px-4 font-semibold text-slate-800">{task.assignedBy}</td>

                    {/* Priority */}
                    <td className="py-4 px-4">
                      <span
                        className={clsx(
                          'px-2.5 py-0.5 rounded-full text-[11px] font-semibold',
                          task.priority === 'High' || task.priority === 'Urgent'
                            ? 'bg-rose-50 text-rose-700'
                            : task.priority === 'Medium'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-slate-100 text-slate-700'
                        )}
                      >
                        {task.priority}
                      </span>
                    </td>

                    {/* Due Date */}
                    <td className="py-4 px-4 text-slate-700 font-medium whitespace-nowrap">
                      {task.dueDateFormatted || task.dueDate}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span
                        className={clsx(
                          'px-2.5 py-0.5 rounded-full text-[11px] font-semibold',
                          task.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-600'
                            : task.status === 'In Progress'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-amber-50 text-amber-600'
                        )}
                      >
                        {task.status}
                      </span>
                    </td>

                    {/* Actions: View */}
                    <td className="py-4 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setViewingTask(task)}
                        className="text-xs font-bold text-teal-600 hover:text-teal-700 px-3 py-1 rounded-lg hover:bg-teal-50 transition cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-slate-400">
                    No tasks match the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Task Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in-0 zoom-in-95">
            <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-lg flex items-center gap-2">
                  <span>Create New Task</span>
                  <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                </h3>
                <p className="text-slate-300 text-xs mt-0.5">Assign work items to team members or track deliverables.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Implement Webhook Handler for Payroll"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Subtitle</label>
                <textarea
                  rows={3}
                  value={newTaskSubtitle}
                  onChange={(e) => setNewTaskSubtitle(e.target.value)}
                  placeholder="Provide scope, guidelines, or requirements..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-teal-500/20"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition cursor-pointer shadow-xs"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Discussion & Detail Modal */}
      {viewingTask && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in-0 zoom-in-95">
            {/* Modal Header */}
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                  Task #{viewingTask.id}
                </span>
                <h3 className="font-display font-bold text-base leading-snug mt-0.5">
                  {viewingTask.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingTask(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs text-slate-700">
              {/* Status and Progress Bar */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-600">Status:</span>
                    <select
                      value={viewingTask.status}
                      onChange={(e) => handleUpdateStatus(e.target.value)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 font-bold bg-white text-xs focus:ring-2 focus:ring-teal-500/20"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-600">Priority:</span>
                    <span className="px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-800 border border-slate-200">
                      {viewingTask.priority}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-500 font-medium">Completion Progress</span>
                    <span className="font-bold text-slate-900">{viewingTask.progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full transition-all duration-300"
                      style={{ width: `${viewingTask.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Scope & Description */}
              <div>
                <p className="font-bold text-slate-900 mb-1">Description</p>
                <p className="text-slate-600 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                  {viewingTask.subtitle}
                </p>
              </div>

              {/* Metadata details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <div>
                    <p className="text-[10px] text-slate-400">Due Date</p>
                    <p className="font-bold text-slate-800">{viewingTask.dueDateFormatted || viewingTask.dueDate}</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <div>
                    <p className="text-[10px] text-slate-400">Assigned By</p>
                    <p className="font-bold text-slate-800">{viewingTask.assignedBy}</p>
                  </div>
                </div>
              </div>

              {/* Discussion Thread */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <span>Task Discussion & Updates</span>
                  <span className="text-[11px] font-normal text-slate-400">
                    ({viewingTask.comments?.length || 0} messages)
                  </span>
                </h4>

                <div className="space-y-2.5 max-h-48 overflow-y-auto p-1">
                  {viewingTask.comments && viewingTask.comments.length > 0 ? (
                    viewingTask.comments.map((c) => (
                      <div key={c.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-800">{c.author}</span>
                          <span className="text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {c.time}
                          </span>
                        </div>
                        <p className="text-slate-600 leading-normal">{c.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 text-center py-3 italic">
                      No comments yet. Start the task discussion below.
                    </p>
                  )}
                </div>

                {/* Add Comment Input */}
                <form onSubmit={handleAddComment} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Post a status update or question..."
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-teal-400" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingTask(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition cursor-pointer text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}