import { useState, useEffect } from 'react';
import {
  FileText, Plus, CheckCircle2, Clock, XCircle, Search,
  Download, Eye, Send, ArrowUpRight, IndianRupee, Printer,
  Landmark, Users, ShieldCheck, Check, AlertCircle, RefreshCw
} from 'lucide-react';
import clsx from 'clsx';
import api from '../../services/api';
import PayslipModal from '../../components/PayslipModal';

export default function PayrollAdminInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState(null);

  // Disbursal State
  const [disburseModalInvoice, setDisburseModalInvoice] = useState(null);
  const [disburseRef, setDisburseRef] = useState('');
  const [disburseRemarks, setDisburseRemarks] = useState('');
  const [disbursing, setDisbursing] = useState(false);

  // Breakdown & Individual Payslip State
  const [detailsModalInvoice, setDetailsModalInvoice] = useState(null);
  const [detailsData, setDetailsData] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);

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

  // Open Disburse Modal
  const handleOpenDisburse = (inv) => {
    setDisburseModalInvoice(inv);
    const autoRef = `RTGS-${inv.year}-${String(inv.month).substring(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    setDisburseRef(autoRef);
    setDisburseRemarks(`Batch salary execution for ${inv.month} ${inv.year} via Corporate NetBanking.`);
  };

  // Execute Disbursal
  const handleExecuteDisburse = async (e) => {
    e.preventDefault();
    if (!disburseModalInvoice) return;
    setDisbursing(true);
    try {
      const res = await api.post(`/payroll-admin/invoices/${disburseModalInvoice.id}/disburse`, {
        paymentRef: disburseRef,
        remarks: disburseRemarks
      });
      if (res.data?.success) {
        setFeedback(res.data.message || `Payroll run ${disburseModalInvoice.invoice_number} successfully disbursed!`);
        setDisburseModalInvoice(null);
        fetchInvoices();
        setTimeout(() => setFeedback(''), 5000);
      }
    } catch (err) {
      console.error('Disbursal failed:', err);
      alert(err.response?.data?.message || 'Failed to disburse salaries.');
    } finally {
      setDisbursing(false);
    }
  };

  // Download Bank Wire File
  const handleDownloadBankWire = async (inv) => {
    try {
      const res = await api.get(`/payroll-admin/invoices/${inv.id}/export-bank-wire`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Bank_Wire_${inv.invoice_number}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setFeedback(`Downloaded bank wire CSV for ${inv.invoice_number}`);
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      console.error('Download bank wire failed:', err);
    }
  };

  // Open Batch Details & Employee Payslips
  const handleOpenDetails = async (inv) => {
    setDetailsModalInvoice(inv);
    setLoadingDetails(true);
    try {
      const res = await api.get(`/payroll-admin/invoices/${inv.id}/details`);
      if (res.data?.success && res.data.data) {
        setDetailsData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load batch details:', err);
    } finally {
      setLoadingDetails(false);
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-900 dark:bg-teal-600 text-white hover:bg-slate-800 transition shadow-sm cursor-pointer"
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
          <button onClick={() => setFeedback('')} className="text-teal-500 hover:text-teal-700 cursor-pointer">&times;</button>
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
                      {inv.status === 'paid' ? 'Paid / Settled' : inv.status === 'submitted' ? 'Approved / Disbursable' : inv.status === 'cancelled' ? 'Cancelled' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Summary & Staff Breakdown */}
                      <button
                        onClick={() => handleOpenDetails(inv)}
                        className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        title="View Staff Breakdown & Payslips"
                      >
                        <Users className="h-4 w-4" />
                      </button>

                      {/* Download Bank Wire CSV */}
                      <button
                        onClick={() => handleDownloadBankWire(inv)}
                        className="p-1.5 text-teal-600 hover:text-teal-700 dark:hover:text-teal-400 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950/40 transition cursor-pointer"
                        title="Export Bank Wire Batch (.CSV)"
                      >
                        <Download className="h-4 w-4" />
                      </button>

                      {/* Submit Draft */}
                      {inv.status === 'draft' && (
                        <button
                          onClick={() => handleSubmit(inv.id, inv.invoice_number)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition cursor-pointer"
                        >
                          Submit
                        </button>
                      )}

                      {/* Disburse Batch */}
                      {(inv.status === 'submitted' || inv.status === 'draft') && (
                        <button
                          onClick={() => handleOpenDisburse(inv)}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition cursor-pointer"
                        >
                          Disburse
                        </button>
                      )}

                      {/* Cancel */}
                      {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancel(inv.id, inv.invoice_number)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
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

      {/* Disbursal Modal */}
      {disburseModalInvoice && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  Execute Salary Disbursal
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {disburseModalInvoice.invoice_number} • {disburseModalInvoice.month} {disburseModalInvoice.year}
                </p>
              </div>
            </div>

            <form onSubmit={handleExecuteDisburse} className="mt-4 space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Net Disbursal:</span>
                  <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                    ₹{Number(disburseModalInvoice.net_disbursal).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Salaried Personnel:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {disburseModalInvoice.total_employees} Employees
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bank Wire / UTR Reference Number *
                </label>
                <input
                  type="text"
                  required
                  value={disburseRef}
                  onChange={(e) => setDisburseRef(e.target.value)}
                  className="w-full px-3.5 py-2 font-mono text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  placeholder="e.g. RTGS-2026-OCT-819201"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Disbursal Remarks
                </label>
                <textarea
                  rows="2"
                  value={disburseRemarks}
                  onChange={(e) => setDisburseRemarks(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setDisburseModalInvoice(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={disbursing}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {disbursing ? 'Authorizing Disbursal...' : 'Confirm Disbursal & Publish Payslips'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Details & Individual Staff Payslips Modal */}
      {detailsModalInvoice && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    Batch Inspection
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-400">
                    {detailsModalInvoice.invoice_number}
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  Salaried Staff Breakdown • {detailsModalInvoice.month} {detailsModalInvoice.year}
                </h3>
              </div>
              <button
                onClick={() => setDetailsModalInvoice(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              {loadingDetails ? (
                <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
                  <span>Loading batch personnel roster...</span>
                </div>
              ) : detailsData?.employees?.length ? (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-3">Employee</th>
                      <th className="px-4 py-3">Designation / Pod</th>
                      <th className="px-4 py-3">Bank Account</th>
                      <th className="px-4 py-3">Gross</th>
                      <th className="px-4 py-3">Deductions</th>
                      <th className="px-4 py-3">Net Payout</th>
                      <th className="px-4 py-3 text-right">Official Payslip</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {detailsData.employees.map((emp) => (
                      <tr key={emp.user_id} className="hover:bg-slate-50/60 dark:hover:bg-slate-850 transition">
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                          <p>{emp.user_name}</p>
                          <p className="text-[10px] font-mono text-slate-400">{emp.user_id}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          <p>{emp.designation}</p>
                          <p className="text-[10px] text-slate-400">{emp.department}</p>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-500">
                          •••• {String(emp.bank_account).slice(-4)}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-300">
                          ₹{Number(emp.gross).toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 font-mono text-rose-600">
                          -₹{Number(emp.deductions).toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{Number(emp.net).toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedPayslip({
                                month: `${detailsModalInvoice.month} ${detailsModalInvoice.year}`,
                                gross: emp.gross,
                                deductions: emp.deductions,
                                net: emp.net,
                                transactionRef: emp.transaction_ref || detailsModalInvoice.payment_ref || 'RTGS-SAL-PENDING',
                                payDate: detailsModalInvoice.due_date || '30th of Month'
                              });
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 border border-teal-200 dark:border-teal-800 transition text-[11px] font-semibold cursor-pointer"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Preview Payslip</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-12 text-center text-slate-400">No personnel records found for this batch.</div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0">
              <button
                onClick={() => setDetailsModalInvoice(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-teal-600 text-white cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
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
                  className="px-4 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm bg-slate-900 dark:bg-teal-600 text-white font-semibold cursor-pointer"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payslip Modal Preview */}
      {selectedPayslip && (
        <PayslipModal
          payslip={selectedPayslip}
          employee={{
            name: selectedPayslip.userName || 'Sarah Miller',
            id: selectedPayslip.userId || 'IA-EM-001',
            designation: 'Senior Software Engineer',
            department: 'Engineering Pod',
            bankAccount: 'HDFC0001849201',
            panNumber: 'ABCDE1234F'
          }}
          onClose={() => setSelectedPayslip(null)}
        />
      )}
    </div>
  );
}
