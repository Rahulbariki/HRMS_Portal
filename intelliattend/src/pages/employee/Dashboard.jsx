import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, ClipboardList, UserCheck, IndianRupee, Award,
  FileText, LogOut, HelpCircle, FolderOpen, Newspaper,
  Clock, CheckCircle, AlertCircle, XCircle, Plus, Bell,
  TrendingUp, Settings, Building2, ChevronRight
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const menuItems = [
  { label: 'Leaves', path: '/employee/leaves', icon: Calendar, color: 'emerald', count: 3 },
  { label: 'Tasks', path: '/employee/tasks', icon: ClipboardList, color: 'indigo', count: 5 },
  { label: 'Attendance', path: '/employee/attendance', icon: UserCheck, color: 'teal', count: 0 },
  { label: 'Expenses', path: '/employee/expenses', icon: IndianRupee, color: 'amber', count: 2 },
  { label: 'Salary', path: '/employee/salary', icon: Award, color: 'purple', count: 0 },
  { label: 'Policies', path: '/employee/policies', icon: FileText, color: 'blue', count: 0 },
  { label: 'Documents', path: '/employee/documents', icon: FolderOpen, color: 'emerald', count: 0 },
  { label: 'News', path: '/employee/news', icon: Newspaper, color: 'sky', count: 0 },
  { label: 'Holidays', path: '/employee/holidays', icon: Calendar, color: 'rose', count: 0 },
  { label: 'Offboarding', path: '/employee/offboarding', icon: LogOut, color: 'rose', count: 0 },
  { label: 'Letters', path: '/employee/letters', icon: FileText, color: 'cyan', count: 0 },
  { label: 'Support', path: '/employee/support-query', icon: HelpCircle, color: 'amber', count: 0 },
];

const colorStyles = {
  emerald: {
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
  },
  indigo: {
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
    badge: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300'
  },
  teal: {
    iconBg: 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400',
    badge: 'bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300'
  },
  amber: {
    iconBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
  },
  purple: {
    iconBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
    badge: 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300'
  },
  blue: {
    iconBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
  },
  sky: {
    iconBg: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400',
    badge: 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300'
  },
  rose: {
    iconBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
    badge: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
  },
  cyan: {
    iconBg: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400',
    badge: 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300'
  }
};

const attendanceStatus = [
  { label: 'Present', value: '18', colorClass: 'text-emerald-600 dark:text-emerald-400' },
  { label: 'Absent', value: '2', colorClass: 'text-rose-600 dark:text-rose-400' },
  { label: 'Late', value: '1', colorClass: 'text-amber-600 dark:text-amber-400' },
  { label: 'WFH', value: '4', colorClass: 'text-teal-600 dark:text-teal-400' },
];

