import { useState } from 'react';
import {
  Calendar as CalendarIcon, Plus, CheckCircle2, Clock, XCircle,
  CalendarCheck, X
} from 'lucide-react';
import clsx from 'clsx';

const INITIAL_LEAVES = [
  {
    id: 1,
    type: 'Annual Leave',
    startDate: '2026-11-12',
    endDate: '2026-11-15',
    days: 4,
    reason: 'Family vacation & travel',
    status: 'approved',
    appliedOn: '2026-10-20',
    approvedBy: 'David Chen (Manager)',
  },
  {
    id: 2,
    type: 'Sick Leave',
    startDate: '2026-10-24',
    endDate: '2026-10-24',
    days: 1,
    reason: 'Viral fever and doctor consultation',
    status: 'approved',
    appliedOn: '2026-10-23',
    approvedBy: 'David Chen (Manager)',
  },
  {
    id: 3,
    type: 'Casual Leave',
    startDate: '2026-11-28',
    endDate: '2026-11-29',
    days: 2,
    reason: 'Personal legal documentation',
    status: 'pending',
    appliedOn: '2026-10-25',
    approvedBy: 'Awaiting Manager Review',
  },
];

export default function EmployeeLeaves() {
  const [leaves, setLeaves] = useState(INITIAL_LEAVES);
  const [activeTab, setActiveTab] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Annual Leave',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const balances = {
    annual: { used: 5, total: 20 },
    sick: { used: 2, total: 10 },
    casual: { used: 2, total: 6 },
  };

  const handleApplyLeave = (e) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate || !formData.reason) return;

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const newRequest = {
      id: Date.now(),
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      days: diffDays > 0 ? diffDays : 1,
      reason: formData.reason,
      status: 'pending',
      appliedOn: new Date().toISOString().split('T')[0],
      approvedBy: 'Awaiting Manager Review',
    };

    setLeaves([newRequest, ...leaves]);
    setIsModalOpen(false);
    setFormData({ type: 'Annual Leave', startDate: '', endDate: '', reason: '' });
  };

  const handleCancelLeave = (id) => {
    setLeaves(leaves.filter(l => l.id !== id));
  };

  const filteredLeaves = leaves.filter(l => {
    if (activeTab === 'all') return true;
    return l.status === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">Leave Management</h1>
          <p className="text-sm text-slate-500 mt-1">Check remaining balances and submit leave applications</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 text-teal-400" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Balances Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Annual Leave</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {balances.annual.total - balances.annual.used}
              </span>
              <span className="text-xs text-slate-400">/ {balances.annual.total} days remaining</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-teal-500 h-full rounded-full"
                style={{ width: `${((balances.annual.total - balances.annual.used) / balances.annual.total) * 100}%` }}
              />
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <CalendarCheck className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sick Leave</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {balances.sick.total - balances.sick.used}
              </span>
              <span className="text-xs text-slate-400">/ {balances.sick.total} days remaining</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full"
                style={{ width: `${((balances.sick.total - balances.sick.used) / balances.sick.total) * 100}%` }}
              />
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CalendarIcon className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Casual Leave</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {balances.casual.total - balances.casual.used}
              </span>
              <span className="text-xs text-slate-400">/ {balances.casual.total} days remaining</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-amber-600 h-full rounded-full"
                style={{ width: `${((balances.casual.total - balances.casual.used) / balances.casual.total) * 100}%` }}
              />
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Tab filters */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'All Requests' },
              { id: 'pending', label: 'Pending' },
              { id: 'approved', label: 'Approved' },
              { id: 'rejected', label: 'Rejected' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  activeTab === tab.id
                    ? 'bg-slate-900 text-teal-300 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-400 font-medium">{filteredLeaves.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Leave Type</th>
                <th className="px-6 py-3.5">Duration</th>
                <th className="px-6 py-3.5">Days</th>
                <th className="px-6 py-3.5">Reason</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400 text-xs">
                    No leave requests found in this view.
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{l.type}</div>
                      <div className="text-xs text-slate-400">Applied on {l.appliedOn}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-700">
                      {l.startDate} → {l.endDate}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-bold">
                        {l.days} {l.days === 1 ? 'day' : 'days'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate">
                      {l.reason}
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize',
                        l.status === 'approved' ? 'bg-emerald-100 text-emerald-800'
                          : l.status === 'pending' ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      )}>
                        {l.status === 'approved' ? <CheckCircle2 className="h-3 w-3" />
                          : l.status === 'pending' ? <Clock className="h-3 w-3" />
                          : <XCircle className="h-3 w-3" />}
                        {l.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {l.status === 'pending' ? (
                        <button
                          onClick={() => handleCancelLeave(l.id)}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 transition"
                        >
                          Cancel
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">Apply for Leave</h3>
                <p className="text-xs text-slate-500">Submit a new request for manager approval</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Leave Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900 bg-white"
                >
                  <option value="Annual Leave">Annual Leave ({balances.annual.total - balances.annual.used} days left)</option>
                  <option value="Sick Leave">Sick Leave ({balances.sick.total - balances.sick.used} days left)</option>
                  <option value="Casual Leave">Casual Leave ({balances.casual.total - balances.casual.used} days left)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Leave</label>
                <textarea
                  required
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Provide context for your team lead..."
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}