import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, ClipboardList, UserCheck, DollarSign, Award,
  FileText, LogOut, HelpCircle, FolderOpen, Newspaper,
  Clock, CheckCircle, AlertCircle, XCircle, Plus, Bell,
  TrendingUp, Settings, Building2
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const menuItems = [
  { label: 'Leaves', path: '/employee/leaves', icon: Calendar, color: 'primary', count: 3 },
  { label: 'Tasks', path: '/employee/tasks', icon: ClipboardList, color: 'accent', count: 5 },
  { label: 'Attendance', path: '/employee/attendance', icon: UserCheck, color: 'success', count: 0 },
  { label: 'Expenses', path: '/employee/expenses', icon: DollarSign, color: 'warning', count: 2 },
  { label: 'Salary', path: '/employee/salary', icon: Award, color: 'primary', count: 0 },
  { label: 'Policies', path: '/employee/policies', icon: FileText, color: 'accent', count: 0 },
  { label: 'Documents', path: '/employee/documents', icon: FolderOpen, color: 'success', count: 0 },
  { label: 'News', path: '/employee/news', icon: Newspaper, color: 'warning', count: 0 },
  { label: 'Holidays', path: '/employee/holidays', icon: Calendar, color: 'primary', count: 0 },
  { label: 'Offboarding', path: '/employee/offboarding', icon: LogOut, color: 'error', count: 0 },
  { label: 'Letters', path: '/employee/letters', icon: FileText, color: 'accent', count: 0 },
  { label: 'Support', path: '/employee/support-query', icon: HelpCircle, color: 'warning', count: 0 },
];

const attendanceStatus = [
  { label: 'Present', value: '18', color: 'success' },
  { label: 'Absent', value: '2', color: 'error' },
  { label: 'Late', value: '1', color: 'warning' },
  { label: 'WFH', value: '4', color: 'accent' },
];

