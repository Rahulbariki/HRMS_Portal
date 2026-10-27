import { useState, useEffect } from 'react';
import {
  UserCheck, Search, Filter, Calendar, Clock,
  CheckCircle2, AlertTriangle, Building, Laptop, Loader2
} from 'lucide-react';
import clsx from 'clsx';
import api from '../../services/api';

export default function ManagerAttendance() {
  const [attendanceList, setAttendanceList] = useState([]);
  const [regularizations, setRegularizations] = useState([]);
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' | 'regularizations'
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [feedback, setFeedback] = useState('');

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const fetchTeamAttendance = async () => {
    try {
      const res = await api.get('/attendance/team');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setAttendanceList(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching team attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegularizations = async () => {
    try {
      const res = await api.get('/regularizations');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setRegularizations(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching regularizations:', err);
    }
  };

  useEffect(() => {
    fetchTeamAttendance();
    fetchRegularizations();
  }, []);

  const handleRegularizationStatus = async (id, status) => {
    try {
      await api.patch(`/regularizations/${id}/status`, {
        status,
        managerComment: status === 'Approved' ? 'Verified with department roster and swipe logs' : 'Discrepancy in recorded punch logs'
      });
      setFeedback(`Regularization request #${id} marked as ${status}!`);
      fetchRegularizations();
      fetchTeamAttendance();
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      console.error('Failed to update regularization:', err);
    }
  };


  const filteredList = attendanceList.filter((item) => {
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesSearch =
      (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.department && item.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.role && item.role.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const markVerified = async (emp) => {
    try {
      if (emp.record_id) {
        await api.patch(`/attendance/verify/${emp.record_id}`, { status: 'present' });
      }
      setAttendanceList((prev) =>
        prev.map((item) =>
          item.id === emp.id
            ? { ...item, status: 'present', checkIn: item.checkIn === '—' ? '09:00 AM' : item.checkIn }
            : item
        )
      );
      setFeedback(`Attendance verified for ${emp.name}!`);
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      console.error('Failed to verify attendance:', err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">Team Attendance</h1>
          <p className="text-slate-500 text-sm mt-1">Daily attendance roster, working hours, and check-in verifications in Neon PostgreSQL</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-xs">
          <Calendar className="h-4 w-4 text-teal-600" />
          <span className="font-semibold text-slate-700">Today: {todayFormatted}</span>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <span className="font-semibold">{feedback}</span>
          </div>
          <button type="button" onClick={() => setFeedback('')} className="text-teal-600 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Present</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="font-display text-2xl font-bold text-emerald-600 mt-2">
            {attendanceList.filter((a) => a.status === 'present').length}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Remote (WFH)</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Laptop className="h-4 w-4" />
            </div>
          </div>
          <p className="font-display text-2xl font-bold text-blue-600 mt-2">
            {attendanceList.filter((a) => a.status === 'wfh').length}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Late Check-in</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <p className="font-display text-2xl font-bold text-amber-600 mt-2">
            {attendanceList.filter((a) => a.status === 'late').length}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Absent</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="font-display text-2xl font-bold text-rose-600 mt-2">
            {attendanceList.filter((a) => a.status === 'absent').length}
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('daily')}
          className={clsx(
            'pb-3 text-sm font-bold border-b-2 transition cursor-pointer',
            activeTab === 'daily'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          )}
        >
          Daily Team Roster ({attendanceList.length})
        </button>
        <button
          onClick={() => setActiveTab('regularizations')}
          className={clsx(
            'pb-3 text-sm font-bold border-b-2 transition cursor-pointer flex items-center gap-2',
            activeTab === 'regularizations'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          )}
        >
          <span>Regularization Requests</span>
          {regularizations.filter(r => r.status === 'Pending').length > 0 && (
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-100 text-amber-800 font-bold">
              {regularizations.filter(r => r.status === 'Pending').length} Pending
            </span>
          )}
        </button>
      </div>

      {activeTab === 'daily' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search team member, role or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              <Filter className="h-4 w-4 text-slate-400 flex-shrink-0" />
              {['all', 'present', 'wfh', 'late', 'absent'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-colors cursor-pointer',
                    filterStatus === status
                      ? 'bg-slate-900 text-teal-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                <p className="text-xs">Loading live team attendance roster...</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-6">Employee</th>
                    <th className="py-3.5 px-6">Department</th>
                    <th className="py-3.5 px-6">Check In</th>
                    <th className="py-3.5 px-6">Check Out</th>
                    <th className="py-3.5 px-6">Working Hours</th>
                    <th className="py-3.5 px-6">Mode</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredList.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-slate-400 text-xs">
                        No attendance records match your filter.
                      </td>
                    </tr>
                  ) : (
                    filteredList.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={emp.avatar || '/avatar_rahul.png'}
                              alt={emp.name}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200"
                              onError={(e) => { e.target.src = '/avatar_rahul.png'; }}
                            />
                            <div>
                              <p className="font-semibold text-xs text-slate-900">{emp.name}</p>
                              <p className="text-[11px] text-slate-500">{emp.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-600">{emp.department}</td>
                        <td className="py-4 px-6 font-mono text-xs font-medium text-slate-800">{emp.checkIn}</td>
                        <td className="py-4 px-6 font-mono text-xs text-slate-500">{emp.checkOut}</td>
                        <td className="py-4 px-6 font-mono text-xs font-bold text-slate-800">{emp.totalHours}</td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                            {emp.mode && emp.mode.includes('Office') ? (
                              <Building className="h-3.5 w-3.5 text-slate-400" />
                            ) : emp.mode && emp.mode.includes('Remote') ? (
                              <Laptop className="h-3.5 w-3.5 text-blue-500" />
                            ) : null}
                            {emp.mode}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={clsx(
                              'px-2.5 py-1 rounded-full text-xs font-semibold capitalize',
                              emp.status === 'present' && 'bg-emerald-100 text-emerald-800',
                              emp.status === 'wfh' && 'bg-blue-100 text-blue-800',
                              emp.status === 'late' && 'bg-amber-100 text-amber-800',
                              emp.status === 'absent' && 'bg-rose-100 text-rose-800'
                            )}
                          >
                            {emp.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {emp.status === 'absent' || emp.status === 'late' ? (
                            <button
                              onClick={() => markVerified(emp)}
                              className="text-xs font-bold text-teal-700 hover:text-teal-800 px-2.5 py-1 rounded-lg border border-teal-200 hover:bg-teal-50 transition cursor-pointer"
                            >
                              Verify Present
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium flex items-center justify-end gap-1">
                              <UserCheck className="h-3.5 w-3.5 text-emerald-600" /> Verified
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">Attendance Regularization Requests</h2>
              <p className="text-xs text-slate-500 mt-0.5">Authorize biometric scanner discrepancies or forgot-to-clock-in adjustments</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            {regularizations.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                No regularization requests found in the system.
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-6">Employee</th>
                    <th className="py-3.5 px-6">Date & Day</th>
                    <th className="py-3.5 px-6">Original Timing</th>
                    <th className="py-3.5 px-6">Requested Timing</th>
                    <th className="py-3.5 px-6">Reason & Explanation</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Review Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {regularizations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-semibold text-xs text-slate-900">{reg.userName || 'Sarah Miller'}</p>
                        <p className="text-[11px] text-slate-500">{reg.userId}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-xs font-medium text-slate-900">{typeof reg.attendanceDate === 'string' ? reg.attendanceDate.slice(0, 10) : reg.attendanceDate}</p>
                        <p className="text-[11px] text-slate-500">{reg.day}</p>
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-500">
                        {reg.originalClockIn} - {reg.originalClockOut}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs font-bold text-teal-700">
                        {reg.requestedClockIn} - {reg.requestedClockOut}
                      </td>
                      <td className="py-4 px-6 max-w-xs">
                        <p className="text-xs font-semibold text-slate-800">{reg.reasonType}</p>
                        <p className="text-[11px] text-slate-500 truncate" title={reg.reasonDetails}>{reg.reasonDetails}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={clsx(
                            'px-2.5 py-1 rounded-full text-xs font-semibold capitalize',
                            reg.status === 'Approved' && 'bg-emerald-100 text-emerald-800',
                            reg.status === 'Rejected' && 'bg-rose-100 text-rose-800',
                            reg.status === 'Pending' && 'bg-amber-100 text-amber-800'
                          )}
                        >
                          {reg.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {reg.status === 'Pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleRegularizationStatus(reg.id, 'Approved')}
                              className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg transition cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRegularizationStatus(reg.id, 'Rejected')}
                              className="text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1 rounded-lg transition cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">Reviewed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

    </div>
  );
}