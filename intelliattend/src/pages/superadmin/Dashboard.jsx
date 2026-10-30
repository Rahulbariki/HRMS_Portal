import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, Users, IndianRupee, Clock,
  ArrowUpRight, ArrowDownRight, Plus,
  CheckCircle, XCircle, AlertCircle,
  CreditCard, Shield, Mail, BarChart3, ChevronRight
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const statCardsConfig = [
  { 
    title: 'Total Companies', 
    value: '3', 
    change: '+12%', 
    trend: 'up', 
    icon: Building2, 
    colorClass: 'text-indigo-600 dark:text-indigo-400',
    bgClass: 'bg-indigo-50 dark:bg-indigo-950/40' 
  },
  { 
    title: 'Active Users', 
    value: '4', 
    change: '+8%', 
    trend: 'up', 
    icon: Users, 
    colorClass: 'text-teal-600 dark:text-teal-400',
    bgClass: 'bg-teal-50 dark:bg-teal-950/40' 
  },
  { 
    title: 'Revenue (Monthly)', 
    value: '₹1,50,000', 
    change: '+23%', 
    trend: 'up', 
    icon: IndianRupee, 
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/40' 
  },
  { 
    title: 'Pending Requests', 
    value: '0', 
    change: '-5%', 
    trend: 'down', 
    icon: Clock, 
    colorClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-50 dark:bg-amber-950/40' 
  },
];

const quickActions = [
  { label: 'Manage Companies', icon: Building2, href: '/superadmin/companies', colorClass: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' },
  { label: 'Plan Management', icon: CreditCard, href: '/superadmin/plan-management', colorClass: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400' },
  { label: 'Transactions', icon: IndianRupee, href: '/superadmin/transactions', colorClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' },
  { label: 'Admin Directory', icon: Users, href: '/superadmin/admin-management', colorClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' },
  { label: 'Support Tickets', icon: Mail, href: '/superadmin/support-tickets', colorClass: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400' },
  { label: 'Security Audit Logs', icon: Shield, href: '/superadmin/audit-logs', colorClass: 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400' },
];

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(statCardsConfig);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [auditStatus, setAuditStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'

  useEffect(() => {
    const fetchSuperAdminStats = async () => {
      try {
        setLoading(true);
        setAuditStatus('loading');
        const [res, auditRes] = await Promise.allSettled([
          api.get('/superadmin/dashboard/stats'),
          api.get('/superadmin/audit-logs')
        ]);

        if (res.status === 'fulfilled' && res.value.data?.success && res.value.data.data) {
          const d = res.value.data.data;
          setStats([
            {
              title: 'Total Companies',
              value: String(d.totalCompanies || '3'),
              change: '+12%',
              trend: 'up',
              icon: Building2,
              colorClass: 'text-indigo-600 dark:text-indigo-400',
              bgClass: 'bg-indigo-50 dark:bg-indigo-950/40'
            },
            {
              title: 'Active Users',
              value: String(d.activeUsers || '4'),
              change: '+8%',
              trend: 'up',
              icon: Users,
              colorClass: 'text-teal-600 dark:text-teal-400',
              bgClass: 'bg-teal-50 dark:bg-teal-950/40'
            },
            {
              title: 'Revenue (Monthly)',
              value: d.monthlyRevenue || '₹16,490.00',
              change: '+23%',
              trend: 'up',
              icon: IndianRupee,
              colorClass: 'text-emerald-600 dark:text-emerald-400',
              bgClass: 'bg-emerald-50 dark:bg-emerald-950/40'
            },
            {
              title: 'Pending Requests',
              value: String(d.pendingRequests || '0'),
              change: '-5%',
              trend: 'down',
              icon: Clock,
              colorClass: 'text-amber-600 dark:text-amber-400',
              bgClass: 'bg-amber-50 dark:bg-amber-950/40'
            },
          ]);
        }

        if (auditRes.status === 'fulfilled' && auditRes.value.data?.success && Array.isArray(auditRes.value.data.data)) {
          const raw = auditRes.value.data.data.slice(0, 5).map((l) => ({
            id: l.id,
            title: l.action || 'System Audit Event',
            description: l.details || `${l.user_email || 'System'} event`,
            time: l.created_at ? new Date(l.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : 'Recent',
            status: 'success'
          }));
          setActivities(raw);
          setAuditStatus('success');
        } else {
          setAuditStatus('error');
        }
      } catch (err) {
        console.error('Failed to load superadmin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSuperAdminStats();
  }, []);


  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-amber-500" />;
      case 'info': return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default: return <XCircle className="h-4 w-4 text-rose-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">SuperAdmin Control Plane</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Welcome back, <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.name || 'Rahul Bariki'}</span> • Multi-tenant Infrastructure & Subscriptions
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/superadmin/companies"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Provision Tenant
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.title}</p>
                <p className="font-display text-3xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
                    <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                    {stat.change}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">vs last cycle</span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bgClass} ${stat.colorClass}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle Row: Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-white mb-5">
            Operational Workflows
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={index}
                  to={action.href}
                  className="flex flex-col items-center gap-3 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-all group text-center cursor-pointer"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${action.colorClass}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">
                    {action.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Platform Events */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">Audit & Events</h2>
            <Link to="/superadmin/audit-logs" className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline">
              View All
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3.5 p-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="mt-0.5">{getStatusIcon(activity.status)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs text-slate-900 dark:text-white">{activity.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{activity.description}</p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">{activity.time}</span>
                  </div>
                </div>
              ))
            ) : auditStatus === 'loading' ? (
              <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
                Loading audit events...
              </div>
            ) : auditStatus === 'error' ? (
              <div className="p-8 text-center text-xs text-rose-500 dark:text-rose-400">
                Failed to load audit events.
              </div>
            ) : auditStatus === 'success' ? (
              <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
                No recent security audit events recorded.
              </div>
            ) : null}
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 text-center">
            Neon Serverless PostgreSQL • Branch Main
          </div>
        </div>
      </div>
    </div>
  );
}