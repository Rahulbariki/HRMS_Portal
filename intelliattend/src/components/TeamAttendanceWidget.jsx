import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, RefreshCw, Search, Clock, CheckCircle2, 
  Coffee, AlertCircle, ChevronRight, ExternalLink 
} from 'lucide-react';
import api from '../services/api';
import clsx from 'clsx';

export default function TeamAttendanceWidget({ className = '' }) {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchTeamAttendance = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      setError(null);
      const res = await api.get('/attendance/team');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setTeam(res.data.data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Failed to load team attendance:', err);
      setError('Could not update team attendance. Displaying cached data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTeamAttendance();
    const interval = setInterval(() => {
      fetchTeamAttendance();
    }, 45000); // Polling every 45s
    return () => clearInterval(interval);
  }, []);

  const counts = useMemo(() => {
    const present = team.filter(m => (m.status || '').toLowerCase() === 'present').length;
    const clockedIn = team.filter(m => (m.status || '').toLowerCase() === 'clocked in' || (m.status || '').toLowerCase() === 'working').length;
    const onBreak = team.filter(m => (m.status || '').toLowerCase() === 'on break' || (m.status || '').toLowerCase() === 'break').length;
    const absent = team.filter(m => (m.status || '').toLowerCase() === 'absent' || !m.status).length;
    return { all: team.length, present, clockedIn, onBreak, absent };
  }, [team]);

  const filteredTeam = useMemo(() => {
    return team.filter((member) => {
      const statusLower = (member.status || 'absent').toLowerCase();
      
      // Filter tab check
      if (selectedFilter === 'present' && statusLower !== 'present') return false;
      if (selectedFilter === 'clocked_in' && statusLower !== 'clocked in' && statusLower !== 'working') return false;
      if (selectedFilter === 'on_break' && statusLower !== 'on break' && statusLower !== 'break') return false;
      if (selectedFilter === 'absent' && statusLower !== 'absent') return false;

      // Search query check
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const nameMatch = (member.name || '').toLowerCase().includes(query);
        const roleMatch = (member.role || '').toLowerCase().includes(query);
        const deptMatch = (member.department || '').toLowerCase().includes(query);
        const idMatch = (member.id || '').toLowerCase().includes(query);
        const statusMatch = statusLower.includes(query);
        return nameMatch || roleMatch || deptMatch || idMatch || statusMatch;
      }

      return true;
    });
  }, [team, selectedFilter, searchQuery]);

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusBadge = (status) => {
    const s = (status || 'absent').toLowerCase();
    switch (s) {
      case 'present':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Present
          </span>
        );
      case 'clocked in':
      case 'working':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
            Working
          </span>
        );
      case 'on break':
      case 'break':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            On Break
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Absent
          </span>
        );
    }
  };

  const todayFormatted = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date());

  return (
    <div className={clsx('bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all', className)}>
      {/* Top Banner with Colored Strip */}
      <div className="h-1 bg-gradient-to-r from-teal-500 via-amber-500 to-indigo-500"></div>

      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Direct Reports
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync
            </span>
          </div>
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white mt-1">
            Team Attendance Tracker
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {todayFormatted}
            {lastUpdated && (
              <span className="ml-2 text-slate-400 dark:text-slate-500">
                · Synced at {lastUpdated.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            {team.length} {team.length === 1 ? 'member' : 'members'}
          </span>
          <button
            type="button"
            onClick={() => fetchTeamAttendance(true)}
            disabled={refreshing}
            title="Refresh team attendance"
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition cursor-pointer"
          >
            <RefreshCw className={clsx('w-4 h-4', refreshing && 'animate-spin text-teal-600')} />
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 space-y-4">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'All Staff', count: counts.all },
            { id: 'present', label: 'Present', count: counts.present, color: 'text-emerald-600' },
            { id: 'clocked_in', label: 'Working', count: counts.clockedIn, color: 'text-teal-600' },
            { id: 'on_break', label: 'On Break', count: counts.onBreak, color: 'text-amber-600' },
            { id: 'absent', label: 'Absent / Off', count: counts.absent, color: 'text-slate-500' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={clsx(
                'px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5',
                selectedFilter === tab.id
                  ? 'bg-slate-900 dark:bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              )}
            >
              <span>{tab.label}</span>
              <span className={clsx('px-1.5 py-0.2 rounded-md text-[10px]', selectedFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300')}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, role, department or status..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 outline-none transition"
          />
        </div>
      </div>

      {error && (
        <div className="px-6 py-2.5 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchTeamAttendance(true)}
            className="font-semibold underline hover:text-amber-800 dark:hover:text-amber-200 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="px-6 py-3.5 w-16">#</th>
              <th className="px-6 py-3.5">Employee / Role</th>
              <th className="px-6 py-3.5">Clock In</th>
              <th className="px-6 py-3.5">Clock Out</th>
              <th className="px-6 py-3.5">Total Hours</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading && team.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-teal-500" />
                    <span>Loading real-time team attendance...</span>
                  </div>
                </td>
              </tr>
            ) : filteredTeam.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2 text-slate-400">
                      <Users className="w-5 h-5" />
                    </div>
                    <p className="font-semibold text-slate-700 dark:text-slate-300 text-xs">No direct reports found</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">Try adjusting your search query or filter selection</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTeam.map((member, idx) => (
                <tr 
                  key={member.id || idx}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                >
                  {/* Sl No */}
                  <td className="px-6 py-3.5 text-slate-400 dark:text-slate-500 font-mono font-medium">
                    {String(idx + 1).padStart(2, '0')}
                  </td>

                  {/* Employee Info */}
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      {member.avatar ? (
                        <img 
                          src={member.avatar} 
                          alt={member.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0" 
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-teal-600 dark:text-teal-400 font-bold flex items-center justify-center text-xs shrink-0 border border-teal-500/20">
                          {getInitials(member.name)}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white leading-tight">
                          {member.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {member.role || 'Staff Member'}
                          </span>
                          {member.department && (
                            <>
                              <span className="text-slate-300 dark:text-slate-600">·</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                {member.department}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Clock In */}
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{member.checkIn || '—'}</span>
                    </div>
                  </td>

                  {/* Clock Out */}
                  <td className="px-6 py-3.5">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {member.checkOut || '—'}
                    </span>
                  </td>

                  {/* Total Hours */}
                  <td className="px-6 py-3.5">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {member.totalHours || '0h 00m'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-3.5">
                    {getStatusBadge(member.status)}
                  </td>

                  {/* Action */}
                  <td className="px-6 py-3.5 text-right">
                    <Link
                      to="/manager/attendance"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition"
                    >
                      <span>Logs</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
