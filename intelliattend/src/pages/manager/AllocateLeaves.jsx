import { useState, useEffect } from 'react';
import {
  CalendarDays, Calendar, Users, Building2, CheckCircle2,
  Sparkles, Award, RefreshCw, AlertCircle, ArrowRight
} from 'lucide-react';
import clsx from 'clsx';
import api from '../../services/api';

export default function ManagerAllocateLeaves() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Form State
  const [targetType, setTargetType] = useState('employee'); // 'employee' | 'department'
  const [targetId, setTargetId] = useState('');
  const [annual, setAnnual] = useState(20);
  const [sick, setSick] = useState(10);
  const [casual, setCasual] = useState(6);
  const [fiscalYear, setFiscalYear] = useState('2026-2027');

  const fetchData = async () => {
    try {
      const [empRes, deptRes] = await Promise.all([
        api.get('/manager/employees'),
        api.get('/manager/departments')
      ]);
      if (empRes.data?.success && Array.isArray(empRes.data?.data)) {
        setEmployees(empRes.data.data);
        if (empRes.data.data.length > 0) setTargetId(empRes.data.data[0].id);
      }
      if (deptRes.data?.success && Array.isArray(deptRes.data?.data)) {
        setDepartments(deptRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching allocation data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApplyPreset = (a, s, c) => {
    setAnnual(a);
    setSick(s);
    setCasual(c);
  };

  const handleAllocate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post('/manager/leaves/allocate', {
        targetType,
        targetId,
        annual: Number(annual),
        sick: Number(sick),
        casual: Number(casual)
      });
      if (res.data?.success) {
        setFeedback(res.data.message || 'Leave quota successfully allocated!');
        setTimeout(() => setFeedback(''), 4000);
      }
    } catch (err) {
      console.error('Allocation error:', err);
      setFeedback('Error: Failed to allocate leave quota.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Leave Quota Allocation & Entitlement
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Credit statutory and annual leave balances across departments or individual employee profiles for FY 2026-27.
        </p>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback('')} className="text-teal-500 hover:text-teal-700">&times;</button>
        </div>
      )}

      {/* Main Allocation Form & Policy Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-4">
            Allocation Parameters
          </h2>

          <form onSubmit={handleAllocate} className="space-y-5 text-sm">
            {/* Target Type Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Allocation Target Scope
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setTargetType('employee');
                    if (employees.length > 0) setTargetId(employees[0].id);
                  }}
                  className={clsx(
                    'flex items-center justify-center gap-2.5 p-3 rounded-xl border text-sm font-semibold transition',
                    targetType === 'employee'
                      ? 'bg-slate-900 dark:bg-teal-600 text-white border-transparent'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  )}
                >
                  <Users className="h-4 w-4" />
                  Individual Staff Member
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTargetType('department');
                    if (departments.length > 0) setTargetId(departments[0].name);
                  }}
                  className={clsx(
                    'flex items-center justify-center gap-2.5 p-3 rounded-xl border text-sm font-semibold transition',
                    targetType === 'department'
                      ? 'bg-slate-900 dark:bg-teal-600 text-white border-transparent'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  )}
                >
                  <Building2 className="h-4 w-4" />
                  Entire Department
                </button>
              </div>
            </div>

            {/* Target Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {targetType === 'employee' ? 'Select Employee *' : 'Select Department *'}
              </label>
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white"
              >
                {targetType === 'employee' ? (
                  employees.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.first_name} {e.last_name} ({e.id}) — {e.department} [{e.designation}]
                    </option>
                  ))
                ) : (
                  departments.map(d => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.employee_count || 0} active staff)
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Quick Presets */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Standard Corporate Policy Presets
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyPreset(20, 10, 6)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Standard Enterprise (20 Annual / 10 Sick / 6 Casual)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset(24, 12, 8)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Engineering Senior Band (24 Annual / 12 Sick / 8 Casual)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset(15, 8, 4)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Probationary Tier (15 Annual / 8 Sick / 4 Casual)
                </button>
              </div>
            </div>

            {/* Leave Days Input Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">Annual Paid Leave</p>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={annual}
                  onChange={(e) => setAnnual(e.target.value)}
                  className="mt-2 w-full text-2xl font-bold bg-transparent border-b border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 py-1"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Days / Fiscal Year</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Sick / Medical Leave</p>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={sick}
                  onChange={(e) => setSick(e.target.value)}
                  className="mt-2 w-full text-2xl font-bold bg-transparent border-b border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 py-1"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Days / Fiscal Year</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Casual / Personal Leave</p>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={casual}
                  onChange={(e) => setCasual(e.target.value)}
                  className="mt-2 w-full text-2xl font-bold bg-transparent border-b border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 py-1"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Days / Fiscal Year</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={actionLoading}
                className="px-6 py-2.5 rounded-xl font-semibold bg-slate-900 dark:bg-teal-600 text-white hover:bg-slate-800 transition shadow-sm flex items-center gap-2"
              >
                {actionLoading ? 'Processing Entitlement...' : 'Credit & Allocate Leave Quotas'}
              </button>
            </div>
          </form>
        </div>

        {/* Policy Summary */}
        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Award className="h-5 w-5 text-teal-500" />
              Statutory Compliance
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Under Indian Factories Act and Shops & Establishments statutory regulations, full-time employees are entitled to a minimum of 18-21 earned leaves per 240 days worked, along with 8-12 casual and sick leaves.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-2 text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Carry-forward Limit:</span>
                <span className="font-semibold text-slate-900 dark:text-white">Up to 30 Days</span>
              </div>
              <div className="flex justify-between">
                <span>Encashment Allowed:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Yes (Upon Separation)</span>
              </div>
              <div className="flex justify-between">
                <span>Audit Cycle:</span>
                <span className="font-semibold text-slate-900 dark:text-white">Annual (31st March)</span>
              </div>
            </div>
          </div>

          <div className="bg-teal-50 dark:bg-teal-950/40 rounded-2xl p-6 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Sparkles className="h-4 w-4" />
              Automatic Balance Refresh
            </div>
            <p className="text-xs text-teal-700 dark:text-teal-300 mt-2 leading-relaxed">
              Allocating quota immediately updates the employee portal leave balance calculator and synchronizes with payroll deduction rules.
            </p>
          </div>
        </div>
      </div>

      {/* Staff Roster Leave Quota Snapshot */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
            Current Staff Leave Quota Roster
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {employees.length} Personnel Configured
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Annual Quota</th>
                <th className="px-6 py-4">Sick Quota</th>
                <th className="px-6 py-4">Casual Quota</th>
                <th className="px-6 py-4">Total Entitlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {employees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900 dark:text-white">{emp.first_name} {emp.last_name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{emp.id}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">
                    {emp.department || 'Engineering'}
                  </td>
                  <td className="px-6 py-4 font-semibold text-teal-600 dark:text-teal-400">
                    20 Days
                  </td>
                  <td className="px-6 py-4 font-semibold text-emerald-600 dark:text-emerald-400">
                    10 Days
                  </td>
                  <td className="px-6 py-4 font-semibold text-amber-600 dark:text-amber-400">
                    6 Days
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                    36 Total Days
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
