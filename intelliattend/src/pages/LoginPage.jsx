import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Shield, Building2, Briefcase, User, Eye, EyeOff, Mail,
  Lock, AlertCircle, CheckCircle, ArrowRight, Sparkles
} from 'lucide-react';
import { useAuth, DEMO_USERS } from '../contexts/AuthContext';
import clsx from 'clsx';

const ROLES_INFO = [
  {
    role: 'superadmin',
    title: 'Super Admin',
    desc: 'Platform management, companies & subscriptions',
    email: 'rahulbariki.intelliattend@gmail.com',
    icon: Shield,
    badgeColor: 'bg-slate-900 text-teal-300 border-slate-700',
    iconBg: 'bg-slate-900 dark:bg-slate-800 text-teal-400',
  },
  {
    role: 'employee',
    title: 'Employee',
    desc: 'Self-service leaves, attendance, ID card & salary',
    email: 'employee.intelliattend@gmail.com',
    icon: User,
    badgeColor: 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    iconBg: 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400',
  },
  {
    role: 'manager',
    title: 'Manager',
    desc: 'Team attendance, leaves, tasks & approvals',
    email: 'manager.intelliattend@gmail.com',
    icon: Briefcase,
    badgeColor: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
  },
  {
    role: 'client',
    title: 'Client / Admin',
    desc: 'Company management, policies & managers',
    email: 'clientadmin.intelliattend@gmail.com',
    icon: Building2,
    badgeColor: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    iconBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const [selectedRole, setSelectedRole] = useState('superadmin');
  const [formData, setFormData] = useState({
    email: 'rahulbariki.intelliattend@gmail.com',
    password: 'password123',
    remember: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    const target = ROLES_INFO.find(r => r.role === roleKey);
    if (target) {
      setFormData(prev => ({
        ...prev,
        email: target.email,
      }));
    }
    setError('');
  };

  const handleQuickDemoLogin = async (roleKey) => {
    setError('');
    setLoading(true);
    try {
      const demoUser = DEMO_USERS[roleKey];
      const result = await login({
        email: demoUser?.email,
        password: 'password123',
        role: roleKey,
      });

      if (result.success) {
        setSuccess(`Logged in as ${result.user?.name || roleKey}! Redirecting...`);
        const targetPath = roleKey === 'superadmin' ? '/superadmin/dashboard'
          : roleKey === 'client' ? '/client/dashboard'
          : roleKey === 'manager' ? '/manager/dashboard'
          : '/employee/dashboard';
        setTimeout(() => {
          navigate(targetPath, { replace: true });
        }, 500);
      } else {
        setError(result.message || 'Login failed');
      }
    } catch {
      setError('An error occurred during sign-in.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const emailTrimmed = (formData.email || '').toLowerCase().trim();
    if (!emailTrimmed.endsWith('.intelliattend@gmail.com') && !emailTrimmed.endsWith('@intelliattend.com')) {
      setError('Invalid login format. Logins are strictly restricted to *.intelliattend@gmail.com (e.g. rahulbariki.intelliattend@gmail.com).');
      return;
    }

    setLoading(true);

    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
        role: selectedRole,
        remember: formData.remember,
      });

      if (result.success) {
        setSuccess('Authentication successful! Loading portal...');
        const userRole = result.user?.role || selectedRole;
        const targetPath = userRole === 'superadmin' ? '/superadmin/dashboard'
          : userRole === 'client' ? '/client/dashboard'
          : userRole === 'manager' ? '/manager/dashboard'
          : '/employee/dashboard';
        setTimeout(() => {
          navigate(redirectTo !== '/dashboard' ? redirectTo : targetPath, { replace: true });
        }, 500);
      } else {
        setError(result.message || 'Invalid credentials. Please try again.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-5 py-2.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <img src="/logo.png" alt="IntelliAttend Logo" className="h-10 w-auto object-contain" />
            <div className="text-left">
              <h1 className="font-display font-extrabold text-xl text-slate-900 dark:text-white tracking-tight leading-none">
                IntelliAttend
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Enterprise HRMS Portal</p>
            </div>
          </div>
        </div>

        <h2 className="text-center font-display text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
          Sign In to Your Workspace
        </h2>
        <p className="mt-1 text-center text-sm text-slate-500 dark:text-slate-400">
          Select your portal role below or sign in with your enterprise credentials
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-2xl">
        {/* Quick Access Bar */}
        <div className="mb-6 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-teal-500" />
              Enterprise Portals (1-Click Direct Access)
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Production Credentials</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {ROLES_INFO.map((item) => (
              <button
                key={item.role}
                type="button"
                onClick={() => handleQuickDemoLogin(item.role)}
                disabled={loading}
                className={clsx(
                  'group flex flex-col items-center text-center p-3 rounded-xl border transition-all text-xs font-medium cursor-pointer',
                  selectedRole === item.role
                    ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 shadow-sm ring-1 ring-teal-500/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900'
                )}
              >
                <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center mb-2 shadow-sm transition-transform group-hover:scale-105', item.iconBg)}>
                  <item.icon className="h-4 w-4" />
                </div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">{item.title.split('/')[0]}</span>
                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium mt-0.5">Click to enter →</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Login Card */}
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-slate-200 dark:border-slate-800">
          {success && (
            <div className="mb-6 flex items-center gap-3 p-4 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl text-teal-900 dark:text-teal-300 text-sm">
              <CheckCircle className="h-5 w-5 flex-shrink-0 text-teal-600 dark:text-teal-400" />
              <span className="font-medium">{success}</span>
            </div>
          )}

          {error && (
            <div className="mb-6 flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-300 text-sm">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-600 dark:text-rose-400" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Role selector tabs */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Select Target Role
            </label>
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl text-xs font-semibold">
              {ROLES_INFO.map(r => (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => handleRoleSelect(r.role)}
                  className={clsx(
                    'py-2 px-1 text-center rounded-lg transition-all cursor-pointer',
                    selectedRole === r.role
                      ? 'bg-slate-900 dark:bg-teal-600 text-teal-300 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  {r.title.split('/')[0].trim()}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <span className="text-[10px] font-mono text-teal-950 dark:text-teal-300 font-bold bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                  *.intelliattend@gmail.com
                </span>
              </div>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  placeholder="rahulbariki.intelliattend@gmail.com"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  name="remember"
                  type="checkbox"
                  checked={formData.remember}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-slate-900 dark:text-teal-500 focus:ring-teal-500"
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">Keep me signed in</span>
              </label>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Production Live
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In as {ROLES_INFO.find(r => r.role === selectedRole)?.title || 'User'}</span>
                  <ArrowRight className="h-4 w-4 text-teal-400 dark:text-white" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <Link to="/verify-employee" className="hover:text-teal-600 dark:hover:text-teal-400 font-medium">
              Verify Employee Account
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/company-login" className="hover:text-teal-600 dark:hover:text-teal-400 font-medium">
                Client Portal Login
              </Link>
              <span>•</span>
              <Link to="/superadmin/login" className="hover:text-teal-600 dark:hover:text-teal-400 font-medium">
                Super Admin Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}