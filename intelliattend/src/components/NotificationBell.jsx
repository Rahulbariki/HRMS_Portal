import { useState, useRef, useEffect } from 'react';
import { Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import clsx from 'clsx';

const DEFAULT_HRMS_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Leave Request Approved',
    body: 'Your annual leave request for Dec 20-22 has been approved by your manager.',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    read_at: null,
    module: 'leaves',
  },
  {
    id: 2,
    title: 'Payslip Available',
    body: 'Your salary payslip for the previous month is now ready for download.',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    read_at: null,
    module: 'salary',
  },
  {
    id: 3,
    title: 'Updated Policy Published',
    body: 'Company Code of Conduct v2.4 has been updated. Please review.',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    read_at: '2026-10-25T10:00:00Z',
    module: 'policies',
  },
];

function formatTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = Date.now();
  const diffHours = Math.round((now - date.getTime()) / (1000 * 60 * 60));
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(DEFAULT_HRMS_NOTIFICATIONS);
  const [unreadCount, setUnreadCount] = useState(2);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const bellRef = useRef(null);

  const fetchNotifications = async (pageNum = 1, silent = false) => {
    const token = localStorage.getItem('token') || '';
    if (token.startsWith('mock-')) return;
    if (!silent) setLoading(true);
    try {
      const response = await api.get(`/notifications?page=${pageNum}`);
      if (response.data?.success && response.data?.data) {
        const { items, unreadCount: unread, totalPages: total } = response.data.data;
        if (items && items.length > 0) {
          setNotifications(items);
          setUnreadCount(unread || 0);
          setTotalPages(total || 1);
        }
      }
    } catch {
      // Retain default demo notifications on API failure
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => fetchNotifications(page, true), 45000);
    return () => clearInterval(interval);
  }, [page]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRouteForModule = (module) => {
    const role = user?.role || 'employee';
    switch (module) {
      case 'leaves': return `/${role}/leaves`;
      case 'tasks': return `/${role}/tasks`;
      case 'attendance': return `/${role}/attendance`;
      case 'expenses': return `/${role}/expenses`;
      case 'salary': return `/${role}/salary`;
      case 'policies': return `/${role}/policies`;
      default: return `/${role}/dashboard`;
    }
  };

  const handleNotificationClick = async (notification) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n))
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    setOpen(false);
    navigate(getRouteForModule(notification.module));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
    setUnreadCount(0);
    api.put('/notifications/read-all').catch(() => {});
  };

  return (
    <div className="relative flex-shrink-0" ref={bellRef}>
      <button
        type="button"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none cursor-pointer"
      >
        <Bell className="h-4 w-4" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 inline-flex min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-bold leading-none text-white ring-2 ring-white dark:ring-slate-900">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <section
          aria-label="Notifications"
          className="absolute right-0 top-12 z-50 flex max-h-[28rem] w-80 sm:w-96 flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl animate-in fade-in-0 zoom-in-95"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 py-3 bg-slate-50 dark:bg-slate-950/60">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">Notifications</h2>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                {unreadCount ? `${unreadCount} unread update${unreadCount > 1 ? 's' : ''}` : "You're all caught up"}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 transition cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="flex-1 divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-8 text-center text-xs text-slate-400">Loading notifications...</p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-slate-400">No notifications yet.</p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleNotificationClick(notification)}
                  className={clsx(
                    'flex w-full gap-3 px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/50 focus:outline-none cursor-pointer',
                    notification.read_at ? 'bg-white dark:bg-slate-900' : 'bg-teal-50/50 dark:bg-teal-950/20'
                  )}
                >
                  <span
                    className={clsx(
                      'mt-1.5 h-2 w-2 flex-shrink-0 rounded-full',
                      notification.read_at ? 'bg-slate-300 dark:bg-slate-600' : 'bg-teal-500'
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-bold text-slate-900 dark:text-white">{notification.title}</span>
                    <span className="mt-0.5 block text-xs leading-4 text-slate-600 dark:text-slate-300">{notification.body}</span>
                    <span className="mt-1 block text-[10px] text-slate-400 dark:text-slate-500">{formatTime(notification.created_at)}</span>
                  </span>
                </button>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 px-4 py-2 bg-slate-50 dark:bg-slate-950/60">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Page {page} of {totalPages}</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="rounded p-1 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="rounded p-1 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}