const recentActivity = [
  { type: 'leave_approved', title: 'Leave Request Approved', description: 'Diwali Festival Break (Nov 09-11, 2026)', time: '2 hours ago', status: 'success' },
  { type: 'expense_submitted', title: 'Expense Claim Submitted', description: 'AWS Certified Solutions Architect Exam ₹12,500.00', time: '5 hours ago', status: 'pending' },
  { type: 'task_assigned', title: 'Active Sprint Task Assigned', description: 'Implement Face Biometrics & Geo Attendance verification', time: '1 day ago', status: 'info' },
  { type: 'payslip_available', title: 'October 2026 Payslip Available', description: 'Net Disbursed: ₹82,750 via HDFC Direct Transfer', time: '2 days ago', status: 'success' },
  { type: 'document_shared', title: 'Corporate Policy Document Published', description: 'Enterprise Remote Work & Infosec Protocols v3.0', time: '3 days ago', status: 'info' },
];

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState(attendanceStatus);
  const [leaveBalance, setLeaveBalance] = useState({ annual: 15, sick: 8, casual: 5 });


  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    if (token.startsWith('mock-')) return;
    const fetchData = async () => {
      try {
        const [attRes, leaveRes] = await Promise.all([
          api.get('/employee/attendance/summary'),
          api.get('/employee/leaves/balance'),
        ]);
        if (attRes.data?.success && Array.isArray(attRes.data.data)) {
          setAttendance(attRes.data.data);
        }
        if (leaveRes.data?.success && leaveRes.data.data) {
          setLeaveBalance(leaveRes.data.data);
        }
      } catch {
        // Retain fallback values
      }
    };
    fetchData();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-amber-500" />;
      case 'info': return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default: return <XCircle className="h-4 w-4 text-rose-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'success': return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
      case 'pending': return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
      case 'info': return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
      default: return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Employee Workspace</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Welcome back, <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.name?.split(' ')[0] || 'Employee'}</span> • Engineering & Operations
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/employee/leaves"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Apply Leave
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Leave Balance Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Leave Balance</p>
              <p className="font-display text-3xl font-bold text-slate-900 dark:text-white mt-1">{leaveBalance.annual}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Annual days remaining</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Calendar className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950">
              <p className="font-display text-sm font-bold text-slate-900 dark:text-white">{leaveBalance.annual}</p>
              <p className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">Annual</p>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950">
              <p className="font-display text-sm font-bold text-teal-600 dark:text-teal-400">{leaveBalance.sick}</p>
              <p className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">Sick</p>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950">
              <p className="font-display text-sm font-bold text-amber-600 dark:text-amber-400">{leaveBalance.casual}</p>
              <p className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">Casual</p>
            </div>
          </div>
        </div>

        {/* Monthly Attendance Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">This Month</p>
              <p className="font-display text-3xl font-bold text-slate-900 dark:text-white mt-1">
                {attendance.find(a => a.label === 'Present')?.value || '18'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Days present</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <UserCheck className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-5 grid grid-cols-4 gap-1.5 text-center pt-4 border-t border-slate-100 dark:border-slate-800">
            {attendance.map((item) => (
              <div key={item.label} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950">
                <p className={`font-display text-sm font-bold ${item.colorClass || 'text-slate-800 dark:text-slate-200'}`}>
                  {item.value}
                </p>
                <p className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Items Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending Tasks</p>
              <p className="font-display text-3xl font-bold text-slate-900 dark:text-white mt-1">
                {menuItems.reduce((sum, item) => sum + item.count, 0)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Requiring attention</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Bell className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-5 flex gap-2 overflow-x-auto pb-1 pt-4 border-t border-slate-100 dark:border-slate-800">
            {menuItems.filter(item => item.count > 0).map((item) => {
              const theme = colorStyles[item.color] || colorStyles.indigo;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap text-xs"
                >
                  <item.icon className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${theme.badge}`}>
                    {item.count}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Rate Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Attendance Rate</p>
              <p className="font-display text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">94.8%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Consistent compliance</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-5 h-16 flex items-end justify-around pt-3 border-t border-slate-100 dark:border-slate-800">
            {[
              { day: 'Mon', value: 85 },
              { day: 'Tue', value: 92 },
              { day: 'Wed', value: 78 },
              { day: 'Thu', value: 95 },
              { day: 'Fri', value: 88 },
            ].map((d) => (
              <div key={d.day} className="flex flex-col items-center gap-1">
                <div
                  className="w-4 rounded-t bg-emerald-500 dark:bg-emerald-400"
                  style={{ height: `${(d.value / 100) * 40}px` }}
                />
                <span className="text-[10px] text-slate-400 font-medium">{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle Row: Activity & Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">Recent Activity & Updates</h2>
            <Link to="/employee/leaves" className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline">
              View History
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="mt-0.5">{getStatusIcon(activity.status)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xs text-slate-900 dark:text-white">{activity.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getStatusBadge(activity.status)}`}>
                      {activity.status.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">{activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">Quick Access</h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 p-2">
            {[
              { label: 'My KYC & ID Card', path: '/employee/profile', icon: UserCheck, desc: 'View profile & credentials' },
              { label: 'Portal Settings', path: '/employee/settings', icon: Settings, desc: 'Preferences & notifications' },
              { label: 'Support & Helpdesk', path: '/employee/support-query', icon: HelpCircle, desc: 'Submit inquiries' },
              { label: 'Company Policies', path: '/employee/policies', icon: FileText, desc: 'Compliance handbook' },
            ].map((link, index) => (
              <Link
                key={index}
                to={link.path}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center group-hover:bg-slate-900 dark:group-hover:bg-teal-600 group-hover:text-white transition-colors">
                    <link.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-slate-900 dark:text-white block">{link.label}</span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">{link.desc}</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ))}
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 text-center">
            IntelliAttend Enterprise v2.4 • Neon Cloud
          </div>
        </div>
      </div>

      {/* Module Access Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <h2 className="font-display text-base font-bold text-slate-900 dark:text-white mb-5">
          Workspace Modules & Applications
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {menuItems.map((item, index) => {
            const theme = colorStyles[item.color] || colorStyles.indigo;
            return (
              <Link
                key={index}
                to={item.path}
                className="flex flex-col items-center gap-2.5 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-all group cursor-pointer text-center"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${theme.iconBg}`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">
                  {item.label}
                </span>
                {item.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${theme.badge}`}>
                    {item.count} Action{item.count > 1 ? 's' : ''}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}