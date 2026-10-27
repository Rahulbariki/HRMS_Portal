import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, ClipboardList, FileCheck, FolderOpen, Newspaper,
  IndianRupee, Award, LogOut, FileText, HelpCircle, Settings, User,
  Users, CheckCircle2, Clock, ChevronRight, UserCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const pages = [
  { label: 'Leave Approvals', path: '/manager/leaves', icon: Calendar, desc: 'Review team leave requests', colorClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' },
  { label: 'Task Assignments', path: '/manager/tasks', icon: ClipboardList, desc: 'Assign and monitor sprints', colorClass: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' },
  { label: 'Team Attendance', path: '/manager/attendance', icon: UserCheck, desc: 'Verify punch-ins & logs', colorClass: 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400' },
  { label: 'Expense Reimbursements', path: '/manager/expenses', icon: IndianRupee, desc: 'Authorize claims & receipts', colorClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' },
  { label: 'Payroll & Disbursal', path: '/manager/salary', icon: Award, desc: 'Compensation governance', colorClass: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400' },
  { label: 'Official Documents', path: '/manager/documents', icon: FolderOpen, desc: 'Corporate repository & KYC', colorClass: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' },
  { label: 'Company Announcements', path: '/manager/news', icon: Newspaper, desc: 'Publish team circulars', colorClass: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400' },
  { label: 'Holiday Calendar', path: '/manager/holidays', icon: Calendar, desc: '2026 Gazetted schedule', colorClass: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400' },
  { label: 'Letters & Certificates', path: '/manager/letters', icon: FileText, desc: 'Issuance & credentials', colorClass: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400' },
  { label: 'Exit & Offboarding', path: '/manager/offboarding', icon: LogOut, desc: 'Separation & KT signoffs', colorClass: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400' },
  { label: 'Company Policies', path: '/manager/policies', icon: FileCheck, desc: 'Handbook & compliance', colorClass: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' },
  { label: 'Team Grievances', path: '/manager/queries', icon: HelpCircle, desc: 'Support desk tickets', colorClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' },
];

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    reporteesCount: 1,
    pendingLeavesCount: 0,
    pendingExpensesCount: 0,
    pendingRegularizationsCount: 1,
    attendanceRate: '100%',
    tasks: { total: 4, completed: 2, inProgress: 1, pending: 1 }
  });

  useEffect(() => {
    const fetchManagerStats = async () => {
      try {
        const res = await api.get('/manager/dashboard-stats');
        if (res.data?.success && res.data.data) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load manager stats:', err);
      }
    };
    fetchManagerStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Manager Supervisory Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Welcome back, <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.name || 'David Chen'}</span> • Engineering Department Operations
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Direct Reportees</p>
            <p className="font-display text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.reporteesCount}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Active engineering staff</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending Leaves</p>
            <p className="font-display text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.pendingLeavesCount}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Awaiting manager review</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending Claims</p>
            <p className="font-display text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{stats.pendingExpensesCount}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Expense reimbursements</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <IndianRupee className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Team Attendance</p>
            <p className="font-display text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.attendanceRate}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Checked-in today</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>
      </div>


      {/* Pages Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <h2 className="font-display text-base font-bold text-slate-900 dark:text-white mb-5">
          Manager Operations & Team Governance
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {pages.map((page, index) => {
            const Icon = page.icon;
            return (
              <Link
                key={index}
                to={page.path}
                className="flex items-start gap-4 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-all group cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${page.colorClass}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {page.label}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{page.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0 mt-1" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}