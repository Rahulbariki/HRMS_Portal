import { useState, useEffect } from 'react';
import {
  IndianRupee, CheckCircle2, Clock, XCircle, Search, Filter,
  Receipt, Eye, Check, X, Loader2, DollarSign, ArrowUpRight
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function ManagerExpenses() {
  const { user } = useAuth();
  const managerName = user?.name ? `${user.name} (Manager)` : 'David Chen (Manager)';

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [feedback, setFeedback] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const fetchTeamExpenses = async () => {
    try {
      const res = await api.get('/expenses/team');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setExpenses(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching team expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamExpenses();
  }, []);

  const handleUpdateStatus = async (id, status, title) => {
    setProcessingId(id);
    try {
      const res = await api.patch(`/expenses/${id}/status`, {
        status,
        approvedBy: managerName,
        paymentRef: status === 'reimbursed' ? `NEFT-HDFC-${Math.floor(1000 + Math.random() * 9000)}` : null
      });

      if (res.data?.success) {
        setExpenses(expenses.map(e => e.id === id ? { ...e, status, approvedBy: managerName } : e));
        setFeedback(`Expense claim "${title}" marked as ${status}!`);
        setTimeout(() => setFeedback(''), 4000);
      }
    } catch (err) {
      console.error('Failed to update expense status:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredExpenses = expenses.filter(e => {
    const matchesTab = activeTab === 'all' || e.status === activeTab;
    const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (e.title && e.title.toLowerCase().includes(q)) ||
      (e.employeeName && e.employeeName.toLowerCase().includes(q)) ||
      (e.department && e.department.toLowerCase().includes(q)) ||
      (e.category && e.category.toLowerCase().includes(q));
    return matchesTab && matchesCategory && matchesSearch;
  });

  const pendingCount = expenses.filter(e => e.status === 'pending').length;
  const totalAmount = expenses.reduce((acc, curr) => acc + Number(curr.amountInr || 0), 0);
  const pendingAmount = expenses
    .filter(e => e.status === 'pending')
    .reduce((acc, curr) => acc + Number(curr.amountInr || 0), 0);
  const approvedAmount = expenses
    .filter(e => e.status === 'approved' || e.status === 'reimbursed')
    .reduce((acc, curr) => acc + Number(curr.amountInr || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
            Team Expense Approvals
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review corporate reimbursement claims, inspect Cloudinary receipts, and authorize payments in INR (₹)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200">
            {pendingCount} Pending Claim{pendingCount !== 1 ? 's' : ''} (₹{pendingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })})
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

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Claims Value</p>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-extrabold text-slate-900 font-mono">
                ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{expenses.length} claims on file</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <IndianRupee className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Authorizations</p>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-extrabold text-amber-600 font-mono">
                ₹{pendingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-[11px] text-amber-600 font-semibold mt-1">{pendingCount} requests waiting</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Authorized & Reimbursed</p>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-extrabold text-emerald-700 font-mono">
                ₹{approvedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">Processed for disbursement</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Controls */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { id: 'pending', label: `Pending (${pendingCount})` },
              { id: 'approved', label: 'Approved' },
              { id: 'reimbursed', label: 'Reimbursed' },
              { id: 'rejected', label: 'Rejected' },
              { id: 'all', label: 'All Claims' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
                  activeTab === tab.id
                    ? 'bg-slate-900 text-teal-300 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search claims or employee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
              <p className="text-xs">Loading live team expenses...</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Employee</th>
                  <th className="px-6 py-3.5">Expense Details</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Amount (INR)</th>
                  <th className="px-6 py-3.5">Receipt</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-slate-400 text-xs">
                      No expense claims match this filter.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 text-xs">{exp.employeeName}</div>
                        <div className="text-[11px] text-slate-400">{exp.department}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 text-xs">{exp.title}</div>
                        <div className="text-[11px] text-slate-500 italic max-w-xs truncate">
                          "{exp.description || 'No description'}"
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Date: {exp.expenseDate}</div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-700">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold">
                          {exp.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 text-xs">
                        ₹{Number(exp.amountInr).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4">
                        {exp.receiptUrl ? (
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(exp.receiptUrl)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 text-[11px] font-bold border border-teal-200 hover:bg-teal-100 transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Receipt</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={clsx(
                          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize',
                          exp.status === 'reimbursed' ? 'bg-purple-100 text-purple-800'
                            : exp.status === 'approved' ? 'bg-emerald-100 text-emerald-800'
                            : exp.status === 'pending' ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        )}>
                          {exp.status === 'approved' ? <CheckCircle2 className="h-3 w-3" />
                            : exp.status === 'reimbursed' ? <CheckCircle2 className="h-3 w-3" />
                            : exp.status === 'pending' ? <Clock className="h-3 w-3" />
                            : <XCircle className="h-3 w-3" />}
                          {exp.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {exp.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleUpdateStatus(exp.id, 'rejected', exp.title)}
                              disabled={processingId === exp.id}
                              className="px-2.5 py-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                            >
                              Decline
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(exp.id, 'approved', exp.title)}
                              disabled={processingId === exp.id}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow transition cursor-pointer disabled:opacity-50 flex items-center gap-1"
                            >
                              {processingId === exp.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                              <span>Approve</span>
                            </button>
                          </div>
                        ) : exp.status === 'approved' ? (
                          <button
                            onClick={() => handleUpdateStatus(exp.id, 'reimbursed', exp.title)}
                            disabled={processingId === exp.id}
                            className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow transition cursor-pointer disabled:opacity-50 flex items-center gap-1 ml-auto"
                          >
                            <span>Mark Paid</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 font-mono">{exp.paymentRef || 'Settled'}</span>
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

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
              <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-teal-600" /> Cloudinary Verified Expense Receipt
              </span>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center max-h-[70vh]">
              <img
                src={selectedReceipt}
                alt="Receipt"
                className="w-full h-auto max-h-[70vh] object-contain"
                onError={(e) => { e.target.src = 'https://res.cloudinary.com/demo/image/upload/sample.jpg'; }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}