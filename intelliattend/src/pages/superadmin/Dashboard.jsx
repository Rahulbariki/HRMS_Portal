import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, Users, DollarSign, Clock,
  ArrowUpRight, ArrowDownRight, Plus,
  CheckCircle, XCircle, AlertCircle,
  CreditCard, Shield, Mail, BarChart3
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const statCards = [
  { title: 'Total Companies', value: '0', change: '+12%', trend: 'up', icon: Building2, color: 'primary', bg: 'primary-light' },
  { title: 'Active Users', value: '0', change: '+8%', trend: 'up', icon: Users, color: 'accent', bg: 'accent-light' },
  { title: 'Revenue (Monthly)', value: '$0', change: '+23%', trend: 'up', icon: DollarSign, color: 'success', bg: 'green-100' },
  { title: 'Pending Requests', value: '0', change: '-5%', trend: 'down', icon: Clock, color: 'warning', bg: 'yellow-100' },
];

const quickActions = [
  { label: 'Add Company', icon: Plus, href: '/superadmin/companies', color: 'primary' },
  { label: 'Create Plan', icon: CreditCard, href: '/superadmin/plan-management', color: 'accent' },
  { label: 'View Transactions', icon: DollarSign, href: '/superadmin/transactions', color: 'success' },
  { label: 'Manage Admins', icon: Users, href: '/superadmin/admin-management', color: 'warning' },
  { label: 'Support Tickets', icon: Mail, href: '/superadmin/support-tickets', color: 'error' },
  { label: 'Audit Logs', icon: Shield, href: '/superadmin/audit-logs', color: 'primary' },
];

const recentActivity = [
  { id: 1, type: 'company_created', title: 'New company registered', description: 'TechCorp Inc. signed up for Enterprise plan', time: '2 hours ago', status: 'success' },
  { id: 2, type: 'payment_received', title: 'Payment received', description: '$12,500 from Global University', time: '4 hours ago', status: 'success' },
  { id: 3, type: 'subdomain_request', title: 'Subdomain request', description: 'New request from Metro School District', time: '6 hours ago', status: 'pending' },
  { id: 4, type: 'support_ticket', title: 'Support ticket created', description: 'Billing inquiry from Client #2847', time: '8 hours ago', status: 'info' },
  { id: 5, type: 'plan_upgrade', title: 'Plan upgraded', description: 'Startup Labs upgraded to Professional', time: '1 day ago', status: 'success' },
];

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(statCards);
  const [loading, setLoading] = useState(() => !(localStorage.getItem('token') || '').startsWith('mock-'));

  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    if (token.startsWith('mock-')) return;
    const fetchStats = async () => {
      try {
        const response = await api.get('/superadmin/dashboard/stats');
        if (response.data?.success) {
          const data = response.data.data;
          setStats([
            { ...statCards[0], value: data.totalCompanies || '0' },
            { ...statCards[1], value: data.activeUsers || '0' },
            { ...statCards[2], value: `$${data.monthlyRevenue || '0'}` },
            { ...statCards[3], value: data.pendingRequests || '0' },
          ]);
        }
      } catch {
        // Retain default stats on error
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
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
          <h1 className="font-display text-2xl font-bold text-primary">Super Admin Dashboard</h1>
          <p className="text-muted mt-1">Welcome back, {user?.name || 'Super Admin'} • Platform Overview</p>
        </div>
        <div className="flex gap-3">
          <Link to="/superadmin/companies" className="btn-primary w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Company
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card-elevated p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted">{stat.title}</p>
                <p className="font-display text-3xl font-bold text-primary mt-1">{loading ? '...' : stat.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className={`h-4 w-4 ${stat.color === 'success' ? 'text-green-500' : stat.color === 'warning' ? 'text-yellow-500' : stat.color === 'accent' ? 'text-teal-500' : 'text-primary'}`} />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${stat.trend === 'up' ? (stat.color === 'success' ? 'text-green-600' : stat.color === 'warning' ? 'text-yellow-600' : stat.color === 'accent' ? 'text-teal-600' : 'text-primary') : 'text-red-600'}`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-muted">vs last month</span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${stat.bg}`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-elevated">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-primary">Quick Actions</h2>
          </div>
          <div className="card-body p-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-6">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.href}
                  className="flex flex-col items-center gap-3 p-4 rounded-xl border border-slate-100 hover:border-primary/50 hover:bg-primary-light/50 transition-all group"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${action.color}-light group-hover:bg-${action.color} group-hover:text-white transition-colors`}>
                    <action.icon className={`h-6 w-6 text-${action.color} group-hover:text-white transition-colors`} />
                  </div>
                  <span className="font-medium text-sm text-primary text-center">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="card-elevated">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-primary">Recent Activity</h2>
            <Link to="/superadmin/audit-logs" className="text-sm text-primary hover:text-primary-hover font-medium">View all</Link>
          </div>
          <div className="card-body p-0">
            <div className="divide-y divide-slate-100">
              {recentActivity.map((activity) => (
                <Link
                  key={activity.id}
                  to="/superadmin/audit-logs"
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
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card-elevated">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-primary">Revenue Overview</h2>
            <select className="input-field w-auto px-3 py-1.5 text-sm">
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>Last year</option>
            </select>
          </div>
          <div className="card-body">
            <div className="h-64 flex items-center justify-center">
              <div className="text-center text-muted">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Revenue chart placeholder</p>
                <p className="text-sm mt-1">Connect to analytics service</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card-elevated">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-primary">Platform Health</h2>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium text-primary">API Status</span>
                </div>
                <span className="badge badge-success">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium text-primary">Database</span>
                </div>
                <span className="badge badge-success">Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span className="text-sm font-medium text-primary">Email Service</span>
                </div>
                <span className="badge badge-warning">Degraded</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium text-primary">Storage</span>
                </div>
                <span className="text-sm text-muted">67% used</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}