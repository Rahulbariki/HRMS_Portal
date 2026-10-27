import { useState, useMemo } from 'react';
import {
  IndianRupee, Search, Filter, Download, ArrowUpRight, CheckCircle2,
  Clock, XCircle, AlertCircle, RefreshCw, ExternalLink, Copy, Check,
  CreditCard, ShieldCheck, FileText, ChevronRight, Building2, Eye, Printer, X
} from 'lucide-react';
import clsx from 'clsx';

const INITIAL_TRANSACTIONS = [
  {
    id: 'TXN-2026-98412',
    date: 'Oct 26, 2026 • 14:32 IST',
    rawDate: '2026-10-26T14:32:00',
    company: 'Acme Enterprise',
    subdomain: 'acme.hrms.portal',
    plan: 'Enterprise Tier',
    billingCycle: 'Annual',
    amount: 4800.00,
    subtotal: 4067.80,
    gst: 732.20,
    gateway: 'Razorpay UPI',
    gatewayRef: 'pay_Rz7x92La1098',
    status: 'completed',
    customerEmail: 'clientadmin.intelliattend@gmail.com',
    customerName: 'Acme Corporate Accounts',
    gstin: '36AABCU9603R1ZM',
    paymentMethod: 'UPI • corporate@okhdfcbank',
    receiptUrl: '#',
  },
  {
    id: 'TXN-2026-98409',
    date: 'Oct 25, 2026 • 19:15 IST',
    rawDate: '2026-10-25T19:15:00',
    company: 'Global Tech Corp',
    subdomain: 'globaltech.hrms.portal',
    plan: 'Professional Tier',
    billingCycle: 'Annual',
    amount: 2390.00,
    subtotal: 2025.42,
    gst: 364.58,
    gateway: 'Stripe Business',
    gatewayRef: 'ch_3N9xKl2eZvKYlo2C1',
    status: 'completed',
    customerEmail: 'hr@globaltech.com',
    customerName: 'Global Tech Corp Accounts',
    gstin: '29AABCG8921P1ZN',
    paymentMethod: 'Corporate Visa •••• 4242',
    receiptUrl: '#',
  },
  {
    id: 'TXN-2026-98401',
    date: 'Oct 24, 2026 • 11:05 IST',
    rawDate: '2026-10-24T11:05:00',
    company: 'CyberTech Systems',
    subdomain: 'cybertech.hrms.portal',
    plan: 'Enterprise Tier',
    billingCycle: 'Annual',
    amount: 4800.00,
    subtotal: 4067.80,
    gst: 732.20,
    gateway: 'HDFC Corporate Wire',
    gatewayRef: 'NEFT-HDFC002847192',
    status: 'pending',
    customerEmail: 'finance@cybertechsys.in',
    customerName: 'CyberTech Treasury',
    gstin: '36AACCY1122R1ZQ',
    paymentMethod: 'Bank Wire / RTGS',
    receiptUrl: '#',
  },
  {
    id: 'TXN-2026-98394',
    date: 'Oct 22, 2026 • 16:48 IST',
    rawDate: '2026-10-22T16:48:00',
    company: 'Pinnacle Labs',
    subdomain: 'pinnacle.hrms.portal',
    plan: 'Enterprise Tier',
    billingCycle: 'Monthly',
    amount: 499.00,
    subtotal: 422.88,
    gst: 76.12,
    gateway: 'Razorpay UPI',
    gatewayRef: 'pay_Pinnacle77192',
    status: 'completed',
    customerEmail: 'admin@pinnaclelabs.com',
    customerName: 'Pinnacle Labs Inc',
    gstin: '36AAACP4411Q1ZU',
    paymentMethod: 'UPI • pinnacle@icici',
    receiptUrl: '#',
  },
  {
    id: 'TXN-2026-98382',
    date: 'Oct 20, 2026 • 10:20 IST',
    rawDate: '2026-10-20T10:20:00',
    company: 'Quantum AI Labs',
    subdomain: 'quantumai.hrms.portal',
    plan: 'Enterprise Tier',
    billingCycle: 'Annual',
    amount: 4800.00,
    subtotal: 4067.80,
    gst: 732.20,
    gateway: 'Stripe Business',
    gatewayRef: 'ch_3M7qAA2eZvKYlo1A9',
    status: 'completed',
    customerEmail: 'ops@quantumai.io',
    customerName: 'Quantum AI Technologies',
    gstin: '33AABCQ1234L1ZY',
    paymentMethod: 'Corporate Mastercard •••• 8821',
    receiptUrl: '#',
  },
  {
    id: 'TXN-2026-98375',
    date: 'Oct 18, 2026 • 18:04 IST',
    rawDate: '2026-10-18T18:04:00',
    company: 'Vanguard Retail Ltd',
    subdomain: 'vanguard.hrms.portal',
    plan: 'Professional Tier',
    billingCycle: 'Monthly',
    amount: 249.00,
    subtotal: 211.02,
    gst: 37.98,
    gateway: 'Razorpay UPI',
    gatewayRef: 'pay_Vanguard81023',
    status: 'completed',
    customerEmail: 'hr@vanguardretail.com',
    customerName: 'Vanguard Retail India',
    gstin: '27AABCV5599K1ZL',
    paymentMethod: 'NetBanking • HDFC Corp',
    receiptUrl: '#',
  },
  {
    id: 'TXN-2026-98361',
    date: 'Oct 15, 2026 • 12:40 IST',
    rawDate: '2026-10-15T12:40:00',
    company: 'Nexus Dynamics',
    subdomain: 'nexus.hrms.portal',
    plan: 'Starter Tier',
    billingCycle: 'Annual',
    amount: 950.00,
    subtotal: 805.08,
    gst: 144.92,
    gateway: 'Stripe Business',
    gatewayRef: 'ch_3K8yBB2eZvKYlo8K3',
    status: 'completed',
    customerEmail: 'contact@nexusdyn.io',
    customerName: 'Nexus Dynamics LLP',
    gstin: '36AABCN7766M1ZR',
    paymentMethod: 'Amex •••• 1004',
    receiptUrl: '#',
  },
  {
    id: 'TXN-2026-98342',
    date: 'Oct 12, 2026 • 09:12 IST',
    rawDate: '2026-10-12T09:12:00',
    company: 'InnoWave Bio',
    subdomain: 'innowave.hrms.portal',
    plan: 'Starter Tier',
    billingCycle: 'Monthly',
    amount: 99.00,
    subtotal: 83.90,
    gst: 15.10,
    gateway: 'Razorpay UPI',
    gatewayRef: 'pay_InnoWave00921',
    status: 'completed',
    customerEmail: 'accounts@innowavebio.com',
    customerName: 'InnoWave Biosciences',
    gstin: '36AABCI8822B1ZX',
    paymentMethod: 'UPI • innowave@axisbank',
    receiptUrl: '#',
  },
  {
    id: 'TXN-2026-98330',
    date: 'Oct 10, 2026 • 15:55 IST',
    rawDate: '2026-10-10T15:55:00',
    company: 'Apex Logistics',
    subdomain: 'apexlogistics.hrms.portal',
    plan: 'Professional Tier',
    billingCycle: 'Monthly',
    amount: 249.00,
    subtotal: 211.02,
    gst: 37.98,
    gateway: 'Razorpay UPI',
    gatewayRef: 'pay_fail_Apex88102',
    status: 'failed',
    customerEmail: 'billing@apexlogistics.in',
    customerName: 'Apex Express Logistics',
    gstin: '07AABCA3311D1ZV',
    paymentMethod: 'Corporate Card •••• 9012 (3DS Timeout)',
    receiptUrl: '#',
  },
  {
    id: 'TXN-2026-98319',
    date: 'Oct 08, 2026 • 11:30 IST',
    rawDate: '2026-10-08T11:30:00',
    company: 'BluePeak Media',
    subdomain: 'bluepeak.hrms.portal',
    plan: 'Professional Tier',
    billingCycle: 'Annual',
    amount: 2390.00,
    subtotal: 2025.42,
    gst: 364.58,
    gateway: 'Razorpay UPI',
    gatewayRef: 'rfnd_BluePeak99201',
    status: 'refunded',
    customerEmail: 'finance@bluepeak.agency',
    customerName: 'BluePeak Creative Media',
    gstin: '27AABCB9090E1ZW',
    paymentMethod: 'UPI Auto-Debit Refund',
    receiptUrl: '#',
  },
];

