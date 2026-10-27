import { useState, useEffect } from 'react';
import {
  HelpCircle, Plus, Search, MessageSquare, Clock,
  CheckCircle2, AlertCircle, X, Loader2, RefreshCw, Send, Shield
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function EmployeeSupportQuery() {
  const { user } = useAuth();
  const userId = user?.employeeId || user?.id || 'IA-EM-001';
  const userName = user ? `${user.firstName || user.first_name || 'Sarah'} ${user.lastName || user.last_name || 'Miller'}` : 'Sarah Miller';
  const userEmail = user?.loginEmail || user?.email || 'employee.intelliattend@gmail.com';

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [newTicket, setNewTicket] = useState({
    category: 'Payroll',
    priority: 'Normal',
    subject: '',
    description: '',
  });

  const fetchMyTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tickets?userEmail=${userEmail}`);
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setTickets(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching support tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTickets();
  }, [userEmail]);

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.subject || !newTicket.description) return;

    try {
      setSubmitting(true);
      const res = await api.post('/tickets', {
        userId,
        userName,
        userEmail,
        category: newTicket.category,
        priority: newTicket.priority,
        subject: newTicket.subject,
        description: newTicket.description,
      });

      if (res.data?.success) {
        setFeedback({ type: 'success', text: 'Support query submitted successfully! Reference created.' });
        setShowSubmitModal(false);
        setNewTicket({ category: 'Payroll', priority: 'Normal', subject: '', description: '' });
        fetchMyTickets();
      } else {
        setFeedback({ type: 'error', text: res.data?.message || 'Failed to submit ticket' });
      }
    } catch (err) {
      console.error('Error creating ticket:', err);
      setFeedback({ type: 'error', text: 'Server error while submitting support query' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.ticketRef?.toLowerCase().includes(search.toLowerCase()) ||
      t.subject?.toLowerCase().includes(search.toLowerCase()) ||
      t.category?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        <p className="text-xs font-semibold">Loading support queries from Neon PostgreSQL...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">Helpdesk & Support Queries</h1>
          <p className="text-sm text-slate-500 mt-1">
            Submit grievance queries, request payroll corrections, IT equipment, or benefits support
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchMyTickets()}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
            title="Refresh Queries"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowSubmitModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-md transition cursor-pointer"
          >
            <Plus className="h-4 w-4 text-teal-400" />
            <span>Raise New Query</span>
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

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search queries by reference or subject..."
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

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
            <HelpCircle className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-semibold">No support queries found.</p>
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 hover:border-slate-300 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                    {ticket.ticketRef}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                    {ticket.category}
                  </span>
                  <span
                    className={clsx(
                      'px-2 py-0.5 rounded-full text-[11px] font-bold uppercase',
                      ticket.priority === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                    )}
                  >
                    {ticket.priority} Priority
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={clsx(
                      'px-2.5 py-1 rounded-full text-xs font-bold capitalize',
                      ticket.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ticket.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    )}
                  >
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base">{ticket.subject}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{ticket.description}</p>
              </div>

              {ticket.resolutionNotes && (
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-xs">
                  <p className="font-semibold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Resolution Note from Support / HR:</span>
                  </p>
                  <p className="text-emerald-800 mt-1 pl-5.5">{ticket.resolutionNotes}</p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Submitted on {ticket.createdAt}</span>
                <span>Last updated {ticket.updatedAt}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Raise Ticket Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 rounded-2xl shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-display text-lg font-bold text-slate-900">Submit Support Query</h3>
              <button onClick={() => setShowSubmitModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitTicket} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  >
                    <option value="Payroll">Payroll & Tax</option>
                    <option value="Attendance">Attendance / Leave</option>
                    <option value="IT Assets">IT Assets & Hardware</option>
                    <option value="General HR">General HR Inquiry</option>
                    <option value="Benefits">Benefits & Insurance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High Priority</option>
                    <option value="Urgent">Urgent / Blocker</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Form 16 Part B query or Leave deduction"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Describe your query in detail..."
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
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
                  <span>{submitting ? 'Submitting...' : 'Submit Query'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}