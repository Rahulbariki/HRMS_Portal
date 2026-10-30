import { useState, useEffect } from 'react';
import {
  IndianRupee, Receipt, Plus, Search, Filter, Trash2, CheckCircle2,
  Calendar, Building2, Tag, CreditCard, ArrowUpRight, TrendingDown
} from 'lucide-react';
import clsx from 'clsx';
import api from '../../services/api';

const CATEGORIES = [
  'All',
  'SaaS & Cloud Infrastructure',
  'Utilities & Network',
  'Office Infrastructure',
  'Hardware & Equipment',
  'Travel & Logistics',
  'Vendor Professional Services'
];

export default function ManagerInternalExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [feedback, setFeedback] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'SaaS & Cloud Infrastructure',
    amount_inr: '',
    expense_date: new Date().toISOString().split('T')[0],
    vendor: '',
    payment_method: 'Corporate Credit Card',
    notes: ''
  });

  const fetchInternalExpenses = async () => {
    try {
      const res = await api.get('/manager/internal-expenses');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setExpenses(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching internal expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternalExpenses();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/manager/internal-expenses', formData);
      if (res.data?.success) {
        setFeedback(`Internal expense "${formData.title}" logged successfully!`);
        setShowModal(false);
        setFormData({
          title: '',
          category: 'SaaS & Cloud Infrastructure',
          amount_inr: '',
          expense_date: new Date().toISOString().split('T')[0],
          vendor: '',
          payment_method: 'Corporate Credit Card',
          notes: ''
        });
        fetchInternalExpenses();
        setTimeout(() => setFeedback(''), 4000);
      }
    } catch (err) {
      console.error('Error creating expense:', err);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete expense record "${title}"?`)) return;
    try {
      await api.delete(`/manager/internal-expenses/${id}`);
      setFeedback(`Expense "${title}" deleted.`);
      fetchInternalExpenses();
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const filteredExpenses = expenses.filter(e => {
    const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      e.title.toLowerCase().includes(q) ||
      (e.vendor && e.vendor.toLowerCase().includes(q)) ||
      e.category.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const totalBurn = expenses.reduce((acc, curr) => acc + Number(curr.amount_inr || 0), 0);
  const cloudSpend = expenses
    .filter(e => e.category.includes('SaaS') || e.category.includes('Cloud'))
    .reduce((acc, curr) => acc + Number(curr.amount_inr || 0), 0);
  const officeSpend = expenses
    .filter(e => e.category.includes('Office') || e.category.includes('Hardware'))
    .reduce((acc, curr) => acc + Number(curr.amount_inr || 0), 0);
  const utilitiesSpend = expenses
    .filter(e => e.category.includes('Utilities') || e.category.includes('Network'))
    .reduce((acc, curr) => acc + Number(curr.amount_inr || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Company Internal Operational Expenses
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track company-wide operational expenditures, SaaS vendors, cloud subscriptions, and office overhead.
          </p>
        </div>
        <div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-900 dark:bg-teal-600 text-white hover:bg-slate-800 transition shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Log Operational Expense
          </button>
        </div>
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

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Operational Burn</p>
            <p className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-1">
              ₹{totalBurn.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">YTD Operating overhead</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <IndianRupee className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">SaaS & Cloud Compute</p>
            <p className="font-display text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
              ₹{cloudSpend.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Neon, Cloudinary, AWS</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Receipt className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Office & Hardware</p>
            <p className="font-display text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              ₹{officeSpend.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Campus workstations</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Building2 className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Utilities & Leased Line</p>
            <p className="font-display text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              ₹{utilitiesSpend.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">High-speed uplinks</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <CreditCard className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search operational expenses by title, vendor, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-900 dark:text-white"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Expense Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Vendor & Method</th>
                <th className="px-6 py-4">Disbursal Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    Loading expense records...
                  </td>
                </tr>
              ) : filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    No matching internal expenses found.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900 dark:text-white leading-tight">{exp.title}</p>
                      {exp.notes && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{exp.notes}</p>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
                        {exp.category}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{exp.vendor || 'Corporate Vendor'}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{exp.payment_method}</p>
                    </td>

                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">
                      {exp.expense_date}
                    </td>

                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      ₹{Number(exp.amount_inr).toLocaleString('en-IN')}
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        Settled
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(exp.id, exp.title)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        title="Delete Entry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Log Internal Operational Expenditure
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Record corporate procurement, cloud service charges, or facility bills.
            </p>

            <form onSubmit={handleCreate} className="mt-4 space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Expense Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Neon Serverless Postgres Enterprise Cluster"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  {CATEGORIES.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Amount (INR ₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.amount_inr}
                    onChange={(e) => setFormData({ ...formData, amount_inr: e.target.value })}
                    placeholder="45000"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.expense_date}
                    onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Vendor Name</label>
                  <input
                    type="text"
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    placeholder="e.g. Neon Inc."
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="Corporate Credit Card">Corporate Credit Card</option>
                    <option value="Bank Wire Transfer">Bank Wire Transfer</option>
                    <option value="Corporate UPI">Corporate UPI</option>
                    <option value="Direct Debit">Direct Debit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes & PO Reference</label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional billing reference or purchase order number"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm bg-slate-900 dark:bg-teal-600 text-white font-semibold"
                >
                  Save Expenditure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

