import { useState, useEffect } from 'react';
import { CheckCircle2, Check, X, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function ManagerLeaves() {
  const { user } = useAuth();
  const managerName = user?.name ? `${user.name} (Manager)` : 'David Chen (Manager)';

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [feedback, setFeedback] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const fetchTeamLeaves = async () => {
    try {
      const res = await api.get('/leaves/team');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setRequests(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching team leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamLeaves();
  }, []);

  const handleApprove = async (id, name) => {
    setProcessingId(id);
    try {
      const res = await api.patch(`/leaves/${id}/status`, {
        status: 'approved',
        approvedBy: managerName
      });
      if (res.data?.success) {
        setRequests(requests.map(r => r.id === id ? { ...r, status: 'approved', approvedBy: managerName } : r));
        setFeedback(`Leave approved for ${name}! Balances updated in Neon PostgreSQL.`);
        setTimeout(() => setFeedback(''), 4000);
      }
    } catch (err) {
      console.error('Failed to approve leave:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id, name) => {
    setProcessingId(id);
    try {
      const res = await api.patch(`/leaves/${id}/status`, {
        status: 'rejected',
        approvedBy: managerName
      });
      if (res.data?.success) {
        setRequests(requests.map(r => r.id === id ? { ...r, status: 'rejected', approvedBy: managerName } : r));
        setFeedback(`Leave rejected for ${name}.`);
        setTimeout(() => setFeedback(''), 4000);
      }
    } catch (err) {
      console.error('Failed to reject leave:', err);
    } finally {
      setProcessingId(null);
    }
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
          <p className="text-sm text-slate-500 mt-1">Review, approve, or decline time-off applications synchronized with Neon PostgreSQL</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200">
            {pendingCount} Pending Request{pendingCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {feedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{feedback}</span>
          </div>
          <button type="button" onClick={() => setFeedback('')} className="text-emerald-700 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 overflow-x-auto">
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
              'px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
              activeTab === tab.id
                ? 'bg-slate-900 text-teal-300 shadow font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Cards List for Requests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
            <p className="text-xs">Loading live leave requests...</p>
          </div>
        ) : filtered.length === 0 ? (
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
                    <img
                      src={req.avatar || '/avatar_rahul.png'}
                      alt={req.employeeName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      onError={(e) => { e.target.src = '/avatar_rahul.png'; }}
                    />
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
                    <span className="text-slate-500">Duration:</span>
                    <span className="font-mono text-slate-800">{req.startDate} to {req.endDate} ({req.days} days)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Applied On:</span>
                    <span className="text-slate-600">{req.appliedOn}</span>
                  </div>
                  <div className="pt-1 text-slate-600 italic">
                    "{req.reason}"
                  </div>
                </div>
              </div>

              {req.status === 'pending' ? (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleReject(req.id, req.employeeName)}
                    disabled={processingId === req.id}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Decline</span>
                  </button>
                  <button
                    onClick={() => handleApprove(req.id, req.employeeName)}
                    disabled={processingId === req.id}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow transition cursor-pointer disabled:opacity-50"
                  >
                    {processingId === req.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    <span>Approve</span>
                  </button>
                </div>
              ) : (
                <div className="text-xs text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span>Reviewed by:</span>
                  <span className="font-semibold text-slate-700">{req.approvedBy || 'Manager'}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}