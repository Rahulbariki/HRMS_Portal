import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileCheck, IndianRupee, HelpCircle, Settings, User, Building2, ChevronRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const pages = [
  { label: 'Department Managers', path: '/client/managers', icon: Users, desc: 'Manage departmental supervisors', colorClass: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' },
  { label: 'Corporate Policies', path: '/client/policies', icon: FileCheck, desc: 'Draft and enforce compliance', colorClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' },
  { label: 'Subscriptions & Billing', path: '/client/billings', icon: IndianRupee, desc: 'Invoice history & seat licensing', colorClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' },
  { label: 'Priority Support', path: '/client/support', icon: HelpCircle, desc: 'Enterprise support & SLAs', colorClass: 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400' },
  { label: 'Organization Settings', path: '/client/settings', icon: Settings, desc: 'Company parameters & branding', colorClass: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400' },
  { label: 'Executive Profile', path: '/client/profile', icon: User, desc: 'KYC & primary administrator details', colorClass: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400' },
];

export default function ClientDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    supervisedManagers: 1,
    totalEmployees: 1,
    activePolicies: 4,
    unresolvedTickets: 1,
    planLicense: 'Enterprise Tier',
    planStatus: 'Active',
    supportStatus: '1 Open Query'
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/client/dashboard-stats');
        if (res.data?.success && res.data.data) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load client stats:', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Tenant Administrator Console</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Welcome back, <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.name || 'Alex Rivera'}</span> • TechCorp Solutions India
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Supervised Managers</p>
            <p className="font-display text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.supervisedManagers}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Assigned departments</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Policies</p>
            <p className="font-display text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.activePolicies}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Enforced compliance docs</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Plan License</p>
            <p className="font-display text-xl font-bold text-slate-900 dark:text-white mt-2">{stats.planLicense}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 font-semibold">{stats.planStatus}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <IndianRupee className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Support Status</p>
            <p className="font-display text-xl font-bold text-teal-600 dark:text-teal-400 mt-2">{stats.supportStatus}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{stats.unresolvedTickets} unresolved tickets</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>
      </div>


      {/* Pages Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <h2 className="font-display text-base font-bold text-slate-900 dark:text-white mb-5">
          Client Workspace Management
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