import { useState } from 'react';
import { CheckCircle2, Check, X } from 'lucide-react';
import clsx from 'clsx';

const INITIAL_TEAM_LEAVES = [
  {
    id: 1,
    employeeName: 'Rahul Bariki',
    employeeRole: 'Software Development Engineer',
    avatar: 'RB',
    type: 'Leave Without Pay',
    startDate: '2026-10-28',
    endDate: '2026-10-28',
    days: 1,
    reason: 'Personal legal documentation and property paperwork',
    appliedOn: '2026-10-26',
    status: 'pending',
  },
  {
    id: 2,
    employeeName: 'Michael Brown',
    employeeRole: 'Frontend Developer',
    avatar: 'MB',
    type: 'Annual Leave',
    startDate: '2026-12-24',
    endDate: '2026-12-30',
    days: 5,
    reason: 'Year-end holiday travel with family',
    appliedOn: '2026-10-24',
    status: 'pending',
  },
  {
    id: 3,
    employeeName: 'Jessica Taylor',
    employeeRole: 'UI/UX Designer',
    avatar: 'JT',
    type: 'Sick Leave',
    startDate: '2026-10-22',
    endDate: '2026-10-23',
    days: 2,
    reason: 'Severe migraine; doctor certificate attached',
    appliedOn: '2026-10-21',
    status: 'approved',
  },
  {
    id: 4,
    employeeName: 'Robert Vance',
    employeeRole: 'DevOps Engineer',
    avatar: 'RV',
    type: 'Casual Leave',
    startDate: '2026-10-18',
    endDate: '2026-10-18',
    days: 1,
    reason: 'Home appliance installation',
    appliedOn: '2026-10-17',
    status: 'approved',
  },
];

export default function ManagerLeaves() {
  const [requests, setRequests] = useState(INITIAL_TEAM_LEAVES);
  const [activeTab, setActiveTab] = useState('pending');
  const [feedback, setFeedback] = useState('');

  const handleApprove = (id, name) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: 'approved' } : r));
    setFeedback(`Leave approved for ${name}!`);
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleReject = (id, name) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
    setFeedback(`Leave rejected for ${name}.`);
    setTimeout(() => setFeedback(''), 3000);
  };

  const filtered = requests.filter(r => {
    if (activeTab === 'all') return true;
    return r.status === activeTab;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">Team Leave Approvals</h1>
          <p className="text-sm text-slate-500 mt-1">Review, approve, or decline time-off applications from your team</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200">
            {pendingCount} Pending Request{pendingCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {feedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
        {[
          { id: 'pending', label: `Pending Approvals (${pendingCount})` },
          { id: 'approved', label: 'Approved Requests' },
          { id: 'rejected', label: 'Rejected Requests' },
          { id: 'all', label: 'All Team Records' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'px-4 py-2 rounded-xl text-xs font-semibold transition-all',
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Cards List for Pending, or Table for All */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
            <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500/40 mb-3" />
            <p className="text-sm font-semibold text-slate-700">No requests in this category</p>
            <p className="text-xs text-slate-400 mt-1">You are all caught up with your team's schedule.</p>
          </div>
        ) : (
          filtered.map(req => (
            <div key={req.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                      {req.avatar}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-slate-900">{req.employeeName}</h3>
                      <p className="text-xs text-slate-400">{req.employeeRole}</p>
                    </div>
                  </div>
                  <span className={clsx(
                    'px-2.5 py-0.5 rounded-full text-xs font-bold capitalize',
                    req.status === 'approved' ? 'bg-emerald-100 text-emerald-800'
                      : req.status === 'pending' ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  )}>
                    {req.status}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl space-y-1.5 mb-4 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Leave Type:</span>
                    <span className="font-bold text-slate-800">{req.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dates:</span>
                    <span className="font-mono text-slate-800">{req.startDate} to {req.endDate} ({req.days} days)</span>
                  </div>
                  <div className="pt-1 text-slate-600 italic">
                    "{req.reason}"
                  </div>
                </div>
              </div>

              {req.status === 'pending' && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleReject(req.id, req.employeeName)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Decline</span>
                  </button>
                  <button
                    onClick={() => handleApprove(req.id, req.employeeName)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow transition"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Approve</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}