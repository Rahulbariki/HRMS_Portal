import { useState, useEffect } from 'react';
import {
  CreditCard, Download, CheckCircle2, Shield,
  Users, Zap, Loader2, Eye, Printer, X, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function ClientBillings() {
  const { user } = useAuth();
  const email = user?.email || 'clientadmin.intelliattend@gmail.com';

  const [overview, setOverview] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRenew, setAutoRenew] = useState(true);
  const [downloadNotice, setDownloadNotice] = useState('');
  const [activeInvoice, setActiveInvoice] = useState(null);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const [overRes, invRes] = await Promise.all([
        api.get(`/billing/overview?email=${email}`),
        api.get(`/billing/invoices?email=${email}`)
      ]);

      if (overRes.data?.success && overRes.data?.data) {
        setOverview(overRes.data.data);
        setAutoRenew(overRes.data.data.autoRenew ?? true);
      }
      if (invRes.data?.success && Array.isArray(invRes.data?.data)) {
        setInvoices(invRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching billing data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, [email]);

  const handleDownload = (inv) => {
    setActiveInvoice(inv);
    setDownloadNotice(`Viewing official GST invoice ${inv.id}`);
    setTimeout(() => setDownloadNotice(''), 3000);
  };

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        <p className="text-xs font-semibold">Loading enterprise billing & seat licenses from Neon PostgreSQL...</p>
      </div>
    );
  }

  const usedSeats = overview?.usedSeats || 480;
  const totalSeats = overview?.totalSeats || 500;
  const seatPct = Math.min(100, Math.round((usedSeats / totalSeats) * 100));

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Billing & Subscriptions</h1>
          <p className="text-slate-500 text-sm mt-1">Manage corporate enterprise licenses, seat capacity, and invoices</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchBillingData()}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
            title="Refresh Invoices"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          {downloadNotice && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3.5 py-2 rounded-xl">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              {downloadNotice}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:col-span-2 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                <Zap className="h-3 w-3" /> Active Plan
              </span>
              <h2 className="font-display text-2xl font-bold text-slate-800 pt-2">
                {overview?.plan || 'Enterprise Tier'}
              </h2>
              <p className="text-sm text-slate-500">
                Organization: <span className="font-semibold text-slate-700">{overview?.companyName || 'Acme Enterprise'}</span> ({overview?.subdomain || 'acme.hrms.portal'})
              </p>
            </div>
            <div className="text-right">
              <span className="font-display text-3xl font-extrabold text-teal-700">
                ₹{Number(overview?.annualFeeInr || 4800).toLocaleString('en-IN')}
              </span>
              <span className="text-sm text-slate-400 font-medium"> / year</span>
              <p className="text-xs text-slate-400 mt-1">Billed annually on {overview?.renewalDate || 'Oct 01, 2027'}</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-teal-600" /> Enterprise Seat Allocation
              </span>
              <span className="font-semibold text-slate-900 font-mono">
                {usedSeats} / {totalSeats} Used ({seatPct}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-teal-600 h-full rounded-full transition-all duration-500" style={{ width: `${seatPct}%` }} />
            </div>
            <p className="text-xs text-slate-500">
              {totalSeats - usedSeats} employee licenses remaining in current allocation tier.
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">Automatic Subscription Renewal</p>
              <p className="text-xs text-slate-500">Renews automatically via registered corporate payment instrument</p>
            </div>
            <button
              onClick={() => setAutoRenew(!autoRenew)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                autoRenew ? 'bg-teal-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoRenew ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-base font-bold text-slate-800">Primary Payment Instrument</h3>
              <Shield className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/75 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-teal-600">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">
                    {overview?.paymentMethod?.type || 'Corporate Visa'}
                  </p>
                  <p className="text-xs text-slate-500 font-mono">
                    •••• •••• •••• {overview?.paymentMethod?.last4 || '4242'}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200">
                <span>Expires {overview?.paymentMethod?.expiry || '12/28'}</span>
                <span className="text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded">Default Active</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={() => alert('Corporate card details are managed by Treasury SuperAdmin.')}
              className="w-full text-xs font-semibold py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition cursor-pointer"
            >
              Update Payment Method
            </button>
          </div>
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">Verified Tax Invoices & Receipts</h2>
            <p className="text-xs text-slate-500 mt-0.5">Official GST-compliant tax invoices for corporate audit and accounting</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-6">Invoice #</th>
                <th className="py-3.5 px-6">Settlement Date</th>
                <th className="py-3.5 px-6">Tier Description</th>
                <th className="py-3.5 px-6">Settled Amount (INR)</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No billing transactions found for this account.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-800 font-mono">{inv.id}</td>
                    <td className="py-4 px-6 text-slate-500">{inv.date}</td>
                    <td className="py-4 px-6 text-slate-700">{inv.description}</td>
                    <td className="py-4 px-6 font-semibold font-mono text-slate-900">{inv.amount}</td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize bg-emerald-100 text-emerald-800">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDownload(inv)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 px-3 py-1.5 rounded-lg border border-teal-200 bg-teal-50 hover:bg-teal-100 transition cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View Tax Invoice</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Invoice Modal */}
      {activeInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Tax Invoice {activeInvoice.id}</h3>
                <p className="text-xs text-slate-500">Official GST corporate payment receipt</p>
              </div>
              <button
                onClick={() => setActiveInvoice(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <h4 className="font-bold text-slate-900">INTELLIATTEND INC</h4>
                  <p className="text-xs text-slate-500">Cloud HRMS & Identity Governance</p>
                  <p className="text-xs text-slate-500 font-mono">GSTIN: 36AAACI9900Q1ZX</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-800">
                    {activeInvoice.status}
                  </span>
                  <p className="text-xs text-slate-500 mt-2 font-mono">{activeInvoice.date}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold uppercase">Billed To:</span>
                  <p className="font-bold text-slate-900 mt-1">{overview?.companyName || 'Acme Enterprise'}</p>
                  <p className="text-slate-500">{email}</p>
                  <p className="font-mono text-slate-500">GSTIN: 36AABCU9603R1ZM</p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase">Payment Method:</span>
                  <p className="font-bold text-slate-900 mt-1">{activeInvoice.paymentMethod || 'Corporate Visa •••• 4242'}</p>
                  <p className="font-mono text-slate-500">Ref: {activeInvoice.reference || 'pay_Rz7x92La1098'}</p>
                </div>
              </div>

              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-50 font-semibold text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-right">Rate</th>
                    <th className="p-3 text-right">GST (18%)</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 font-medium text-slate-800">{activeInvoice.description}</td>
                    <td className="p-3 text-right font-mono">
                      ₹{(Number(activeInvoice.amountNumber || 4800) / 1.18).toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-mono">
                      ₹{(Number(activeInvoice.amountNumber || 4800) - (Number(activeInvoice.amountNumber || 4800) / 1.18)).toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">{activeInvoice.amount}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-100 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveInvoice(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}