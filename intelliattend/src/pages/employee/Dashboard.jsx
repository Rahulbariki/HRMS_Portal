import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock, Play, Square, Coffee, UserCheck, Calendar, CalendarDays,
  CheckCircle2, AlertCircle, XCircle, Plus, Search, ArrowRight,
  ChevronRight, Cake, Gift, Building2, Sparkles, ShieldCheck,
  FileText, ClipboardList, HelpCircle, IndianRupee, Award,
  FolderOpen, Newspaper, LogOut, Settings
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const menuItems = [
  { label: 'Leaves', path: '/employee/leaves', icon: Calendar, color: 'emerald', count: 3, desc: 'Balance & apply' },
  { label: 'Tasks', path: '/employee/tasks', icon: ClipboardList, color: 'indigo', count: 5, desc: 'Active sprint tasks' },
  { label: 'Attendance', path: '/employee/attendance', icon: UserCheck, color: 'teal', count: 0, desc: 'Logs & regularize' },
  { label: 'Expenses', path: '/employee/expenses', icon: IndianRupee, color: 'amber', count: 2, desc: 'Claims & receipts' },
  { label: 'Salary', path: '/employee/salary', icon: Award, color: 'purple', count: 0, desc: 'Payslips & CTC' },
  { label: 'Policies', path: '/employee/policies', icon: FileText, color: 'blue', count: 0, desc: 'HR compliance' },
  { label: 'Documents', path: '/employee/documents', icon: FolderOpen, color: 'emerald', count: 0, desc: 'Official repository' },
  { label: 'News', path: '/employee/news', icon: Newspaper, color: 'sky', count: 0, desc: 'Company circulars' },
  { label: 'Holidays', path: '/employee/holidays', icon: Calendar, color: 'rose', count: 0, desc: '2026 Calendar' },
  { label: 'Offboarding', path: '/employee/offboarding', icon: LogOut, color: 'rose', count: 0, desc: 'Exit formalities' },
  { label: 'Letters', path: '/employee/letters', icon: FileText, color: 'cyan', count: 0, desc: 'Offer & credentials' },
  { label: 'Support', path: '/employee/support-query', icon: HelpCircle, color: 'amber', count: 0, desc: 'Helpdesk & tickets' },
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

const defaultAttendanceSummary = [
  { label: 'Present', value: '0', color: 'success' },
  { label: 'Absent', value: '0', color: 'error' },
  { label: 'Late', value: '0', color: 'warning' },
  { label: 'WFH', value: '0', color: 'accent' },
];

const recentActivities = [
  { type: 'punch', title: 'Daily Attendance Recorded', description: 'Clock-in verified at 10:02 AM • General Day Shift', time: '10:02 AM', status: 'success' },
  { type: 'leave', title: 'Casual Leave Request Approved', description: 'Approved by Engineering Manager David Chen', time: 'Yesterday', status: 'success' },
  { type: 'task', title: 'Sprint Task Assigned', description: 'Assigned "Implement Cloudinary Attachment Pipeline"', time: '2 days ago', status: 'pending' },
  { type: 'system', title: 'Portal Workspace Live', description: 'Enterprise deployment initialized on Neon PostgreSQL', time: '3 days ago', status: 'info' }
];

const isBirthdayInCurrentWeek = (dobString) => {
  if (!dobString) return false;
  const birthDate = new Date(dobString);
  if (isNaN(birthDate.getTime())) return false;

  const now = new Date();
  const currentDay = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - currentDay);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const thisYearBirthday = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate());
  if (thisYearBirthday >= startOfWeek && thisYearBirthday <= endOfWeek) {
    return true;
  }
  const nextYearBirthday = new Date(now.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate());
  if (nextYearBirthday >= startOfWeek && nextYearBirthday <= endOfWeek) {
    return true;
  }
  const prevYearBirthday = new Date(now.getFullYear() - 1, birthDate.getMonth(), birthDate.getDate());
  if (prevYearBirthday >= startOfWeek && prevYearBirthday <= endOfWeek) {
    return true;
  }
  return false;
};

