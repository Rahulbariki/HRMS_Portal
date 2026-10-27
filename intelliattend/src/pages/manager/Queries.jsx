import { useState, useEffect } from 'react';
import {
  HelpCircle, Search, MessageSquare, Clock,
  CheckCircle2, AlertCircle, X, Loader2, RefreshCw,
  Send, ShieldCheck, Check, Edit2
} from 'lucide-react';
import clsx from 'clsx';
import api from '../../services/api';

export default function ManagerQueries() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [resolvingTicket, setResolvingTicket] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolutionStatus, setResolutionStatus] = useState('resolved');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchTeamTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tickets');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setTickets(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching team queries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamTickets();
  }, []);

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!resolvingTicket) return;

    try {
      setSubmitting(true);
      const res = await api.patch(`/tickets/${resolvingTicket.id}/status`, {
        status: resolutionStatus,
        resolutionNotes
      });

      if (res.data?.success) {
        setFeedback({
          type: 'success',
          text: `Ticket ${resolvingTicket.ticketRef} updated to "${resolutionStatus}"!`
        });
        setResolvingTicket(null);
        setResolutionNotes('');
        fetchTeamTickets();
      } else {
        setFeedback({ type: 'error', text: res.data?.message || 'Failed to update ticket' });
      }
    } catch (err) {
      console.error('Error resolving ticket:', err);
      setFeedback({ type: 'error', text: 'Server error updating ticket resolution.' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.ticketRef?.toLowerCase().includes(search.toLowerCase()) ||
      t.userName?.toLowerCase().includes(search.toLowerCase()) ||
      t.subject?.toLowerCase().includes(search.toLowerCase()) ||
      t.category?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openCount = tickets.filter(t => t.status === 'open').length;
  const inProgressCount = tickets.filter(t => t.status === 'in_progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved').length;

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        <p className="text-xs font-semibold">Loading team support queries from Neon PostgreSQL...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">Team Queries & Grievances</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review and resolve employee requests, attendance adjustments, and departmental queries
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchTeamTickets()}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={clsx(
            'p-4 rounded-xl border flex items-center justify-between text-xs font-semibold',
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          )}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="font-bold cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Queries</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{tickets.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Open / Pending</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{openCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">In Progress</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{inProgressCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Resolved</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{resolvedCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by employee name, subject, ref..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Queries List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
            <HelpCircle className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-semibold">No queries match the selected filters.</p>
          </div>
        ) : (
          filteredTickets.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 hover:border-slate-300 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                    {t.ticketRef}
                  </span>
                  <span className="font-semibold text-slate-900 text-sm">{t.userName}</span>
                  <span className="text-xs text-slate-400 font-mono">({t.userEmail})</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                    {t.category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={clsx(
                      'px-2.5 py-1 rounded-full text-xs font-bold capitalize',
                      t.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : t.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    )}
                  >
                    {t.status.replace('_', ' ')}
                  </span>
                  <button
                    onClick={() => {
                      setResolvingTicket(t);
                      setResolutionNotes(t.resolutionNotes || '');
                      setResolutionStatus(t.status === 'resolved' ? 'resolved' : 'in_progress');
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-teal-500 hover:text-teal-600 text-xs font-semibold text-slate-700 transition cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Update / Resolve</span>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base">{t.subject}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{t.description}</p>
              </div>

              {t.resolutionNotes && (
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-xs">
                  <p className="font-semibold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Official Resolution Note:</span>
                  </p>
                  <p className="text-emerald-800 mt-1 pl-5.5">{t.resolutionNotes}</p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Raised: {t.createdAt}</span>
                <span>Priority: <strong className="text-slate-700">{t.priority}</strong></span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Resolve / Update Modal */}
      {resolvingTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 rounded-2xl shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Update Query {resolvingTicket.ticketRef}
                </h3>
                <p className="text-xs text-slate-500">{resolvingTicket.userName} • {resolvingTicket.subject}</p>
              </div>
              <button onClick={() => setResolvingTicket(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Update Status</label>
                <select
                  value={resolutionStatus}
                  onChange={(e) => setResolutionStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Resolution Notes / Action Taken</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Explain resolution, dispatched items, or payroll adjustment applied..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResolvingTicket(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow disabled:opacity-50 cursor-pointer"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{submitting ? 'Saving...' : 'Save Resolution'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}