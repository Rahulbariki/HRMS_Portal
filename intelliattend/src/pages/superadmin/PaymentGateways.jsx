import { useState } from 'react';
import {
  CreditCard, ShieldCheck, CheckCircle2, AlertCircle,
  RefreshCw, Key, ExternalLink, IndianRupee, Zap, Save
} from 'lucide-react';
import clsx from 'clsx';

export default function SuperAdminPaymentGateways() {
  const [gateways, setGateways] = useState([
    {
      id: 'razorpay',
      name: 'Razorpay UPI & NetBanking',
      provider: 'Razorpay Payments India',
      status: 'active',
      mode: 'Live Production',
      supported: 'UPI, QR, Cards, NetBanking',
      currency: 'INR (₹)',
      webhookStatus: 'Healthy (200 OK)',
      lastSettlement: '27 Oct 2026 • ₹4,800.00 settled',
      apiKey: 'rzp_live_••••••••••••9841'
    },
    {
      id: 'stripe',
      name: 'Stripe Global Business',
      provider: 'Stripe Inc',
      status: 'active',
      mode: 'Live Production',
      supported: 'Visa, Mastercard, Amex, Apple Pay',
      currency: 'INR / USD / EUR',
      webhookStatus: 'Healthy (200 OK)',
      lastSettlement: '25 Oct 2026 • ₹2,390.00 settled',
      apiKey: 'pk_live_••••••••••••3N9x'
    },
    {
      id: 'hdfc_wire',
      name: 'HDFC Corporate Wire / RTGS',
      provider: 'HDFC Bank Corporate Treasury',
      status: 'active',
      mode: 'Manual Settlement',
      supported: 'NEFT, RTGS, IMPS Corporate Wire',
      currency: 'INR (₹)',
      webhookStatus: 'Manual Verification',
      lastSettlement: '24 Oct 2026 • Pending clearance',
      apiKey: 'HDFC-CORP-RECON-API'
    }
  ]);

  const [feedback, setFeedback] = useState(null);

  const toggleStatus = (id) => {
    setGateways(prev => prev.map(g => {
      if (g.id === id) {
        const next = g.status === 'active' ? 'disabled' : 'active';
        return { ...g, status: next };
      }
      return g;
    }));
    setFeedback({ type: 'success', text: 'Gateway configuration updated successfully.' });
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">Payment Gateways & Disbursals</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure multi-tenant subscription billing providers, webhook reconciliation, and automated settlement
          </p>
        </div>
      </div>

      {feedback && (
        <div
          className={clsx(
            'p-4 rounded-xl border flex items-center justify-between text-xs font-semibold animate-in fade-in',
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          )}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="font-bold cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Gateway Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {gateways.map((g) => (
          <div
            key={g.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-5"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                  <CreditCard className="w-6 h-6" />
                </div>
                <span
                  className={clsx(
                    'px-2.5 py-0.5 rounded-full text-xs font-bold uppercase',
                    g.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  )}
                >
                  {g.status}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base mt-4">{g.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{g.provider}</p>

              <div className="mt-5 space-y-2.5 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Operation Mode:</span>
                  <span className="font-bold text-slate-800">{g.mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Supported Rails:</span>
                  <span className="font-semibold text-slate-700">{g.supported}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Standard Currency:</span>
                  <span className="font-mono font-bold text-teal-700">{g.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Webhook Health:</span>
                  <span className="text-emerald-700 font-medium">{g.webhookStatus}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200/60">
                  <span className="text-slate-500">API Key Fingerprint:</span>
                  <span className="font-mono text-slate-600">{g.apiKey}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">{g.lastSettlement}</span>
              <button
                type="button"
                onClick={() => toggleStatus(g.id)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer',
                  g.status === 'active'
                    ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                    : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                )}
              >
                {g.status === 'active' ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}