const formatBirthdayDate = (dobString) => {
  const d = new Date(dobString);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(
    new Date(new Date().getFullYear(), d.getMonth(), d.getDate())
  );
};

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const userId = user?.employeeId || user?.id || null;
  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'there';
  const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || 'Employee' : 'Employee';

  // State for live punch & attendance
  const [clockedIn, setClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState('—');
  const [clockOutTime, setClockOutTime] = useState('—');
  const [workSeconds, setWorkSeconds] = useState(0);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakStart, setBreakStart] = useState(null);
  const [breakSeconds, setBreakSeconds] = useState(0);
  const [punchLoading, setPunchLoading] = useState(false);
  const [punchFeedback, setPunchFeedback] = useState('');

  // Attendance history logs, summary & search query
  const [attendanceSummary, setAttendanceSummary] = useState(defaultAttendanceSummary);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Leave balances
  const [leaveBalances, setLeaveBalances] = useState({
    casual: 12,
    casualUsed: 0,
    sick: 12,
    sickUsed: 0,
    annual: 15,
    annualUsed: 0,
    unpaid: 1
  });

  // Coworker birthdays
  const [birthdays, setBirthdays] = useState([]);

  // Current formatted time & date
  const [currentClock, setCurrentClock] = useState(() => new Date().toLocaleTimeString('en-US', { hour12: false }));

  // Load initial data from APIs
  useEffect(() => {
    if (!userId) return;
    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        const [todayRes, logsRes, leavesRes, summaryRes, directoryRes] = await Promise.allSettled([
          api.get(`/attendance/today?userId=${userId}`),
          api.get(`/attendance/logs?userId=${userId}`),
          api.get(`/employee/leaves/balance?userId=${userId}`),
          api.get(`/employee/attendance/summary?userId=${userId}`),
          api.get('/users/directory')
        ]);

        if (!isMounted) return;

        if (todayRes.status === 'fulfilled' && todayRes.value?.data?.success && todayRes.value?.data?.data) {
          const d = todayRes.value.data.data;
          setClockedIn(Boolean(d.clockedIn));
          setClockInTime(d.clockInTime || '—');
          setClockOutTime(d.clockOutTime || '—');
          setWorkSeconds(Number(d.workSeconds) || 0);
        }

        if (logsRes.status === 'fulfilled' && logsRes.value?.data?.success && Array.isArray(logsRes.value?.data?.data)) {
          setAttendanceLogs(logsRes.value.data.data);
        }

        if (summaryRes.status === 'fulfilled' && summaryRes.value?.data?.success && Array.isArray(summaryRes.value?.data?.data)) {
          setAttendanceSummary(summaryRes.value.data.data);
        }

        if (leavesRes.status === 'fulfilled' && leavesRes.value?.data?.success && leavesRes.value?.data?.data) {
          const lb = leavesRes.value.data.data;
          const casualVal = lb.casual ?? lb.casual_leave ?? 12;
          const casualUsedVal = lb.casual_used ?? lb.casualUsed ?? 0;
          const sickVal = lb.sick ?? lb.sick_leave ?? 12;
          const sickUsedVal = lb.sick_used ?? lb.sickUsed ?? 0;
          const annualVal = lb.annual ?? lb.paid_leave ?? 15;
          const annualUsedVal = lb.annual_used ?? lb.annualUsed ?? 0;
          const unpaidVal = lb.unpaid ?? lb.unpaid_leave ?? 1;

          setLeaveBalances({
            casual: Number(casualVal),
            casualUsed: Number(casualUsedVal),
            sick: Number(sickVal),
            sickUsed: Number(sickUsedVal),
            annual: Number(annualVal),
            annualUsed: Number(annualUsedVal),
            unpaid: Number(unpaidVal)
          });
        }

        if (directoryRes.status === 'fulfilled' && directoryRes.value?.data?.success && Array.isArray(directoryRes.value?.data?.data)) {
          const staff = directoryRes.value.data.data;
          const upcoming = [];
          for (const s of staff) {
            const rawDob = s.dob || s.birthday || s.dateOfBirth || s.date_of_birth;
            if (rawDob && isBirthdayInCurrentWeek(rawDob)) {
              const fName = s.firstName || s.first_name || '';
              const lName = s.lastName || s.last_name || '';
              const fullNameStr = `${fName} ${lName}`.trim() || s.name || 'Team Member';
              const initials = `${(fName || 'U')[0]}${(lName || 'M')[0]}`.toUpperCase();
              upcoming.push({
                name: fullNameStr,
                role: s.designation || s.role || 'Employee',
                department: s.department || 'Engineering',
                date: formatBirthdayDate(rawDob),
                initials
              });
            }
          }
          setBirthdays(upcoming);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };

    loadDashboardData();

    // Timer tick every second
    const timer = setInterval(() => {
      setCurrentClock(new Date().toLocaleTimeString('en-US', { hour12: false }));
      if (clockedIn && !isOnBreak) {
        setWorkSeconds((prev) => prev + 1);
      } else if (isOnBreak) {
        setBreakSeconds((prev) => prev + 1);
      }
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [userId, clockedIn, isOnBreak]);

  // Formatter helpers
  const formatSeconds = (sec) => {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const formatShortHours = (sec) => {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Toggle Clock-In / Clock-Out
  const handlePunchToggle = async () => {
    if (!userId) return;
    setPunchLoading(true);
    setPunchFeedback('');
    try {
      const mode = clockedIn ? 'clock_out' : 'clock_in';
      const res = await api.post('/attendance/punch', {
        userId,
        mode,
        latitude: 17.3850,
        longitude: 78.4867
      });

      if (res.data?.success) {
        if (!clockedIn) {
          setClockedIn(true);
          const nowStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
          setClockInTime(nowStr);
          setPunchFeedback('Successfully clocked in for today!');
        } else {
          setClockedIn(false);
          setIsOnBreak(false);
          const nowStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
          setClockOutTime(nowStr);
          setPunchFeedback('Successfully clocked out. Great work today!');
        }

        // Refresh logs & summary in its own isolated try/catch
        try {
          const [logsRes, summaryRes] = await Promise.allSettled([
            api.get(`/attendance/logs?userId=${userId}`),
            api.get(`/employee/attendance/summary?userId=${userId}`)
          ]);
          if (logsRes.status === 'fulfilled' && logsRes.value?.data?.success && Array.isArray(logsRes.value?.data?.data)) {
            setAttendanceLogs(logsRes.value.data.data);
          }
          if (summaryRes.status === 'fulfilled' && summaryRes.value?.data?.success && Array.isArray(summaryRes.value?.data?.data)) {
            setAttendanceSummary(summaryRes.value.data.data);
          }
        } catch (refreshErr) {
          console.error('Failed to refresh attendance logs:', refreshErr);
        }
      }
    } catch (err) {
      console.error('Punch error:', err);
      setPunchFeedback(err.response?.data?.message || 'Failed to record punch. Please try again.');
    } finally {
      setPunchLoading(false);
    }
  };

  // Toggle Break
  const handleBreakToggle = () => {
    if (!clockedIn) return;
    if (!isOnBreak) {
      setIsOnBreak(true);
      setBreakStart(new Date());
    } else {
      setIsOnBreak(false);
      setBreakStart(null);
    }
  };

  // Progress percentage (standard shift: 10:00 AM to 7:00 PM = 9 hours = 32400 seconds)
  const shiftProgress = Math.min(100, Math.round((workSeconds / 32400) * 100));

  // Filtered attendance records for search
  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return attendanceLogs.slice(0, 5);
    const q = searchQuery.toLowerCase();
    return attendanceLogs.filter((log) => {
      const dateMatch = (log.punch_date || log.punchDate || '').toLowerCase().includes(q);
      const statusMatch = (log.status || '').toLowerCase().includes(q);
      return dateMatch || statusMatch;
    });
  }, [attendanceLogs, searchQuery]);

  // Greeting helper
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const todayDateFormatted = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date());

  return (
    <div className="space-y-6">
      {/* 1. Header & Dynamic Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {greeting}, {firstName}!
          </h1>
          <p className="font-body text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {todayDateFormatted} • General Shift (10:00 – 19:00)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs">
            <Building2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>TechCorp Solutions</span>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
            Live Portal
          </span>
        </div>
      </div>

      {/* 2. Monthly Attendance Overview (4 KPI Cards from previous dashboard) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {attendanceSummary.map((item, idx) => {
          let Icon = CheckCircle2;
          let colorClass = 'text-emerald-600 dark:text-emerald-400';
          let bgClass = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400';
          let desc = 'Days recorded';

          if (item.label.toLowerCase().includes('absent')) {
            Icon = XCircle;
            colorClass = 'text-rose-600 dark:text-rose-400';
            bgClass = 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400';
            desc = 'Unexcused days';
          } else if (item.label.toLowerCase().includes('late')) {
            Icon = Clock;
            colorClass = 'text-amber-600 dark:text-amber-400';
            bgClass = 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400';
            desc = 'After 10:15 AM';
          } else if (item.label.toLowerCase().includes('wfh')) {
            Icon = Building2;
            colorClass = 'text-teal-600 dark:text-teal-400';
            bgClass = 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400';
            desc = 'Remote shifts';
          }

          return (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {item.label}
                </p>
                <p className={`font-display text-2xl sm:text-3xl font-bold mt-1 ${colorClass}`}>
                  {item.value ?? '0'}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{desc}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${bgClass}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Hero Workday Tracker & Shift Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Attendance Hero Tracker */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900 transition-all">
          <div className="h-1 bg-gradient-to-r from-teal-500 via-amber-500 to-indigo-500"></div>

          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-teal-600 dark:text-teal-400">
                      Workday Tracker
                    </p>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        clockedIn && !isOnBreak
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : isOnBreak
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          clockedIn && !isOnBreak
                            ? 'bg-emerald-500 animate-pulse'
                            : isOnBreak
                            ? 'bg-amber-500 animate-pulse'
                            : 'bg-slate-400'
                        }`}
                      ></span>
                      {clockedIn ? (isOnBreak ? 'On Break' : 'Working') : 'Clocked Out'}
                    </span>
                  </div>
                  <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    Today&apos;s Attendance
                  </h2>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleBreakToggle}
                  disabled={!clockedIn}
                  className={`font-display inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                    isOnBreak
                      ? 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                  } disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer`}
                >
                  <Coffee className="w-3.5 h-3.5" />
                  <span>{isOnBreak ? 'Resume Work' : 'Take Break'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePunchToggle}
                  disabled={punchLoading || !userId}
                  title={!userId ? 'Employee profile not loaded' : undefined}
                  className={`font-display inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition cursor-pointer active:scale-95 ${
                    clockedIn
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                      : 'bg-teal-600 hover:bg-teal-700 shadow-teal-500/20'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {clockedIn ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{punchLoading ? 'Processing...' : clockedIn ? 'Clock Out' : 'Clock In'}</span>
                </button>
              </div>
            </div>

            {punchFeedback && (
              <div className="mt-4 px-4 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs font-semibold text-teal-800 dark:text-teal-200 flex items-center justify-between">
                <span>{punchFeedback}</span>
                <button onClick={() => setPunchFeedback('')} className="text-teal-500 hover:text-teal-700">✕</button>
              </div>
            )}

            {/* 5 Core Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-5">
              <div className="rounded-xl p-3 border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Clock In</p>
                <p className="font-display text-sm font-semibold text-slate-900 dark:text-white mt-1">
                  {clockInTime}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Shift 10:00 AM</p>
              </div>

              <div className="rounded-xl p-3 border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Clock Out</p>
                <p className="font-display text-sm font-semibold text-slate-900 dark:text-white mt-1">
                  {clockOutTime}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Shift 07:00 PM</p>
              </div>

              <div className="rounded-xl p-3 border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Break Period</p>
                <p className="font-display text-sm font-semibold text-slate-900 dark:text-white mt-1">
                  {isOnBreak ? 'In Progress' : '0 min'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Allocated 60m</p>
              </div>

              <div className="rounded-xl p-3 border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Break</p>
                <p className="font-display text-sm font-semibold text-slate-900 dark:text-white mt-1">
                  {formatShortHours(breakSeconds)}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Today&apos;s recess</p>
              </div>

              <div className="col-span-2 sm:col-span-1 rounded-xl p-3 border border-teal-200 dark:border-teal-900/60 bg-teal-50/50 dark:bg-teal-950/30">
                <p className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">Working Hours</p>
                <p className="font-display text-sm font-bold text-teal-900 dark:text-teal-100 mt-1 font-mono">
                  {formatSeconds(workSeconds)}
                </p>
                <p className="text-[10px] text-teal-600/80 dark:text-teal-400/80 mt-0.5">Target: 08h 00m</p>
              </div>
            </div>

            {/* Shift Progress Visual Bar */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">
                <span>Shift Start: 10:00 AM</span>
                <span className="font-semibold text-teal-600 dark:text-teal-400">{shiftProgress}% Completed</span>
                <span>Shift End: 07:00 PM</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500 rounded-full"
                  style={{ width: `${shiftProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Your Shift Details & Quick Actions */}
        <div className="space-y-6">
          {/* Shift Details Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-teal-600 dark:text-teal-400">
                  Roster Schedule
                </p>
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  Your Shift Details
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                SHF-001
              </span>
            </div>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-850">
                <span className="text-slate-500">Shift Name</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">General Day Shift</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-850">
                <span className="text-slate-500">Timing</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">10:00 – 19:00</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-850">
                <span className="text-slate-500">Duration</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">9 hrs (with 1 hr break)</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Grace Period</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">15 mins (up to 10:15)</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Shortcuts */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 bg-white dark:bg-slate-900">
            <h4 className="font-display text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Frequent Actions
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                to="/employee/leaves"
                className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 transition text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span>Apply Leave</span>
              </Link>
              <Link
                to="/employee/tasks"
                className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 transition text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                <ClipboardList className="w-4 h-4 text-indigo-500" />
                <span>My Tasks</span>
              </Link>
              <Link
                to="/employee/attendance"
                className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 transition text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Regularize</span>
              </Link>
              <Link
                to="/employee/expenses"
                className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 transition text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                <IndianRupee className="w-4 h-4 text-teal-500" />
                <span>Claim Spend</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Categorical Leave Balances Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-teal-600 dark:text-teal-400">
              Statutory Quota
            </p>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Leave Balances (2026)
            </h2>
          </div>
          <Link
            to="/employee/leaves"
            className="font-display text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
          >
            <span>Leave policy details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Casual / Sick Leave</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
                Annual
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold text-slate-900 dark:text-white">
                {leaveBalances.casual}
              </span>
              <span className="text-xs text-slate-400">days available</span>
            </div>
            <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Valid till 31 Dec 2026</span>
              <span className="text-emerald-600 font-semibold">{leaveBalances.casualUsed} used</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Compensatory Off</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                Comp-Off
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold text-slate-900 dark:text-white">
                0
              </span>
              <span className="text-xs text-slate-400">days available</span>
            </div>
            <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Expires in 60 days</span>
              <span className="text-slate-400">0 credited</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Earned / Privilege</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                Carry Forward
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold text-slate-900 dark:text-white">
                {leaveBalances.annual}
              </span>
              <span className="text-xs text-slate-400">days available</span>
            </div>
            <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Can encash 10 days</span>
              <span className="text-emerald-600 font-semibold">{leaveBalances.annualUsed} used</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Loss of Pay (LWP)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                Unpaid
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold text-slate-900 dark:text-white">
                {leaveBalances.unpaid}
              </span>
              <span className="text-xs text-slate-400">days recorded</span>
            </div>
            <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Salary deduction</span>
              <span className="text-rose-500 font-semibold">Processed</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Team Culture: Birthdays This Week */}
      {birthdays.length > 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                <Cake className="w-5 h-5" />
              </div>
              <div>
                <p className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-teal-600 dark:text-teal-400">
                  Celebrations
                </p>
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Birthdays This Week
                </h2>
              </div>
            </div>
            <span className="font-display text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              {birthdays.length} upcoming
            </span>
          </div>

          <div className="p-4 sm:p-5 space-y-3">
            {birthdays.map((person, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-4 rounded-xl px-4 py-3 border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200 font-bold text-xs">
                    {person.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-sm font-semibold truncate text-slate-900 dark:text-white">
                      {person.name}
                    </p>
                    <p className="text-xs truncate text-slate-400 dark:text-slate-500">
                      {person.role} • {person.department}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold flex-shrink-0 px-3 py-1 rounded-lg border bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                  {person.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Recent Activity Timeline & Quick Access Shortcuts (from previous dashboard) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Stream */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-teal-600 dark:text-teal-400">
                Audit Trail
              </p>
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Recent Activity & Updates
              </h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              Live Feed
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 p-3 sm:p-4 space-y-1">
            {recentActivities.map((act, index) => (
              <div key={index} className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0 mt-0.5">
                  {act.status === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : act.status === 'pending' ? (
                    <Clock className="w-4 h-4 text-amber-500" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xs text-slate-900 dark:text-white">{act.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{act.description}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {act.status}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">{act.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Access Shortcuts */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-teal-600 dark:text-teal-400">
              Shortcuts
            </p>
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Quick Access
            </h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 p-2">
            {[
              { label: 'My KYC & ID Card', path: '/employee/profile', icon: UserCheck, desc: 'View credentials & portrait' },
              { label: 'Portal Settings', path: '/employee/settings', icon: Settings, desc: 'Theme & preferences' },
              { label: 'Support & Helpdesk', path: '/employee/support-query', icon: HelpCircle, desc: 'Submit inquiries & tickets' },
              { label: 'Company Policies', path: '/employee/policies', icon: FileText, desc: 'Compliance handbook' },
            ].map((link, index) => (
              <Link
                key={index}
                to={link.path}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
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
          <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 text-center font-mono">
            IntelliAttend Enterprise v2.6 • Neon Cloud
          </div>
        </div>
      </div>

      {/* 7. Recent Attendance Table with Real-Time Search Filter */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-teal-600 dark:text-teal-400 mb-0.5">
              Attendance Records
            </p>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Recent Attendance
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-56 sm:w-64 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by date or status..."
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-2 pl-9 pr-3 text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-teal-500"
              />
            </div>
            <Link
              to="/employee/attendance"
              className="font-display text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline whitespace-nowrap flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b bg-slate-50/70 dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Clock In</th>
                <th className="px-6 py-3.5">Clock Out</th>
                <th className="px-6 py-3.5">Working Hrs</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, index) => {
                  const statusNormalized = (log.status || 'present').toLowerCase();
                  let badgeClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
                  if (statusNormalized.includes('late')) badgeClass = 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';
                  if (statusNormalized.includes('unpaid') || statusNormalized.includes('leave')) badgeClass = 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300';
                  if (statusNormalized.includes('absent')) badgeClass = 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300';

                  return (
                    <tr key={log.id || index} className="hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition">
                      <td className="px-6 py-3.5 font-medium text-slate-900 dark:text-white">
                        {log.punch_date || log.punchDate || 'Today'}
                      </td>
                      <td className="px-6 py-3.5 text-slate-600 dark:text-slate-300 font-mono">
                        {log.check_in || log.checkIn || '—'}
                      </td>
                      <td className="px-6 py-3.5 text-slate-600 dark:text-slate-300 font-mono">
                        {log.check_out || log.checkOut || '—'}
                      </td>
                      <td className="px-6 py-3.5 font-semibold text-slate-800 dark:text-slate-200">
                        {log.total_hours || log.totalHours || (log.work_seconds ? formatSeconds(log.work_seconds) : '—')}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold capitalize ${badgeClass}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {log.status || 'Present'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center text-slate-400">
                    No matching attendance logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 8. Full Workspace Modules & Applications (from previous dashboard) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-teal-600 dark:text-teal-400">
              Navigation Hub
            </p>
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Workspace Modules & Applications
            </h2>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500">12 interconnected modules</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {menuItems.map((item, index) => {
            const theme = colorStyles[item.color] || colorStyles.indigo;
            return (
              <Link
                key={index}
                to={item.path}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-all group cursor-pointer text-center"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${theme.iconBg}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">
                  {item.label}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1">{item.desc}</span>
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
