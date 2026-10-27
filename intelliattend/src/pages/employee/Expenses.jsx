import { useState, useEffect, useRef } from 'react';
import {
  IndianRupee, Plus, CheckCircle2, Clock, XCircle,
  Receipt, Upload, FileText, X, Eye, Loader2, DollarSign
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const CATEGORIES = [
  'Meal & Hospitality',
  'Travel & Commute',
  'Tech Equipment',
  'Office Supplies',
  'Internet & Phone',
  'Client Entertainment',
  'General Corporate'
];

export default function EmployeeExpenses() {
  const { user } = useAuth();
  const userId = user?.id || 'IA-EM-001';

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Meal & Hospitality',
    amountInr: '',
    expenseDate: new Date().toISOString().split('T')[0],
    description: '',
  });

  const fetchExpenses = async () => {
    try {
      const res = await api.get(`/expenses/my?userId=${userId}`);
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setExpenses(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [userId]);

  const handleSubmitExpense = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amountInr || !formData.expenseDate) return;

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('userId', userId);
      data.append('title', formData.title);
      data.append('category', formData.category);
      data.append('amountInr', formData.amountInr);
      data.append('expenseDate', formData.expenseDate);
      data.append('description', formData.description);
      if (selectedFile) {
        data.append('receipt', selectedFile);
      }

      const res = await api.post('/expenses/submit', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success) {
        setFeedback('Expense claim submitted with Cloudinary receipt storage!');
        setTimeout(() => setFeedback(''), 4000);
        setIsModalOpen(false);
        setFormData({
          title: '',
          category: 'Meal & Hospitality',
          amountInr: '',
          expenseDate: new Date().toISOString().split('T')[0],
          description: '',
        });
        setSelectedFile(null);
        fetchExpenses();
      }
    } catch (err) {
      console.error('Failed to submit expense:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelExpense = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses(expenses.filter(e => e.id !== id));
      setFeedback('Pending expense claim cancelled successfully.');
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      console.error('Failed to cancel expense:', err);
    }
  };

  const filteredExpenses = expenses.filter(e => {
    if (activeTab === 'all') return true;
    return e.status === activeTab;
  });

  // Calculate stats in INR (₹)
  const totalClaimed = expenses.reduce((acc, curr) => acc + Number(curr.amountInr || 0), 0);
  const totalApproved = expenses
    .filter(e => e.status === 'approved' || e.status === 'reimbursed')
    .reduce((acc, curr) => acc + Number(curr.amountInr || 0), 0);
  const totalPending = expenses
    .filter(e => e.status === 'pending')
    .reduce((acc, curr) => acc + Number(curr.amountInr || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Expenses & Reimbursements
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Submit business claims, upload receipts to Cloudinary, and track approval status in INR (₹)
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-700 text-white text-sm font-semibold shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4 text-teal-400 dark:text-white" />
          <span>New Expense Claim</span>
        </button>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span className="font-semibold">{feedback}</span>
          </div>
          <button type="button" onClick={() => setFeedback('')} className="text-teal-600 dark:text-teal-400 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Claims Submitted</p>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
                ₹{totalClaimed.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{expenses.length} claims submitted</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
            <IndianRupee className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Approved & Reimbursed</p>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">
                ₹{totalApproved.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Ready for settlement</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Awaiting Manager Approval</p>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
                ₹{totalPending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">Pending review</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Clock className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Tab Filters */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { id: 'all', label: 'All Claims' },
              { id: 'pending', label: 'Pending' },
              { id: 'approved', label: 'Approved' },
              { id: 'reimbursed', label: 'Reimbursed' },
              { id: 'rejected', label: 'Rejected' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
                  activeTab === tab.id
                    ? 'bg-slate-900 dark:bg-teal-600 text-teal-300 dark:text-white shadow-2xs font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{filteredExpenses.length} records</span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-teal-600 dark:text-teal-400" />
              <p className="text-xs">Loading live expenses from Neon PostgreSQL...</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Expense Details</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Amount (INR)</th>
                  <th className="px-6 py-3.5">Receipt</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs">
                      No expense records found in this category.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 dark:text-white text-xs">{exp.title}</div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 max-w-xs truncate">{exp.description || 'No description provided'}</div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-700 dark:text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
                          {exp.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-600 dark:text-slate-400">
                        {exp.expenseDate}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white text-xs">
                        ₹{Number(exp.amountInr).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4">
                        {exp.receiptUrl ? (
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(exp.receiptUrl)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 text-[11px] font-bold border border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/60 transition cursor-pointer"
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
                          exp.status === 'reimbursed' ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300'
                            : exp.status === 'approved' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                            : exp.status === 'pending' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                            : 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300'
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
                          <button
                            onClick={() => handleCancelExpense(exp.id)}
                            className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-800 transition cursor-pointer"
                          >
                            Cancel
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">{exp.paymentRef ? exp.paymentRef : '—'}</span>
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

      {/* Submit Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">New Expense Reimbursement</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Attach receipts for Cloudinary storage and manager approval</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitExpense} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Expense Title / Item *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Client Architecture Lunch & Product Review"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900 dark:focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900 dark:focus:border-teal-500"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Amount (₹ INR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="2450.00"
                    value={formData.amountInr}
                    onChange={(e) => setFormData({ ...formData, amountInr: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900 dark:focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Expense Date *</label>
                <input
                  type="date"
                  required
                  value={formData.expenseDate}
                  onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900 dark:focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Business Justification / Description</label>
                <textarea
                  rows={2}
                  placeholder="Explain the business purpose of this expenditure..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900 dark:focus:border-teal-500 resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Receipt Attachment (Cloudinary Storage)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:border-teal-500 dark:hover:border-teal-400 hover:bg-teal-50/40 dark:hover:bg-teal-950/20 transition flex items-center justify-center gap-2 cursor-pointer text-slate-600 dark:text-slate-300"
                >
                  <Upload className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span className="font-semibold">{selectedFile ? selectedFile.name : 'Choose receipt image or PDF invoice'}</span>
                </button>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-700 text-white shadow cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{submitting ? 'Submitting...' : 'Submit Claim'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Preview Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-teal-600 dark:text-teal-400" /> Cloudinary Verified Receipt
              </span>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center max-h-[70vh]">
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