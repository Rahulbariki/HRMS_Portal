import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock, Play, Square, Coffee, UserCheck, Calendar, CalendarDays,
  CheckCircle2, AlertCircle, XCircle, Plus, Search, ArrowRight,
  ChevronRight, Cake, Gift, Building2, Sparkles, ShieldCheck,
  FileText, ClipboardList, HelpCircle
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const userId = user?.employeeId || user?.id || 'IA-EM-001';
  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'Rahul';
  const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || 'Rahul Bariki' : 'Rahul Bariki';

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

  // Attendance history logs & search query
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
  const [birthdays, setBirthdays] = useState([
    { name: 'Supriya Enjam', role: 'Employee', department: 'Information Technology', date: '26 Oct', initials: 'SE' },
    { name: 'Kaviyapriya M', role: 'Employee', department: 'Information Technology', date: '31 Oct', initials: 'KM' }
  ]);

  // Current formatted time & date
  const [currentClock, setCurrentClock] = useState(() => new Date().toLocaleTimeString('en-US', { hour12: false }));

  // Load initial data from APIs
  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        const [todayRes, logsRes, leavesRes, directoryRes] = await Promise.all([
          api.get(`/attendance/today?userId=${userId}`),
          api.get(`/attendance/logs?userId=${userId}`),
          api.get(`/employee/leaves/balance?userId=${userId}`),
          api.get('/users/directory')
        ]);

        if (!isMounted) return;

        if (todayRes.data?.success && todayRes.data?.data) {
          const d = todayRes.data.data;
          setClockedIn(Boolean(d.clockedIn));
          setClockInTime(d.clockInTime || '—');
          setClockOutTime(d.clockOutTime || '—');
          setWorkSeconds(Number(d.workSeconds) || 0);
        }

        if (logsRes.data?.success && Array.isArray(logsRes.data?.data)) {
          setAttendanceLogs(logsRes.data.data);
        }

        if (leavesRes.data?.success && leavesRes.data?.data) {
          const lb = leavesRes.data.data;
          setLeaveBalances({
            casual: Number(lb.casual || lb.casual_leave || 12),
            casualUsed: Number(lb.casual_used || 0),
            sick: Number(lb.sick || lb.sick_leave || 12),
            sickUsed: Number(lb.sick_used || 0),
            annual: Number(lb.annual || lb.paid_leave || 15),
            annualUsed: Number(lb.annual_used || 0),
            unpaid: Number(lb.unpaid || 1)
          });
        }

        if (directoryRes.data?.success && Array.isArray(directoryRes.data?.data) && directoryRes.data.data.length > 2) {
          const staff = directoryRes.data.data.slice(0, 3).map((s, idx) => ({
            name: `${s.firstName || s.first_name || ''} ${s.lastName || s.last_name || ''}`.trim() || 'Team Member',
            role: s.role || 'Employee',
            department: s.department || 'Engineering',
            date: idx === 0 ? '26 Oct' : (idx === 1 ? '31 Oct' : '05 Nov'),
            initials: `${(s.firstName || s.first_name || 'U')[0]}${(s.lastName || s.last_name || 'M')[0]}`.toUpperCase()
          }));
          setBirthdays(staff);
        }
      } catch (err) {
        console.warn('Dashboard data loading notice:', err.message);
      }
    };

    loadDashboardData();
    return () => { isMounted = false; };
  }, [userId]);

  // Live timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentClock(new Date().toLocaleTimeString('en-US', { hour12: false }));
      if (clockedIn && !isOnBreak) {
        setWorkSeconds(prev => prev + 1);
      }
      if (isOnBreak) {
        setBreakSeconds(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [clockedIn, isOnBreak]);

  // Handle Punch In / Punch Out
  const handlePunchToggle = async () => {
    setPunchLoading(true);
    setPunchFeedback('');
    try {
      const res = await api.post('/attendance/punch', {
        userId,
        mode: 'Office',
        currentWorkSeconds: workSeconds
      });

      if (res.data?.success && res.data?.data) {
        const d = res.data.data;
        setClockedIn(Boolean(d.clockedIn));
        if (d.clockedIn) {
          setClockInTime(d.clockInTime || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
          setClockOutTime('—');
          setIsOnBreak(false);
          setPunchFeedback('Clocked In successfully! Workday timer active.');
        } else {
          setClockOutTime(d.clockOutTime || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
          setIsOnBreak(false);
          setPunchFeedback('Clocked Out successfully! Daily log updated.');
        }

        // Refresh logs
        const logsRes = await api.get(`/attendance/logs?userId=${userId}`);
        if (logsRes.data?.success && Array.isArray(logsRes.data?.data)) {
          setAttendanceLogs(logsRes.data.data);
        }
      }
    } catch (err) {
      console.error('Punch failed:', err);
      setPunchFeedback('Unable to record punch. Please try again.');
    } finally {
      setPunchLoading(false);
      setTimeout(() => setPunchFeedback(''), 4000);
    }
  };

  // Toggle Break
  const handleBreakToggle = () => {
    if (!clockedIn) return;
    if (!isOnBreak) {
      setIsOnBreak(true);
      setBreakStart(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
      setPunchFeedback('Break started. Working timer paused.');
    } else {
      setIsOnBreak(false);
      setPunchFeedback('Break ended. Working timer resumed.');
    }
    setTimeout(() => setPunchFeedback(''), 3000);
  };

  // Format seconds to h & m
  const formatSeconds = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${h}h ${m}m`;
  };

  // Calculate workday progress (shift: 10:00 to 19:00 = 9 hours = 32400 seconds)
  const shiftProgressPercent = useMemo(() => {
    const totalShiftSec = 9 * 3600;
    const pct = Math.min(100, Math.round((workSeconds / totalShiftSec) * 100));
    return isNaN(pct) || pct < 0 ? 0 : pct;
  }, [workSeconds]);

  // Dynamic greeting based on time of day
  const greeting = useMemo(() => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Today's formatted date string
  const todayDateString = useMemo(() => {
    return new Date().toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }, []);

  // Filter attendance logs by search query
  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return attendanceLogs.slice(0, 5);
    const q = searchQuery.toLowerCase().trim();
    return attendanceLogs.filter(item => {
      const dateStr = String(item.punch_date || item.punchDate || '').toLowerCase();
      const statusStr = String(item.status || '').toLowerCase();
      const checkInStr = String(item.check_in || item.checkIn || '').toLowerCase();
      return dateStr.includes(q) || statusStr.includes(q) || checkInStr.includes(q);
    });
  }, [attendanceLogs, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Greeting Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 pb-1 border-b border-slate-200/60 dark:border-slate-800">
        <div>
          <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-teal-600 dark:text-teal-400 mb-1">
            Employee Portal
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {greeting}, {firstName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Here&apos;s your live work overview for today.
          </p>
        </div>
        <div className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
          {todayDateString}
        </div>
      </div>

      {punchFeedback && (
        <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl text-teal-800 dark:text-teal-300 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>{punchFeedback}</span>
          </div>
          <button onClick={() => setPunchFeedback('')} className="text-teal-600 hover:text-teal-800 font-bold cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* 2. Today's Attendance Real-Time Workday Tracker Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
        <div className="h-1 bg-teal-600 dark:bg-teal-500"></div>
        <div className="p-6 sm:p-7">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-display text-base font-semibold text-slate-900 dark:text-white">
                    Today&apos;s Attendance
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Track your workday in real time
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <span className={`w-2.5 h-2.5 rounded-full ${clockedIn ? (isOnBreak ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 animate-pulse') : 'bg-slate-400'}`}></span>
                <span className={`font-display text-xs font-semibold px-3 py-1 rounded-full ${
                  clockedIn
                    ? (isOnBreak ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300')
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}>
                  {clockedIn ? (isOnBreak ? 'On Break' : 'Working') : 'Clocked Out'}
                </span>
                <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 ml-2">
                  System Clock: {currentClock}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {clockedIn && (
                <button
                  type="button"
                  onClick={handleBreakToggle}
                  className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    isOnBreak
                      ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600'
                      : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Coffee className="w-3.5 h-3.5" />
                  <span>{isOnBreak ? 'Resume Work' : 'Take Break'}</span>
                </button>
              )}

              <button
                type="button"
                disabled={punchLoading}
                onClick={handlePunchToggle}
                className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer disabled:opacity-50 ${
                  clockedIn
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white'
                }`}
              >
                {clockedIn ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Clock Out</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Clock In</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 5-Column Metrics Grid */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            <div className="rounded-xl px-4 py-4 border bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800">
              <p className="text-xs mb-1.5 text-slate-400 dark:text-slate-500">Clock In</p>
              <p className="font-display text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                {clockInTime}
              </p>
            </div>

            <div className="rounded-xl px-4 py-4 border bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800">
              <p className="text-xs mb-1.5 text-slate-400 dark:text-slate-500">Clock Out</p>
              <p className="font-display text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                {clockOutTime}
              </p>
            </div>

            <div className="rounded-xl px-4 py-4 border bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800">
              <p className="text-xs mb-1.5 text-slate-400 dark:text-slate-500">Break Period</p>
              <p className="font-display text-sm sm:text-base font-semibold text-slate-900 dark:text-white truncate">
                {isOnBreak ? `${breakStart} – Active` : (breakSeconds > 0 ? `${breakStart || '14:35'} – Done` : '—')}
              </p>
            </div>

            <div className="rounded-xl px-4 py-4 border bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800">
              <p className="text-xs mb-1.5 text-slate-400 dark:text-slate-500">Total Break</p>
              <p className="font-display text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                {breakSeconds > 0 ? `${Math.floor(breakSeconds / 60)}m` : '0m'}
              </p>
            </div>

            <div className="rounded-xl px-4 py-4 border bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800">
              <p className="text-xs mb-1.5 text-slate-400 dark:text-slate-500">Working Hours</p>
              <p className="font-display text-sm sm:text-base font-semibold text-teal-600 dark:text-teal-400">
                {formatSeconds(workSeconds)}
              </p>
            </div>
          </div>

          {/* Work Day Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Work day progress</span>
              <span className="font-display text-xs font-semibold text-teal-700 dark:text-teal-300">
                {shiftProgressPercent}%
              </span>
            </div>
            <div className="relative h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 bg-teal-600 dark:bg-teal-500"
                style={{ width: `${shiftProgressPercent}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[11px] text-slate-400 dark:text-slate-500">10:00 AM</span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">07:00 PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Shift Information & Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Your Shift Card */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 bg-white dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-teal-600 dark:text-teal-400">
                  Your Shift
                </p>
                <h2 className="font-display text-lg font-bold mt-1 text-slate-900 dark:text-white">
                  General Day Shift
                </h2>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="rounded-xl p-4 border bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 space-y-2">
              <p className="text-xs text-slate-400 dark:text-slate-500">Official Schedule</p>
              <p className="font-display text-lg font-bold text-slate-900 dark:text-white">
                10:00 – 19:00
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-800 text-xs">
                <span className="text-slate-400">Shift Code</span>
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">SHF-001</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Location: <strong>Office (HQ)</strong></span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Active Roster
            </span>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 bg-white dark:bg-slate-900">
          <div className="mb-4">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-teal-600 dark:text-teal-400">
              Quick Actions
            </p>
            <h2 className="font-display text-lg font-bold mt-1 text-slate-900 dark:text-white">
              Manage your workday
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              to="/employee/attendance"
              className="group rounded-xl p-4 border border-teal-100 dark:border-teal-900/40 bg-teal-50/50 dark:bg-teal-950/30 hover:bg-teal-100/60 dark:hover:bg-teal-900/50 transition flex flex-col justify-between"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 shadow-xs bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 group-hover:scale-105 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="font-display text-sm font-semibold text-slate-900 dark:text-white">Attendance</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">View records</p>
              </div>
            </Link>

            <Link
              to="/employee/leaves"
              className="group rounded-xl p-4 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition flex flex-col justify-between"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 shadow-xs bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="font-display text-sm font-semibold text-slate-900 dark:text-white">Leaves</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Apply or track</p>
              </div>
            </Link>

            <Link
              to="/employee/regularization"
              className="group rounded-xl p-4 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition flex flex-col justify-between"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 shadow-xs bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-display text-sm font-semibold text-slate-900 dark:text-white">Regularization</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Fix attendance</p>
              </div>
            </Link>

            <Link
              to="/employee/tasks"
              className="group rounded-xl p-4 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition flex flex-col justify-between"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 shadow-xs bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <p className="font-display text-sm font-semibold text-slate-900 dark:text-white">My Tasks</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">View assigned work</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Leave Balance Cards (4 Categorical Cards with Reset Dates) */}
      <div>
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-teal-600 dark:text-teal-400">
              Leave Balance
            </p>
            <h2 className="font-display text-xl font-bold mt-0.5 text-slate-900 dark:text-white">
              Your Time Off Summary
            </h2>
          </div>
          <Link to="/employee/leaves" className="font-display text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1">
            <span>View details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Casual / Sick */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 bg-white dark:bg-slate-900 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <p className="font-display text-xs font-semibold text-slate-800 dark:text-slate-200">Casual / Sick</p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <p className="font-display text-3xl font-bold mt-4 text-slate-900 dark:text-white">
              {leaveBalances.casual - leaveBalances.casualUsed}
            </p>
            <p className="text-xs mt-1 text-slate-400">
              {leaveBalances.casualUsed} used of {leaveBalances.casual}
            </p>
            <p className="text-[10px] mt-2 text-slate-400 dark:text-slate-500 font-medium">
              Resets 01/01/2027
            </p>
          </div>

          {/* Compensatory Leave */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 bg-white dark:bg-slate-900 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <p className="font-display text-xs font-semibold text-slate-800 dark:text-slate-200">Compensatory</p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                <CalendarDays className="w-4 h-4" />
              </div>
            </div>
            <p className="font-display text-3xl font-bold mt-4 text-slate-900 dark:text-white">
              0
            </p>
            <p className="text-xs mt-1 text-slate-400">
              0 used of 0
            </p>
            <p className="text-[10px] mt-2 text-slate-400 dark:text-slate-500 font-medium">
              Resets 01/11/2026
            </p>
          </div>

          {/* Earned Leave */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 bg-white dark:bg-slate-900 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <p className="font-display text-xs font-semibold text-slate-800 dark:text-slate-200">Earned Leave</p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="font-display text-3xl font-bold mt-4 text-slate-900 dark:text-white">
              {leaveBalances.annual - leaveBalances.annualUsed}
            </p>
            <p className="text-xs mt-1 text-slate-400">
              {leaveBalances.annualUsed} used of {leaveBalances.annual}
            </p>
            <p className="text-[10px] mt-2 text-slate-400 dark:text-slate-500 font-medium">
              Resets 01/01/2027
            </p>
          </div>

          {/* Leave Without Pay */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 bg-white dark:bg-slate-900 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <p className="font-display text-xs font-semibold text-slate-800 dark:text-slate-200">Unpaid Leave</p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="font-display text-3xl font-bold mt-4 text-slate-900 dark:text-white">
              {leaveBalances.unpaid}
            </p>
            <p className="text-xs mt-1 text-slate-400">
              days taken this year
            </p>
            <p className="text-[10px] mt-2 text-slate-400 dark:text-slate-500 font-medium">
              Resets 01/11/2026
            </p>
          </div>
        </div>
      </div>

      {/* 5. Birthdays Widget */}
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

      {/* 6. Recent Attendance Table with Real-Time Search Filter */}
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
    </div>
  );
}
