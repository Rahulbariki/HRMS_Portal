import { useState, useEffect } from 'react';
import {
  FileText, Plus, CheckCircle2, Clock, XCircle, Search,
  Download, Eye, Send, ArrowUpRight, IndianRupee, Printer
} from 'lucide-react';
import clsx from 'clsx';
import api from '../../services/api';

export default function PayrollAdminInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState(null);

  // Form State
  const [month, setMonth] = useState('October');
  const [year, setYear] = useState(2026);
  const [notes, setNotes] = useState('');

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/payroll-admin/invoices');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setInvoices(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/payroll-admin/invoices', { month, year, notes });
      if (res.data?.success) {
        setFeedback(`Payroll Invoice for ${month} ${year} generated!`);
        setShowCreateModal(false);
        setNotes('');
        fetchInvoices();
        setTimeout(() => setFeedback(''), 4000);
      }
    } catch (err) {
      console.error('Failed to create invoice:', err);
    }
  };

  const handleSubmit = async (id, invNum) => {
    try {
      const res = await api.post(`/payroll-admin/invoices/${id}/submit`);
      if (res.data?.success) {
        setFeedback(`Invoice ${invNum} submitted for manager review!`);
        fetchInvoices();
        setTimeout(() => setFeedback(''), 4000);
      }
    } catch (err) {
      console.error('Submit failed:', err);
    }
  };

  const handleCancel = async (id, invNum) => {
    if (!window.confirm(`Mark invoice ${invNum} as cancelled?`)) return;
    try {
      const res = await api.post(`/payroll-admin/invoices/${id}/cancel`);
      if (res.data?.success) {
        setFeedback(`Invoice ${invNum} marked as cancelled.`);
        fetchInvoices();
        setTimeout(() => setFeedback(''), 4000);
      }
    } catch (err) {
      console.error('Cancel failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Monthly Payroll Invoices & Disbursal Orders
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Consolidate gross earnings, provident fund withholdings, and professional tax deductions into payable batches.
          </p>
        </div>
        <div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-900 dark:bg-teal-600 text-white hover:bg-slate-800 transition shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Create Payroll Run
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

      {/* Invoices Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Invoice Number</th>
                <th className="px-6 py-4">Billing Month</th>
                <th className="px-6 py-4">Total Staff</th>
                <th className="px-6 py-4">Gross Total</th>
                <th className="px-6 py-4">Deductions</th>
                <th className="px-6 py-4">Net Payout</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                  <td className="px-6 py-4 font-mono font-medium text-slate-900 dark:text-white">
                    {inv.invoice_number}
                  </td>
                  <td className="px-6 py-4 text-slate-800 dark:text-slate-200 font-medium">
                    {inv.month} {inv.year}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    {inv.total_employees} Employees
                  </td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                    ₹{Number(inv.gross_amount).toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-rose-600 dark:text-rose-400">
                    -₹{Number(inv.total_deductions).toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{Number(inv.net_disbursal).toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={clsx(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
                      inv.status === 'paid'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : inv.status === 'submitted'
                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                        : inv.status === 'cancelled'
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    )}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {inv.status === 'paid' ? 'Paid / Settled' : inv.status === 'submitted' ? 'Under Review' : inv.status === 'cancelled' ? 'Cancelled' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setPreviewInvoice(inv)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="View Summary"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {inv.status === 'draft' && (
                        <button
                          onClick={() => handleSubmit(inv.id, inv.invoice_number)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition"
                        >
                          Submit
                        </button>
                      )}

                      {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancel(inv.id, inv.invoice_number)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                          title="Cancel Batch"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Generate Payroll Batch Invoice
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Consolidate verified employee salary records into a single payable invoice.
            </p>

            <form onSubmit={handleCreateInvoice} className="mt-4 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Month *</label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Year</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Processing Notes</label>
                <textarea
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. October monthly salary run for engineering and operations teams."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm bg-slate-900 dark:bg-teal-600 text-white font-semibold"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Detail / Print Modal */}
      {previewInvoice && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-8 border border-slate-200 dark:border-slate-800 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                  Corporate Payroll Order
                </span>
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {previewInvoice.invoice_number}
                </h3>
              </div>
              <FileText className="h-8 w-8 text-teal-600" />
            </div>

            <div className="mt-5 space-y-3 text-sm text-slate-700 dark:text-slate-300">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Billing Period:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{previewInvoice.month} {previewInvoice.year}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Staff Count:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{previewInvoice.total_employees} Salaried Personnel</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Gross Remuneration:</span>
                <span className="font-semibold text-slate-900 dark:text-white">₹{Number(previewInvoice.gross_amount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Statutory Deductions (EPF + TDS):</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">-₹{Number(previewInvoice.total_deductions).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-2 border-b-2 border-slate-900 dark:border-teal-500">
                <span className="font-bold text-slate-900 dark:text-white">Net Total Bank Disbursal:</span>
                <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">₹{Number(previewInvoice.net_disbursal).toLocaleString('en-IN')}</span>
              </div>
              {previewInvoice.payment_ref && (
                <div className="flex justify-between py-1.5 text-xs text-slate-500">
                  <span>Bank Wire Ref:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{previewInvoice.payment_ref}</span>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setPreviewInvoice(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-900 dark:bg-teal-600 text-white"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

