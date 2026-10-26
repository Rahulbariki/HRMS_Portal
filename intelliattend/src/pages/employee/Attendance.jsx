import { useState, useEffect } from 'react';
import { Calendar, Play, Square, History } from 'lucide-react';
import clsx from 'clsx';

const ATTENDANCE_LOGS = [
  { date: '2026-10-26 (Today)', in: '09:02 AM', out: '—', hours: 'Calculating...', status: 'present', location: 'Office' },
  { date: '2026-10-25', in: '09:05 AM', out: '06:12 PM', hours: '8h 07m', status: 'present', location: 'Office' },
  { date: '2026-10-24', in: '09:28 AM', out: '06:30 PM', hours: '8h 02m', status: 'late', location: 'Office' },
  { date: '2026-10-23', in: '08:55 AM', out: '05:58 PM', hours: '8h 03m', status: 'wfh', location: 'Remote / WFH' },
  { date: '2026-10-22', in: '09:01 AM', out: '06:05 PM', hours: '8h 04m', status: 'present', location: 'Office' },
  { date: '2026-10-21', in: '09:10 AM', out: '06:15 PM', hours: '8h 05m', status: 'present', location: 'Office' },
];

export default function EmployeeAttendance() {
  const [clockedIn, setClockedIn] = useState(true);
  const [clockInTime, setClockInTime] = useState('09:02 AM');
  const [currentTime, setCurrentTime] = useState(() => new Date().toLocaleTimeString());
  const [workSeconds, setWorkSeconds] = useState(18420); // ~5h 07m

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
      if (clockedIn) {
        setWorkSeconds(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [clockedIn]);

  const formatElapsedTime = (totalSec) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleToggleClock = () => {
    if (clockedIn) {
      setClockedIn(false);
    } else {
      setClockedIn(true);
      setClockInTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">Attendance & Time Tracker</h1>
          <p className="text-sm text-slate-500 mt-1">Daily clock-in/out records, shift compliance, and work hours</p>
        </div>
        <div className="text-xs text-slate-500 font-medium bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm self-start sm:self-auto">
          Current System Time: <span className="font-mono font-bold text-slate-900">{currentTime}</span>
        </div>
      </div>

      {/* Clock-In Widget & Shift Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clock In / Out action card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Punch Terminal</span>
              <span className={clsx(
                'px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1.5',
                clockedIn ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
              )}>
                <span className={clsx('w-2 h-2 rounded-full', clockedIn ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400')} />
                {clockedIn ? 'Currently Clocked In' : 'Clocked Out'}
              </span>
            </div>

            <div className="text-center py-4">
              <div className="font-mono text-4xl font-extrabold text-slate-900 tracking-tight">
                {formatElapsedTime(workSeconds)}
              </div>
              <p className="text-xs text-slate-400 mt-1">Today's Active Work Time</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-xs text-slate-500 px-1">
              <span>Clock-in: <strong className="text-slate-800">{clockInTime}</strong></span>
              <span>Location: <strong className="text-slate-800">Headquarters (Office)</strong></span>
            </div>

            <button
              onClick={handleToggleClock}
              className={clsx(
                'w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white shadow-md transition-all',
                clockedIn
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              )}
            >
              {clockedIn ? (
                <>
                  <Square className="h-4 w-4" />
                  <span>Clock Out for the Day</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span>Clock In Now</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Shift Details & Stats */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-500">Days Present</span>
            <div>
              <p className="text-2xl font-bold text-emerald-700">18</p>
              <p className="text-[11px] text-slate-400 mt-0.5">This month</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-500">Late Arrivals</span>
            <div>
              <p className="text-2xl font-bold text-amber-600">1</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Grace limit: 3/mo</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-500">Remote / WFH</span>
            <div>
              <p className="text-2xl font-bold text-indigo-600">3</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Approved days</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-500">Avg Daily Hours</span>
            <div>
              <p className="text-2xl font-bold text-slate-900">8h 05m</p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">101% of target</p>
            </div>
          </div>

          {/* Shift Schedule Box */}
          <div className="col-span-2 sm:col-span-4 bg-indigo-50/70 p-4 rounded-2xl border border-indigo-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-950">Assigned Shift: Standard Day (General)</p>
                <p className="text-[11px] text-indigo-700">09:00 AM – 06:00 PM • 1 Hour Mandatory Lunch Break</p>
              </div>
            </div>
            <span className="hidden sm:inline-block text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              Full Compliance
            </span>
          </div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-slate-500" />
            <h3 className="font-semibold text-sm text-slate-900">Recent Attendance Logs</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">October 2026</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Clock In</th>
                <th className="px-6 py-3.5">Clock Out</th>
                <th className="px-6 py-3.5">Working Hours</th>
                <th className="px-6 py-3.5">Location</th>
                <th className="px-6 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {ATTENDANCE_LOGS.map((log, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {log.date}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-700">
                    {log.in}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-700">
                    {log.out}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-800 font-bold">
                    {log.hours}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {log.location}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={clsx(
                      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize',
                      log.status === 'present' ? 'bg-emerald-100 text-emerald-800'
                        : log.status === 'wfh' ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-amber-100 text-amber-800'
                    )}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}