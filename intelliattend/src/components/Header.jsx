import { Menu, Moon, Sun, LogOut, User, Settings, ChevronDown, RefreshCw } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, DEMO_USERS } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';
import clsx from 'clsx';

export default function Header({ user, onToggleSidebar }) {
  const navigate = useNavigate();
  const { logout, switchRole } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const profileRef = useRef(null);
  const roleRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target)) {
        setRoleSwitcherOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSwitchRole = (roleKey) => {
    switchRole(roleKey);
    setRoleSwitcherOpen(false);
    const targetPath = roleKey === 'superadmin' ? '/superadmin/dashboard'
      : roleKey === 'client' ? '/client/dashboard'
      : roleKey === 'manager' ? '/manager/dashboard'
      : '/employee/dashboard';
    navigate(targetPath);
  };

  const getRoleLabel = (role) => {
    const labels = {
      superadmin: 'Super Admin',
      client: 'Client Admin',
      manager: 'Manager',
      employee: 'Employee',
    };
    return labels[role] || role;
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'superadmin': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'client': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'manager': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'HR';
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-700"
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <Link to="/dashboard" className="hidden lg:flex items-center gap-3">
          <img src="/logo.svg" alt="HRMS Logo" className="h-8 w-auto rounded-lg" />
          <div>
            <span className="font-display font-bold text-lg text-slate-900 leading-none block">
              HRMS Portal
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Enterprise Management</span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-2 lg:gap-3">
        {/* Quick Role Switcher for Development / Review */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all',
              getRoleBadgeClass(user?.role)
            )}
            title="Switch Portal Role"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Role: {getRoleLabel(user?.role)}</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>

          {roleSwitcherOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in-0 zoom-in-95">
              <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Switch Portal Role
              </div>
              {Object.keys(DEMO_USERS).map((key) => {
                const isActive = user?.role === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleSwitchRole(key)}
                    className={clsx(
                      'w-full text-left px-3 py-2 flex items-center justify-between text-xs transition-colors',
                      isActive ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    <span>{getRoleLabel(key)}</span>
                    {isActive && <span className="text-[10px] bg-indigo-200 text-indigo-800 px-1.5 py-0.5 rounded">Active</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <NotificationBell />

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="User menu"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs border border-indigo-200">
              {getInitials(user?.name)}
            </div>
            <div className="hidden md:block text-left">
              <p className="font-semibold text-xs text-slate-800 leading-tight">{user?.name || 'User'}</p>
              <p className="text-[11px] text-slate-400 leading-tight">{getRoleLabel(user?.role)}</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden md:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in-0 zoom-in-95">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="font-semibold text-xs text-slate-900">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <span className={clsx('inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold border', getRoleBadgeClass(user?.role))}>
                  {getRoleLabel(user?.role)}
                </span>
              </div>
              <Link
                to={`/${user?.role}/profile`}
                className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                onClick={() => setProfileOpen(false)}
              >
                <User className="h-3.5 w-3.5" />
                Profile Details
              </Link>
              <Link
                to={`/${user?.role}/settings`}
                className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                onClick={() => setProfileOpen(false)}
              >
                <Settings className="h-3.5 w-3.5" />
                Portal Settings
              </Link>
              <div className="border-t border-slate-100 my-1"></div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors font-medium"
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