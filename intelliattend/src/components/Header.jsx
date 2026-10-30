import { Menu, Moon, Sun, LogOut, User, Settings, ChevronDown, Palette, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';
import clsx from 'clsx';

const ACCENT_COLORS = [
  { id: 'teal', name: 'Default Teal', hex: '#0D9488', hover: '#0F766E', light: '#F0FDFA', darkLight: '#134E4A' },
  { id: 'amber', name: 'Warm Amber (SHNOOR)', hex: '#D97706', hover: '#B45309', light: '#FEF3C7', darkLight: '#78350F' },
  { id: 'indigo', name: 'Corporate Indigo', hex: '#4F46E5', hover: '#4338CA', light: '#EEF2FF', darkLight: '#312E81' },
  { id: 'blue', name: 'Ocean Blue', hex: '#0284C7', hover: '#0369A1', light: '#F0F9FF', darkLight: '#0C4A6E' },
  { id: 'emerald', name: 'Vibrant Emerald', hex: '#059669', hover: '#047857', light: '#ECFDF5', darkLight: '#064E3B' },
  { id: 'rose', name: 'Executive Rose', hex: '#E11D48', hover: '#BE123C', light: '#FFF1F2', darkLight: '#881337' },
  { id: 'purple', name: 'Royal Purple', hex: '#7C3AED', hover: '#6D28D9', light: '#F5F3FF', darkLight: '#4C1D95' },
];

export default function Header({ user, onToggleSidebar }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [currentAccentId, setCurrentAccentId] = useState(() => localStorage.getItem('hrms_accent_color') || 'teal');
  const [avatarError, setAvatarError] = useState(false);
  const profileRef = useRef(null);
  const paletteRef = useRef(null);

  const avatarSrc = user?.avatarUrl || (typeof user?.avatar === 'string' && (user.avatar.startsWith('http') || user.avatar.startsWith('/') || user.avatar.startsWith('data:')) ? user.avatar : null);

  useEffect(() => {
    setAvatarError(false);
  }, [avatarSrc]);

  const applyAccentColor = (accent, currentTheme = theme) => {
    const root = document.documentElement;
    root.style.setProperty('--color-accent', accent.hex);
    root.style.setProperty('--color-accent-hover', accent.hover);
    const lightVal = currentTheme === 'dark' ? (accent.darkLight || accent.light) : accent.light;
    root.style.setProperty('--color-accent-light', lightVal);
    localStorage.setItem('hrms_accent_color', accent.id);
  };

  useEffect(() => {
    const savedAccentId = localStorage.getItem('hrms_accent_color') || 'teal';
    const found = ACCENT_COLORS.find(c => c.id === savedAccentId) || ACCENT_COLORS[0];
    setCurrentAccentId(found.id);
    applyAccentColor(found, theme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    const found = ACCENT_COLORS.find(c => c.id === currentAccentId) || ACCENT_COLORS[0];
    applyAccentColor(found, theme);
  }, [theme, currentAccentId]);

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
      if (paletteRef.current && !paletteRef.current.contains(e.target)) {
        setPaletteOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
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

        {/* Accent Color Palette Switcher */}
        <div className="relative" ref={paletteRef}>
          <button
            onClick={() => setPaletteOpen(!paletteOpen)}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
            aria-label="Change Accent Color Theme"
            title="Custom Accent Color Theme"
          >
            <Palette className="h-4 w-4" />
          </button>

          {paletteOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-3 z-50 animate-in fade-in-0 zoom-in-95">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-1">
                Corporate Accent Theme
              </p>
              <div className="space-y-1">
                {ACCENT_COLORS.map((c) => {
                  const isSelected = c.id === currentAccentId;
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setCurrentAccentId(c.id);
                        applyAccentColor(c, theme);
                        setPaletteOpen(false);
                      }}
                      className={clsx(
                        'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer',
                        isSelected
                          ? 'bg-slate-100 dark:bg-slate-800 font-semibold text-slate-900 dark:text-white'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full ring-2 ring-white dark:ring-slate-900 shrink-0 shadow-xs"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="truncate">{c.name}</span>
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

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