import { useState } from 'react';
import {
  UserCheck, Search, Filter, Calendar, Clock,
  CheckCircle2, AlertTriangle, Building, Laptop
} from 'lucide-react';
import clsx from 'clsx';

const TODAY_TEAM_ATTENDANCE = [
  {
    id: 1,
    name: 'Emily Watson',
    avatar: 'EW',
    role: 'Senior Software Engineer',
    department: 'Engineering',
    checkIn: '09:02 AM',
    checkOut: '—',
    totalHours: '5h 12m',
    status: 'present',
    mode: 'Office',
  },
  {
    id: 2,
    name: 'Alex Rivera',
    avatar: 'AR',
    role: 'Product Lead',
    department: 'Product',
    checkIn: '08:55 AM',
    checkOut: '—',
    totalHours: '5h 19m',
    status: 'present',
    mode: 'Office',
  },
  {
    id: 3,
    name: 'David Chen',
    avatar: 'DC',
    role: 'DevOps Engineer',
    department: 'Infrastructure',
    checkIn: '09:42 AM',
    checkOut: '—',
    totalHours: '4h 32m',
    status: 'late',
    mode: 'Office',
  },
  {
    id: 4,
    name: 'Sarah Miller',
    avatar: 'SM',
    role: 'UI/UX Designer',
    department: 'Design',
    checkIn: '09:00 AM',
    checkOut: '—',
    totalHours: '5h 14m',
    status: 'wfh',
    mode: 'Remote / WFH',
  },
  {
    id: 5,
    name: 'Marcus Vance',
    avatar: 'MV',
    role: 'QA Analyst',
    department: 'Engineering',
    checkIn: '—',
    checkOut: '—',
    totalHours: '0h 00m',
    status: 'absent',
    mode: '—',
  },
];

export default function ManagerAttendance() {
  const [attendanceList, setAttendanceList] = useState(TODAY_TEAM_ATTENDANCE);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredList = attendanceList.filter((item) => {
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const markVerified = (id) => {
    setAttendanceList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'present', checkIn: item.checkIn === '—' ? '09:00 AM' : item.checkIn } : item))
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Team Attendance</h1>
          <p className="text-muted mt-1">Daily attendance roster, working hours, and check-in verifications</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-xs">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="font-semibold text-slate-700">Today: Oct 26, 2026</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-elevated p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted">Present</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="font-display text-2xl font-bold text-emerald-600 mt-2">
            {attendanceList.filter((a) => a.status === 'present').length}
          </p>
        </div>

        <div className="card-elevated p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted">Remote (WFH)</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Laptop className="h-4 w-4" />
            </div>
          </div>
          <p className="font-display text-2xl font-bold text-blue-600 mt-2">
            {attendanceList.filter((a) => a.status === 'wfh').length}
          </p>
        </div>

        <div className="card-elevated p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted">Late Check-in</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <p className="font-display text-2xl font-bold text-amber-600 mt-2">
            {attendanceList.filter((a) => a.status === 'late').length}
          </p>
        </div>

        <div className="card-elevated p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted">Absent</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="font-display text-2xl font-bold text-rose-600 mt-2">
            {attendanceList.filter((a) => a.status === 'absent').length}
          </p>
        </div>
      </div>

      <div className="card-elevated">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search team member or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 h-10 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            {['all', 'present', 'wfh', 'late', 'absent'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors',
                  filterStatus === status
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {status.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
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
                  <td colSpan="8" className="py-12 text-center text-muted">
                    No attendance records match your filter.
                  </td>
                </tr>
              ) : (
                filteredList.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-light text-primary font-bold text-xs flex items-center justify-center">
                          {emp.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{emp.name}</p>
                          <p className="text-xs text-muted">{emp.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600">{emp.department}</td>
                    <td className="py-4 px-6 font-medium text-slate-800">{emp.checkIn}</td>
                    <td className="py-4 px-6 text-slate-500">{emp.checkOut}</td>
                    <td className="py-4 px-6 font-medium text-slate-700">{emp.totalHours}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                        {emp.mode.includes('Office') ? (
                          <Building className="h-3.5 w-3.5 text-slate-400" />
                        ) : emp.mode.includes('Remote') ? (
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
                          onClick={() => markVerified(emp.id)}
                          className="text-xs font-semibold text-primary hover:text-primary-hover px-2.5 py-1 rounded border border-primary/20 hover:bg-primary-light"
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
        </div>
      </div>
    </div>
  );
}