const recentActivity = [
  { type: 'leave_approved', title: 'Leave Request Approved', description: 'Annual Leave - Dec 20-22', time: '2 hours ago', status: 'success' },
  { type: 'expense_submitted', title: 'Expense Submitted', description: 'Travel - Client Meeting $245.00', time: '5 hours ago', status: 'pending' },
  { type: 'task_assigned', title: 'New Task Assigned', description: 'Q4 Report Preparation', time: '1 day ago', status: 'info' },
  { type: 'payslip_available', title: 'Payslip Available', description: 'November 2024 payslip ready', time: '2 days ago', status: 'success' },
  { type: 'document_shared', title: 'Document Shared', description: 'Employee Handbook v2.1', time: '3 days ago', status: 'info' },
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
        if (attRes.data?.success) setAttendance(attRes.data.data);
        if (leaveRes.data?.success) setLeaveBalance(leaveRes.data.data);
      } catch {
        // Keep initial demo state on API failure
      }
    };
    fetchData();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'info': return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default: return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'success': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'info': return 'badge-info';
      default: return 'badge-danger';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Dashboard</h1>
          <p className="text-muted mt-1">Welcome back, {user?.name?.split(' ')[0] || 'Employee'}</p>
        </div>
        <div className="flex gap-3">
          <Link to="/employee/leaves" className="btn-primary w-auto sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Apply Leave
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted">Leave Balance</p>
              <p className="font-display text-3xl font-bold text-primary mt-1">{leaveBalance.annual}</p>
              <p className="text-sm text-muted mt-1">Annual days remaining</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-slate-50">
              <p className="font-display text-lg font-bold text-primary">{leaveBalance.annual}</p>
              <p className="text-xs text-muted">Annual</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-50">
              <p className="font-display text-lg font-bold text-accent">{leaveBalance.sick}</p>
              <p className="text-xs text-muted">Sick</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-50">
              <p className="font-display text-lg font-bold text-warning">{leaveBalance.casual}</p>
              <p className="text-xs text-muted">Casual</p>
            </div>
          </div>
        </div>

        <div className="card-elevated p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted">This Month</p>
              <p className="font-display text-3xl font-bold text-primary mt-1">
                {attendance.find(a => a.label === 'Present')?.value || '0'}
              </p>
              <p className="text-sm text-muted mt-1">Days present</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-accent-light flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-accent" />
            </div>
          </div>
          <div className="mt-4 flex gap-4">
            {attendance.map((item) => (
              <div key={item.label} className="flex-1 text-center p-2 rounded-lg bg-slate-50">
                <p className="font-display text-lg font-bold text-primary">{item.value}</p>
                <p className="text-xs text-muted">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card-elevated p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted">Pending Items</p>
              <p className="font-display text-3xl font-bold text-primary mt-1">
                {menuItems.reduce((sum, item) => sum + item.count, 0)}
              </p>
              <p className="text-sm text-muted mt-1">Requiring attention</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Bell className="h-6 w-6 text-warning" />
            </div>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {menuItems.filter(item => item.count > 0).map((item) => (
              <Link key={item.label} to={item.path} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-primary-light/50 transition-colors whitespace-nowrap">
                <item.icon className={`h-4 w-4 text-${item.color}`} />
                <span className="text-sm font-medium text-primary">{item.label}</span>
                <span className={`badge badge-${item.color === 'primary' ? 'primary' : item.color === 'accent' ? 'accent' : item.color === 'success' ? 'success' : item.color === 'warning' ? 'warning' : 'danger'}`}>
                  {item.count}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="card-elevated p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted">Quick Stats</p>
              <p className="font-display text-3xl font-bold text-primary mt-1">94%</p>
              <p className="text-sm text-muted mt-1">Attendance rate</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 h-24 flex items-end justify-around">
            {[
              { day: 'Mon', value: 85 },
              { day: 'Tue', value: 92 },
              { day: 'Wed', value: 78 },
              { day: 'Thu', value: 95 },
              { day: 'Fri', value: 88 },
              { day: 'Sat', value: 45 },
              { day: 'Sun', value: 20 },
            ].map((d) => (
              <div key={d.day} className="flex flex-col items-center gap-1">
                <div
                  className="w-6 rounded-t bg-primary"
                  style={{ height: `${d.value}%` }}
                />
                <span className="text-xs text-muted">{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-elevated">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-primary">Recent Activity</h2>
            <Link to="/employee/activity" className="text-sm text-primary hover:text-primary-hover font-medium">View all</Link>
          </div>
          <div className="card-body p-0">
            <div className="divide-y divide-slate-100">
              {recentActivity.map((activity, index) => (
                <Link
                  key={index}
                  to={`/employee/activity/${activity.type}`}
                  className="flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors"
                >
                  {getStatusIcon(activity.status)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-primary">{activity.title}</p>
                    <p className="text-sm text-muted mt-0.5">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`badge ${getStatusBadge(activity.status)}`}>
                        {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                      </span>
                      <span className="text-xs text-muted">{activity.time}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="card-elevated">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-primary">Quick Links</h2>
          </div>
          <div className="card-body p-0">
            <div className="divide-y divide-slate-100">
              {[
                { label: 'My Profile', path: '/employee/profile', icon: UserCheck },
                { label: 'Settings', path: '/employee/settings', icon: Settings },
                { label: 'Company Directory', path: '/employee/directory', icon: Building2 },
                { label: 'Help Center', path: '/help', icon: HelpCircle },
              ].map((link, index) => (
                <Link
                  key={index}
                  to={link.path}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary-light flex items-center justify-center">
                    <link.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium text-sm text-primary">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card-elevated">
        <div className="card-header flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-primary">Module Access</h2>
        </div>
        <div className="card-body p-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className="flex flex-col items-center gap-3 p-4 rounded-xl border border-slate-100 hover:border-primary/50 hover:bg-primary-light/50 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${item.color}-light group-hover:bg-${item.color} group-hover:text-white transition-colors`}>
                  <item.icon className={`h-6 w-6 text-${item.color} group-hover:text-white transition-colors`} />
                </div>
                <span className="font-medium text-sm text-primary text-center">{item.label}</span>
                {item.count > 0 && (
                  <span className={`badge badge-${item.color === 'primary' ? 'primary' : item.color === 'accent' ? 'accent' : item.color === 'success' ? 'success' : item.color === 'warning' ? 'warning' : 'danger'}`}>
                    {item.count}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}