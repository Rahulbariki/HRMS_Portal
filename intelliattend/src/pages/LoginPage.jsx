import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
        remember: formData.remember,
      });

      if (result.success) {
        setSuccess('Authentication successful! Loading workspace...');
        const userRole = result.user?.role;
        const targetPath = userRole === 'superadmin' ? '/superadmin/dashboard'
          : userRole === 'client' ? '/client/dashboard'
          : userRole === 'manager' ? '/manager/dashboard'
          : userRole === 'payroll_admin' ? '/payroll-admin/dashboard'
          : '/employee/dashboard';
        setTimeout(() => {
          navigate(redirectTo !== '/dashboard' ? redirectTo : targetPath, { replace: true });
        }, 400);
      } else {
        setError(result.message || 'Invalid credentials. Please try again.');
      }
    } catch {
      setError('An error occurred during authentication. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
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
          Enter your corporate credentials to access your workspace
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
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
                  placeholder="e.g. rahulbariki.intelliattend@gmail.com"
                  disabled={loading}
                  autoComplete="email"
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
                  autoComplete="current-password"
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
                  <span>Sign In</span>
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
