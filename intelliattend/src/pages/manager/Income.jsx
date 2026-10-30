import { useState, useEffect } from 'react';
import {
  TrendingUp, IndianRupee, Plus, Search, CheckCircle2, Building2,
  Calendar, CreditCard, ArrowUpRight, DollarSign, Layers
} from 'lucide-react';
import clsx from 'clsx';
import api from '../../services/api';

export default function ManagerIncome() {
  const [activeTab, setActiveTab] = useState('receipts');
  const [incomeTypes, setIncomeTypes] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState('');

  // Modals
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);

  // Forms
  const [recordForm, setRecordForm] = useState({
    client_name: '',
    income_type_id: 1,
    income_type_name: 'Enterprise SaaS Annual Retainer',
    invoice_ref: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
    amount_inr: '',
    received_date: new Date().toISOString().split('T')[0],
    payment_method: 'Direct Wire (HDFC)',
    notes: ''
  });

  const [typeForm, setTypeForm] = useState({
    name: '',
    category: 'Software Licensing',
    billing_cycle: 'Monthly',
    default_amount: ''
  });

  const fetchData = async () => {
    try {
      const [typeRes, recRes] = await Promise.all([
        api.get('/manager/income-types'),
        api.get('/manager/income-records')
      ]);
      if (typeRes.data?.success) setIncomeTypes(typeRes.data.data);
      if (recRes.data?.success) setRecords(recRes.data.data);
    } catch (err) {
      console.error('Error fetching income data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/manager/income-records', recordForm);
      if (res.data?.success) {
        setFeedback(`Client remittance from "${recordForm.client_name}" logged!`);
        setShowRecordModal(false);
        setRecordForm({
          client_name: '',
          income_type_id: 1,
          income_type_name: 'Enterprise SaaS Annual Retainer',
          invoice_ref: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
          amount_inr: '',
          received_date: new Date().toISOString().split('T')[0],
          payment_method: 'Direct Wire (HDFC)',
          notes: ''
        });
        fetchData();
        setTimeout(() => setFeedback(''), 4000);
      }
    } catch (err) {
      console.error('Failed to log payment:', err);
    }
  };

  const handleCreateType = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/manager/income-types', typeForm);
      if (res.data?.success) {
        setFeedback(`Revenue stream "${typeForm.name}" created!`);
        setShowTypeModal(false);
        setTypeForm({ name: '', category: 'Software Licensing', billing_cycle: 'Monthly', default_amount: '' });
        fetchData();
        setTimeout(() => setFeedback(''), 4000);
      }
    } catch (err) {
      console.error('Failed to create stream:', err);
    }
  };

  const totalRevenue = records.reduce((acc, curr) => acc + Number(curr.amount_inr || 0), 0);
  const filteredRecords = records.filter(r =>
    r.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.invoice_ref && r.invoice_ref.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (r.income_type_name && r.income_type_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Revenue & Inward Income Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track client subscriptions, enterprise retainers, licensing billing, and verified wire transfers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTypeModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
          >
            <Layers className="h-4 w-4" />
            New Revenue Stream
          </button>
          <button
            onClick={() => setShowRecordModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-900 dark:bg-teal-600 text-white hover:bg-slate-800 transition shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Record Inward Payment
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
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Settled Inflows</p>
            <p className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-1">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Verified bank remittances</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Enterprise Retainers</p>
            <p className="font-display text-2xl font-bold text-teal-600 dark:text-teal-400 mt-1">
              {incomeTypes.length} Active
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Subscription models</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Building2 className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Client Invoices</p>
            <p className="font-display text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
              {records.length} Settled
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">October 2026 cycle</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Calendar className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Average Deal Size</p>
            <p className="font-display text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              ₹{records.length ? Math.round(totalRevenue / records.length).toLocaleString('en-IN') : '0'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Per corporate contract</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <IndianRupee className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('receipts')}
          className={clsx(
            'flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition -mb-px',
            activeTab === 'receipts'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          )}
        >
          <CreditCard className="h-4 w-4" />
          Client Remittance Records ({records.length})
        </button>
        <button
          onClick={() => setActiveTab('streams')}
          className={clsx(
            'flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition -mb-px',
            activeTab === 'streams'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          )}
        >
          <Layers className="h-4 w-4" />
          Revenue Streams & Plans ({incomeTypes.length})
        </button>
      </div>

      {activeTab === 'receipts' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by client name, invoice number, or contract..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-900 dark:text-white"
            />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Client Enterprise</th>
                    <th className="px-6 py-4">Invoice Ref</th>
                    <th className="px-6 py-4">Revenue Stream</th>
                    <th className="px-6 py-4">Remittance Date</th>
                    <th className="px-6 py-4">Payment Mode</th>
                    <th className="px-6 py-4">Amount Received</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900 dark:text-white">{r.client_name}</p>
                        {r.notes && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{r.notes}</p>}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                        {r.invoice_ref}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
                          {r.income_type_name || 'Enterprise Plan'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">
                        {r.received_date}
                      </td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                        {r.payment_method}
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{Number(r.amount_inr).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          Settled
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'streams' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {incomeTypes.map((t) => (
            <div key={t.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
                  {t.category}
                </span>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mt-3">
                  {t.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Billing Cadence: <span className="font-medium text-slate-800 dark:text-slate-200">{t.billing_cycle}</span>
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Standard Retainer Fee</p>
                  <p className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    ₹{Number(t.default_amount).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Active Model
                </span>
                <span className="text-slate-400 font-mono">ID: #{t.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Record Inward Payment Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Record Inward Remittance
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Log verified client invoice settlement into company books.
            </p>

            <form onSubmit={handleCreateRecord} className="mt-4 space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Client Entity *</label>
                <input
                  type="text"
                  required
                  value={recordForm.client_name}
                  onChange={(e) => setRecordForm({ ...recordForm, client_name: e.target.value })}
                  placeholder="e.g. Acme Global Corporation"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Contract / Retainer Stream</label>
                <select
                  value={recordForm.income_type_name}
                  onChange={(e) => setRecordForm({ ...recordForm, income_type_name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  {incomeTypes.map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Amount (INR ₹) *</label>
                  <input
                    type="number"
                    required
                    value={recordForm.amount_inr}
                    onChange={(e) => setRecordForm({ ...recordForm, amount_inr: e.target.value })}
                    placeholder="250000"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date Received</label>
                  <input
                    type="date"
                    value={recordForm.received_date}
                    onChange={(e) => setRecordForm({ ...recordForm, received_date: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Invoice Reference</label>
                  <input
                    type="text"
                    value={recordForm.invoice_ref}
                    onChange={(e) => setRecordForm({ ...recordForm, invoice_ref: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                  <select
                    value={recordForm.payment_method}
                    onChange={(e) => setRecordForm({ ...recordForm, payment_method: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="Direct Wire (HDFC)">Direct Wire (HDFC)</option>
                    <option value="Direct Wire (ICICI)">Direct Wire (ICICI)</option>
                    <option value="Corporate Razorpay UPI">Corporate Razorpay UPI</option>
                    <option value="Stripe Business Wire">Stripe Business Wire</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes</label>
                <textarea
                  rows="2"
                  value={recordForm.notes}
                  onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                  placeholder="Optional scope or milestone notes"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="px-4 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm bg-slate-900 dark:bg-teal-600 text-white font-semibold"
                >
                  Confirm Remittance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Revenue Stream Modal */}
      {showTypeModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Configure Revenue Stream
            </h3>
            <form onSubmit={handleCreateType} className="mt-4 space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Stream Name *</label>
                <input
                  type="text"
                  required
                  value={typeForm.name}
                  onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                  placeholder="e.g. Dedicated Enterprise Cloud SLA"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select
                  value={typeForm.category}
                  onChange={(e) => setTypeForm({ ...typeForm, category: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="Software Licensing">Software Licensing</option>
                  <option value="Managed Services">Managed Services</option>
                  <option value="Professional Services">Professional Services</option>
                  <option value="Custom Retainer">Custom Retainer</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Billing Cadence</label>
                <select
                  value={typeForm.billing_cycle}
                  onChange={(e) => setTypeForm({ ...typeForm, billing_cycle: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Annual">Annual</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Default Retainer Amount (INR ₹)</label>
                <input
                  type="number"
                  value={typeForm.default_amount}
                  onChange={(e) => setTypeForm({ ...typeForm, default_amount: e.target.value })}
                  placeholder="150000"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowTypeModal(false)}
                  className="px-4 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm bg-slate-900 dark:bg-teal-600 text-white font-semibold"
                >
                  Save Stream
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

