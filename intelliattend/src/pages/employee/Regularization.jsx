import { useState, useMemo, useEffect } from 'react';
import {
  RefreshCw, Plus, Clock, CheckCircle2,
  XCircle, AlertCircle, X, Search, Loader2
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';


export default function EmployeeRegularization() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [date, setDate] = useState('');
  const [reqIn, setReqIn] = useState('09:00');
  const [reqOut, setReqOut] = useState('18:30');
  const [reasonType, setReasonType] = useState('Biometric / Scanner Issue');
  const [reasonDetails, setReasonDetails] = useState('');

  const fetchRegularizations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/regularizations?userId=' + (user?.employeeId || 'IA-EM-001'));
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setRequests(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch regularizations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegularizations();
  }, [user]);

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      if (filterStatus !== 'All' && req.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          (req.attendanceDate && req.attendanceDate.toLowerCase().includes(q)) ||
          (req.reasonType && req.reasonType.toLowerCase().includes(q)) ||
          (req.reasonDetails && req.reasonDetails.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [requests, filterStatus, searchQuery]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date) return;

    try {
      const res = await api.post('/regularizations', {
        userId: user?.employeeId || 'IA-EM-001',
        userName: user?.name || 'Sarah Miller',
        attendanceDate: date,
        requestedClockIn: reqIn,
        requestedClockOut: reqOut,
        reasonType,
        reasonDetails,
      });

      if (res.data?.success && res.data.data) {
        setRequests([res.data.data, ...requests]);
      } else {
        fetchRegularizations();
      }
    } catch (err) {
      console.error('Failed to submit regularization:', err);
    }

    setIsModalOpen(false);
    setDate('');
    setReasonDetails('');
  };


  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Attendance Regularization
          </h1>
          <p className="font-body mt-1 text-xs text-slate-500 dark:text-slate-400">
            Request corrections for missed punches or biometric discrepancies
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-teal-400 dark:text-white" />
          <span>Apply Regularization</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pending Requests</p>
            <p className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {requests.filter(r => r.status === 'Pending').length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Approved This Month</p>
            <p className="font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {requests.filter(r => r.status === 'Approved').length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Monthly Regularization Limit</p>
            <p className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {requests.length} / 5
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
            <RefreshCw className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search regularizations..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900 dark:focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilterStatus(status)}
              className={clsx(
                'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer',
                filterStatus === status
                  ? 'bg-slate-900 dark:bg-teal-600 text-teal-300 dark:text-white shadow-2xs font-bold'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="text-[11px] font-bold text-slate-400 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 uppercase">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Original Punch</th>
                <th className="py-3 px-4">Requested Punch</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Manager Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                  <td className="py-4 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {req.attendanceDate} ({req.day.slice(0, 3)})
                  </td>
                  <td className="py-4 px-4 text-slate-500 dark:text-slate-400">
                    <span className="block text-[11px]">{req.originalClockIn}</span>
                    <span className="block text-[10px] text-slate-400">to {req.originalClockOut}</span>
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    <span className="block text-[11px] text-emerald-700 dark:text-emerald-400">{req.requestedClockIn}</span>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400">to {req.requestedClockOut}</span>
                  </td>
                  <td className="py-4 px-4 max-w-xs">
                    <p className="font-semibold text-slate-900 dark:text-white">{req.reasonType}</p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{req.reasonDetails}</p>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span
                      className={clsx(
                        'px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1 w-max',
                        req.status === 'Approved'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : req.status === 'Pending'
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                      )}
                    >
                      {req.status === 'Approved' && <CheckCircle2 className="w-3 h-3" />}
                      {req.status === 'Pending' && <Clock className="w-3 h-3" />}
                      {req.status === 'Rejected' && <XCircle className="w-3 h-3" />}
                      <span>{req.status}</span>
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-500 dark:text-slate-400 italic max-w-xs truncate">
                    {req.managerComment || 'Awaiting manager review'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Regularization Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in-0 zoom-in-95">
            <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base flex items-center gap-2">
                  <span>Regularize Attendance</span>
                  <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                </h3>
                <p className="text-slate-300 text-xs mt-0.5">Submit time adjustment for manager approval</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Attendance Date *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900 dark:focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Requested Clock In</label>
                  <input
                    type="time"
                    required
                    value={reqIn}
                    onChange={(e) => setReqIn(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900 dark:focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Requested Clock Out</label>
                  <input
                    type="time"
                    required
                    value={reqOut}
                    onChange={(e) => setReqOut(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900 dark:focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Discrepancy Reason Type *</label>
                <select
                  value={reasonType}
                  onChange={(e) => setReasonType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="Biometric / Scanner Issue">Biometric Scanner Failure / Network Glitch</option>
                  <option value="On-site Client Meeting">On-site Client Meeting / Official Travel</option>
                  <option value="Forgot to Clock In">Forgot to Clock In</option>
                  <option value="System Maintenance / Outage">System Maintenance / Outage</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Detailed Explanation</label>
                <textarea
                  rows={3}
                  value={reasonDetails}
                  onChange={(e) => setReasonDetails(e.target.value)}
                  placeholder="Describe context for your reporting manager..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900 dark:focus:border-teal-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800 text-teal-900 dark:text-teal-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Regularization requests are routed directly to {user?.manager || 'David Chen'} for verification.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-700 text-white font-bold transition cursor-pointer shadow-xs"
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
