import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Briefcase, 
  Search,
  Check,
  RefreshCw,
  Award
} from 'lucide-react';
import api from '../../services/api';

export default function ManagerOffboarding() {
  const [activeTab, setActiveTab] = useState('in_progress');
  const [searchTerm, setSearchTerm] = useState('');
  const [exitRequests, setExitRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/manager/offboarding-requests');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        const mapped = res.data.data.map(r => ({
          id: r.id,
          displayId: `SEP-2026-${String(r.id).padStart(3, '0')}`,
          employeeName: r.user_name || 'Staff Member',
          email: r.personal_email || `${r.user_id?.toLowerCase()}@intelliattend.com`,
          role: r.designation || 'Team Member',
          department: r.department || 'Operations',
          resignationDate: r.resignation_date ? new Date(r.resignation_date).toISOString().slice(0, 10) : '—',
          proposedLwd: r.requested_last_working_day ? new Date(r.requested_last_working_day).toISOString().slice(0, 10) : '—',
          status: r.status || 'under_review',
          reason: r.reason || 'Career Transition',
          ktSignoff: r.kt_status === 'completed',
          hardwareReturned: r.asset_return_status === 'returned',
          relievingIssued: Boolean(r.relieving_letter_issued)
        }));
        setExitRequests(mapped);
      }
    } catch (err) {
      console.error('Failed to load offboarding requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const toggleKt = async (req) => {
    try {
      const nextKt = req.ktSignoff ? 'pending' : 'completed';
      const res = await api.put(`/manager/offboarding-requests/${req.id}`, {
        kt_status: nextKt
      });
      if (res.data?.success) {
        setFeedback(`KT status updated for ${req.employeeName}`);
        fetchRequests();
        setTimeout(() => setFeedback(''), 3000);
      }
    } catch (err) {
      console.error('Failed to update KT:', err);
    }
  };

  const toggleHardware = async (req) => {
    try {
      const nextHardware = req.hardwareReturned ? 'in_custody' : 'returned';
      const res = await api.put(`/manager/offboarding-requests/${req.id}`, {
        asset_return_status: nextHardware
      });
      if (res.data?.success) {
        setFeedback(`Asset status updated for ${req.employeeName}`);
        fetchRequests();
        setTimeout(() => setFeedback(''), 3000);
      }
    } catch (err) {
      console.error('Failed to update asset return:', err);
    }
  };

  const handleApproveClearance = async (req) => {
    try {
      setActionLoading(true);
      const res = await api.post(`/manager/offboarding-requests/${req.id}/relieving-letter`);
      if (res.data?.success) {
        setFeedback(`Separation clearances verified and official relieving letter issued for ${req.employeeName}!`);
        fetchRequests();
        setTimeout(() => setFeedback(''), 4000);
      }
    } catch (err) {
      console.error('Failed to certify clearances:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const activeSeparations = exitRequests.filter(r => r.status !== 'completed');
  const archivedSeparations = exitRequests.filter(r => r.status === 'completed');
  const displayedRequests = (activeTab === 'in_progress' ? activeSeparations : archivedSeparations).filter(
    r => r.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || r.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <Briefcase className="w-6 h-6" />
            </span>
            Team Separation & Exit Governance
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review departmental resignation notices, authorize knowledge transfer (KT) milestones, and verify no-dues signoffs
          </p>
        </div>
        <button
          onClick={fetchRequests}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Separations</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{activeSeparations.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending KT Signoffs</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              {exitRequests.filter(r => !r.ktSignoff && r.status !== 'completed').length}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Completed Separations</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{archivedSeparations.length}</p>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('in_progress')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'in_progress'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Active Separations ({activeSeparations.length})
            </button>
            <button
              onClick={() => setActiveTab('archive')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'archive'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Archived ({archivedSeparations.length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs">Loading offboarding records...</div>
          ) : displayedRequests.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No separation requests found</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Department staff separation notices will appear here automatically.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-5">Separation ID & Candidate</th>
                  <th className="py-3.5 px-5">Dates (Resigned / LWD)</th>
                  <th className="py-3.5 px-5">Reason</th>
                  <th className="py-3.5 px-5">KT Milestone Signoff</th>
                  <th className="py-3.5 px-5">Asset Handover</th>
                  <th className="py-3.5 px-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {displayedRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-4 px-5">
                      <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold">{req.displayId}</span>
                      <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{req.employeeName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{req.email}</p>
                    </td>
                    <td className="py-4 px-5 text-xs text-slate-600 dark:text-slate-300">
                      <div><span className="text-slate-400">Notice:</span> {req.resignationDate}</div>
                      <div className="font-semibold text-rose-600 dark:text-rose-400 mt-1"><span className="text-slate-400">LWD:</span> {req.proposedLwd}</div>
                    </td>
                    <td className="py-4 px-5 text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {req.reason}
                    </td>
                    <td className="py-4 px-5">
                      <button
                        onClick={() => toggleKt(req)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                          req.ktSignoff
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {req.ktSignoff ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {req.ktSignoff ? 'KT Signed Off' : 'Pending KT'}
                      </button>
                    </td>
                    <td className="py-4 px-5">
                      <button
                        onClick={() => toggleHardware(req)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                          req.hardwareReturned
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {req.hardwareReturned ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {req.hardwareReturned ? 'Hardware Received' : 'Hardware In-Custody'}
                      </button>
                    </td>
                    <td className="py-4 px-5">
                      {req.relievingIssued ? (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold flex items-center gap-1.5 w-fit">
                          <Award className="w-3.5 h-3.5" />
                          Relieving Issued
                        </span>
                      ) : (
                        <button
                          disabled={actionLoading || !req.ktSignoff || !req.hardwareReturned}
                          onClick={() => handleApproveClearance(req)}
                          className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          title={!req.ktSignoff || !req.hardwareReturned ? "KT and Hardware clearances must be completed first" : "Issue Relieving Letter"}
                        >
                          Certify Clearances
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
