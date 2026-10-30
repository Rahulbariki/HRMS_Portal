import { Menu, Moon, Sun, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';
import clsx from 'clsx';

export default function Header({ user, onToggleSidebar }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [avatarError, setAvatarError] = useState(false);
  const profileRef = useRef(null);

  const avatarSrc = user?.avatarUrl || (typeof user?.avatar === 'string' && (user.avatar.startsWith('http') || user.avatar.startsWith('/') || user.avatar.startsWith('data:')) ? user.avatar : null);

  useEffect(() => {
    setAvatarError(false);
  }, [avatarSrc]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    const rolePrefix = user?.role === 'payroll_admin' ? 'payroll-admin' : (user?.role || 'employee');

  return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleLabel = (role) => {
    const labels = {
      superadmin: 'Super Admin',
      client: 'Client Admin',
      manager: 'Manager',
      payroll_admin: 'Payroll Admin',
      employee: 'Employee',
    };
    return labels[role] || role;
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'superadmin': return 'bg-slate-900 dark:bg-slate-800 text-teal-300 border-slate-700';
      case 'client': return 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'manager': return 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800';
      case 'payroll_admin': return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'HR';
  };

  const rolePrefix = user?.role === 'payroll_admin' ? 'payroll-admin' : (user?.role || 'employee');

  return (
    <header className="h-16 shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-6 z-30 transition-colors">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <Link to="/dashboard" className="hidden lg:flex items-center gap-3">
          <img src="/logo.png" alt="IntelliAttend Logo" className="h-8 w-auto rounded-lg object-contain" />
          <div>
            <span className="font-display font-bold text-lg text-slate-900 dark:text-white leading-none block">
              IntelliAttend
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase">HRMS Portal</span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-2 lg:gap-3">
        {/* Role Badge */}
        {user?.role && (
          <div
            className={clsx(
              'hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-2xs',
              getRoleBadgeClass(user?.role)
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
            <span>{getRoleLabel(user?.role)}</span>
          </div>
        )}

        {/* Notifications Bell */}
        <NotificationBell />

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
          aria-label="Toggle theme"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-amber-400" />}
        </button>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="User menu"
          >
            {avatarSrc && !avatarError ? (
              <img
                src={avatarSrc}
                alt={user?.name || 'User'}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-teal-600 text-teal-300 dark:text-white font-bold flex items-center justify-center text-xs border border-teal-500/20">
                {getInitials(user?.name)}
              </div>
            )}
            <div className="hidden md:block text-left">
              <p className="font-semibold text-xs text-slate-800 dark:text-slate-200 leading-tight">{user?.name || 'User'}</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight">{getRoleLabel(user?.role)}</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden md:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in-0 zoom-in-95">
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                <p className="font-semibold text-xs text-slate-900 dark:text-white">{user?.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                <span className={clsx('inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold border', getRoleBadgeClass(user?.role))}>
                  {getRoleLabel(user?.role)}
                </span>
              </div>
              <Link
                to={`/${rolePrefix}/profile`}
                className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                onClick={() => setProfileOpen(false)}
              >
                <User className="h-3.5 w-3.5" />
                Profile Details
              </Link>
              <Link
                to={`/${rolePrefix}/settings`}
                className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                onClick={() => setProfileOpen(false)}
              >
                <Settings className="h-3.5 w-3.5" />
                Portal Settings
              </Link>
              <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors font-medium cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}