export default function SuperAdminTransactions() {
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gatewayFilter, setGatewayFilter] = useState('all');
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [copiedId, setCopiedId] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(''), 2000);
    showToast(`Copied ${text} to clipboard`);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      const matchesSearch =
        txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.subdomain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.gatewayRef.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || txn.status === statusFilter;
      const matchesGateway = gatewayFilter === 'all' || txn.gateway === gatewayFilter;

      return matchesSearch && matchesStatus && matchesGateway;
    });
  }, [transactions, searchQuery, statusFilter, gatewayFilter]);

  // Aggregate stats
  const totalSettled = transactions
    .filter((t) => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPending = transactions
    .filter((t) => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalRefunded = transactions
    .filter((t) => t.status === 'refunded')
    .reduce((sum, t) => sum + t.amount, 0);

  const completedCount = transactions.filter((t) => t.status === 'completed').length;
  const successRate = ((completedCount / (transactions.length - 1)) * 100).toFixed(1);

  const exportCSV = () => {
    const headers = [
      'Transaction ID',
      'Date',
      'Company',
      'Subdomain',
      'Plan',
      'Billing Cycle',
      'Amount (INR)',
      'Subtotal',
      'GST (18%)',
      'Payment Gateway',
      'Gateway Reference',
      'Status',
      'Customer Email',
      'GSTIN'
    ];

    const rows = filteredTransactions.map((t) => [
      t.id,
      `"${t.date}"`,
      `"${t.company}"`,
      t.subdomain,
      t.plan,
      t.billingCycle,
      t.amount.toFixed(2),
      t.subtotal.toFixed(2),
      t.gst.toFixed(2),
      `"${t.gateway}"`,
      t.gatewayRef,
      t.status.toUpperCase(),
      t.customerEmail,
      t.gstin
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `intelliattend_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported filtered transactions to CSV');
  };

  const handleVerifyPending = (txnId) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txnId ? { ...t, status: 'completed' } : t))
    );
    if (selectedTxn && selectedTxn.id === txnId) {
      setSelectedTxn((prev) => ({ ...prev, status: 'completed' }));
    }
    showToast(`Transaction ${txnId} verified & settled successfully`);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Settled
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3 text-amber-600" /> Pending Verification
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            <XCircle className="w-3 h-3 text-rose-600" /> Failed
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
            <RefreshCw className="w-3 h-3 text-purple-600" /> Refunded
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-slate-900">Transactions & Ledger</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-teal-100 text-teal-800 border border-teal-200">
              INR • ₹
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            Real-time multi-tenant subscription billings, gateway reconciliation, and automated GST tax records.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => showToast('Payment gateways synchronized with latest bank settlements')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
            <span>Sync Gateways</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 border border-slate-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Settled (YTD)</p>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2 font-display">
            ₹{totalSettled.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>+24.6% vs previous cycle</span>
          </div>
        </div>

        <div className="card p-5 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Settlement Success</p>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2 font-display">
            {successRate}%
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {completedCount} of {transactions.length} transactions processed
          </p>
        </div>

        <div className="card p-5 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Settlement</p>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2 font-display">
            ₹{totalPending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-amber-700 font-medium mt-1">
            1 corporate wire awaiting verification
          </p>
        </div>

        <div className="card p-5 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Refunds & Disputed</p>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2 font-display">
            ₹{totalRefunded.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            1 duplicate debit resolved within SLA
          </p>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="card p-4 border border-slate-100 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Txn ID, tenant, email, or gateway ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900 outline-none transition"
            />
          </div>

          {/* Gateway Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Gateway:</span>
            <select
              value={gatewayFilter}
              onChange={(e) => setGatewayFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="all">All Gateways</option>
              <option value="Razorpay UPI">Razorpay UPI</option>
              <option value="Stripe Business">Stripe Business</option>
              <option value="HDFC Corporate Wire">HDFC Corporate Wire</option>
            </select>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs pt-1 border-t border-slate-100">
          <span className="text-slate-400 font-semibold mr-1 text-[11px] uppercase tracking-wider">Status:</span>
          {[
            { id: 'all', label: 'All Transactions', count: transactions.length },
            { id: 'completed', label: 'Settled', count: transactions.filter((t) => t.status === 'completed').length },
            { id: 'pending', label: 'Pending', count: transactions.filter((t) => t.status === 'pending').length },
            { id: 'failed', label: 'Failed', count: transactions.filter((t) => t.status === 'failed').length },
            { id: 'refunded', label: 'Refunded', count: transactions.filter((t) => t.status === 'refunded').length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={clsx(
                'px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer',
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              )}
            >
              <span>{tab.label}</span>
              <span
                className={clsx(
                  'px-1.5 py-0.2 rounded-full text-[10px]',
                  statusFilter === tab.id ? 'bg-teal-400 text-slate-900 font-extrabold' : 'bg-slate-200 text-slate-700'
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Transaction ID & Date</th>
                <th className="py-3 px-4">Tenant Company</th>
                <th className="py-3 px-4">Plan & Cycle</th>
                <th className="py-3 px-4">Gateway & Ref</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No transactions match your search filters</p>
                    <p className="text-[11px] mt-0.5">Try clearing the search query or changing status filters.</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn) => (
                  <tr
                    key={txn.id}
                    className="hover:bg-slate-50/70 transition group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900">{txn.id}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(txn.id)}
                          className="text-slate-400 hover:text-slate-700 p-0.5 transition"
                          title="Copy Transaction ID"
                        >
                          {copiedId === txn.id ? (
                            <Check className="w-3.5 h-3.5 text-teal-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{txn.date}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center font-bold text-xs shrink-0">
                          {txn.company.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{txn.company}</p>
                          <p className="text-[11px] text-slate-400 truncate">{txn.subdomain}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">{txn.plan}</p>
                      <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                        {txn.billingCycle}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 font-medium text-slate-800">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        <span>{txn.gateway}</span>
                      </div>
                      <p className="font-mono text-[10px] text-slate-400 mt-0.5 truncate max-w-[140px]">
                        {txn.gatewayRef}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <p className="font-mono font-bold text-slate-900 text-sm">
                        ₹{txn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        GST: ₹{txn.gst.toFixed(2)}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusBadge(txn.status)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {txn.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => handleVerifyPending(txn.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow-2xs"
                            title="Verify Corporate Bank Wire"
                          >
                            Verify
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedTxn(txn)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          <span>Receipt</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt & Settlement Details Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-elevated max-w-xl w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 bg-white max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-teal-300 flex items-center justify-center font-black">
                  IA
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-slate-900">Official Settlement Receipt</h2>
                  <p className="text-[11px] text-slate-500 font-mono">{selectedTxn.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTxn(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Body */}
            <div className="mt-5 space-y-5 text-xs">
              {/* Status Banner */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-slate-500">Payment Status</p>
                  <div className="mt-1">{getStatusBadge(selectedTxn.status)}</div>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-slate-500">Processed On</p>
                  <p className="font-semibold text-slate-800 mt-1">{selectedTxn.date}</p>
                </div>
              </div>

              {/* Billed To / Tenant */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50/60 border border-slate-100">
                <div>
                  <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Tenant Entity</p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedTxn.company}</p>
                  <p className="text-slate-500 mt-0.5">{selectedTxn.customerName}</p>
                  <p className="text-slate-500">{selectedTxn.customerEmail}</p>
                  <p className="font-mono text-[11px] text-slate-600 mt-1">GSTIN: {selectedTxn.gstin}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Platform Issuer</p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">IntelliAttend Technologies Pvt Ltd</p>
                  <p className="text-slate-500 mt-0.5">Global Enterprise SaaS Division</p>
                  <p className="text-slate-500">support@intelliattend.com</p>
                  <p className="font-mono text-[11px] text-slate-600 mt-1">GSTIN: 36AAACI9900Q1ZX</p>
                </div>
              </div>

              {/* Itemized charges */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="p-3">Description</th>
                      <th className="p-3 text-right">Taxable Value</th>
                      <th className="p-3 text-right">GST (18%)</th>
                      <th className="p-3 text-right">Total (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{selectedTxn.plan} Subscription</p>
                        <p className="text-[11px] text-slate-500">
                          Tenant: {selectedTxn.subdomain} • {selectedTxn.billingCycle} billing tier
                        </p>
                      </td>
                      <td className="p-3 text-right font-mono">₹{selectedTxn.subtotal.toFixed(2)}</td>
                      <td className="p-3 text-right font-mono text-slate-600">₹{selectedTxn.gst.toFixed(2)}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">
                        ₹{selectedTxn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Gateway & Settlement Audit Details */}
              <div className="space-y-2 p-3.5 rounded-xl bg-teal-50/40 border border-teal-100 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Gateway Provider:</span>
                  <span className="font-bold text-slate-800">{selectedTxn.gateway}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Gateway Transaction Reference:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedTxn.gatewayRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Method of Settlement:</span>
                  <span className="font-semibold text-slate-800">{selectedTxn.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tax Jurisdiction:</span>
                  <span className="font-semibold text-slate-800">Telangana, India (IGST / CGST+SGST 18%)</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>

                <div className="flex items-center gap-2">
                  {selectedTxn.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => handleVerifyPending(selectedTxn.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                    >
                      Verify & Mark Settled
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      showToast(`Receipt resent to ${selectedTxn.customerEmail}`);
                      setSelectedTxn(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition"
                  >
                    Resend Email Receipt
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}