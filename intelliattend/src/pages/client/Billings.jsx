import { useState } from 'react';
import {
  CreditCard, Download, CheckCircle2, Shield,
  Users, Zap
} from 'lucide-react';

const INVOICE_HISTORY = [
  { id: 'INV-2026-009', date: 'Oct 01, 2026', amount: '₹4,800.00', status: 'paid', description: 'Enterprise Annual Tier (500 Seats)' },
  { id: 'INV-2025-009', date: 'Oct 01, 2025', amount: '₹4,800.00', status: 'paid', description: 'Enterprise Annual Tier (500 Seats)' },
  { id: 'INV-2024-009', date: 'Oct 01, 2024', amount: '₹4,500.00', status: 'paid', description: 'Enterprise Annual Tier (500 Seats)' },
];

export default function ClientBillings() {
  const [autoRenew, setAutoRenew] = useState(true);
  const [downloadNotice, setDownloadNotice] = useState('');

  const handleDownload = (invoiceId) => {
    setDownloadNotice(`Downloading ${invoiceId}...`);
    setTimeout(() => setDownloadNotice(''), 2500);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Billing & Subscriptions</h1>
          <p className="text-muted mt-1">Manage corporate enterprise licenses, seat capacity, and invoices</p>
        </div>
        {downloadNotice && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3.5 py-2 rounded-xl">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            {downloadNotice}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card-elevated p-6 lg:col-span-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                <Zap className="h-3 w-3" /> Active Plan
              </span>
              <h2 className="font-display text-2xl font-bold text-slate-800 pt-2">Enterprise Plan</h2>
              <p className="text-sm text-slate-500">Billed annually on Oct 01, 2027</p>
            </div>
            <div className="text-right">
              <span className="font-display text-3xl font-extrabold text-primary">₹4,800</span>
              <span className="text-sm text-slate-400 font-medium"> / year</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-primary" /> Seat Allocation
              </span>
              <span className="font-semibold text-slate-900">480 / 500 Used (96%)</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: '96%' }} />
            </div>
            <p className="text-xs text-muted">20 employee licenses available. Contact admin to add capacity.</p>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">Automatic Renewal</p>
              <p className="text-xs text-slate-500">Renews automatically using default payment method</p>
            </div>
            <button
              onClick={() => setAutoRenew(!autoRenew)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoRenew ? 'bg-primary' : 'bg-slate-300'
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

        <div className="card-elevated p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-base font-bold text-primary">Payment Method</h3>
              <Shield className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Corporate Visa</p>
                  <p className="text-xs text-slate-500">•••• •••• •••• 4242</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200">
                <span>Expires 11/2028</span>
                <span className="text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded">Default</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button className="btn-secondary w-full text-xs font-semibold py-2.5">
              Update Payment Method
            </button>
          </div>
        </div>
      </div>

      <div className="card-elevated">
        <div className="p-6 border-b border-slate-100">
          <h2 className="font-display text-lg font-bold text-primary">Invoice History</h2>
          <p className="text-xs text-muted mt-0.5">Download official tax invoices and receipts for accounting</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-6">Invoice #</th>
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6">Description</th>
                <th className="py-3.5 px-6">Amount</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {INVOICE_HISTORY.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-800">{inv.id}</td>
                  <td className="py-4 px-6 text-slate-500">{inv.date}</td>
                  <td className="py-4 px-6 text-slate-700">{inv.description}</td>
                  <td className="py-4 px-6 font-semibold text-slate-900">{inv.amount}</td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize bg-emerald-100 text-emerald-800">
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleDownload(inv.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover px-2.5 py-1 rounded border border-primary/20 hover:bg-primary-light"
                    >
                      <Download className="h-3.5 w-3.5" />
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}