import { useState, useEffect } from 'react';
import {
  Plus, Check, Edit2, Archive, X, Loader2, RefreshCw, Sparkles
} from 'lucide-react';
import clsx from 'clsx';
import api from '../../services/api';

export default function SuperAdminPlanManagement() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: '',
    priceMonthly: '',
    priceAnnual: '',
    maxEmployees: '',
    featuresText: '',
  });

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await api.get('/plans');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setPlans(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const toggleArchive = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'archived' : 'active';
    try {
      const res = await api.patch(`/plans/${id}/status`, { status: nextStatus });
      if (res.data?.success) {
        setPlans(prev => prev.map(p => p.id === id ? { ...p, status: nextStatus } : p));
      }
    } catch (err) {
      console.error('Error toggling plan status:', err);
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    if (!newPlan.name || !newPlan.priceMonthly) return;

    try {
      setSubmitting(true);
      const features = newPlan.featuresText
        ? newPlan.featuresText.split('\n').filter(Boolean)
        : ['Basic HRMS Access', 'Standard Support'];

      const res = await api.post('/plans', {
        name: newPlan.name,
        priceMonthly: Number(newPlan.priceMonthly),
        priceAnnual: Number(newPlan.priceAnnual || newPlan.priceMonthly * 10),
        maxEmployees: Number(newPlan.maxEmployees || 100),
        features
      });

      if (res.data?.success) {
        setNewPlan({
          name: '',
          priceMonthly: '',
          priceAnnual: '',
          maxEmployees: '',
          featuresText: '',
        });
        setShowAddModal(false);
        fetchPlans();
      }
    } catch (err) {
      console.error('Error creating plan:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        <p className="text-xs font-semibold">Loading verified subscription plans from Neon PostgreSQL...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Subscription Plans</h1>
          <p className="text-slate-500 text-sm mt-1">Configure subscription tiers, pricing, seat quotas, and plan features</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchPlans()}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
            title="Refresh Plans"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-md transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 text-teal-400" />
            <span>Create New Plan</span>
          </button>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="bg-slate-100 p-1 rounded-xl inline-flex items-center gap-1">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={clsx(
              'px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              billingCycle === 'monthly'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            )}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={clsx(
              'px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer',
              billingCycle === 'annual'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            )}
          >
            <span>Annual Billing</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={clsx(
              'bg-white rounded-2xl border p-6 relative flex flex-col justify-between transition-all shadow-sm',
              plan.popular ? 'border-teal-600 ring-2 ring-teal-500/20 shadow-md' : 'border-slate-200',
              plan.status === 'archived' && 'opacity-60 bg-slate-50'
            )}
          >
            <div>
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Most Popular</span>
                </span>
              )}

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-900">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Up to {plan.maxEmployees} employee seats</p>
                </div>
                <span
                  className={clsx(
                    'px-2 py-0.5 rounded-full text-[11px] font-bold uppercase',
                    plan.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  )}
                >
                  {plan.status}
                </span>
              </div>

              <div className="mt-5 pb-5 border-b border-slate-100">
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-3xl font-extrabold text-slate-900">
                    ₹{Number(billingCycle === 'monthly' ? plan.priceMonthly : plan.priceAnnual).toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    / {billingCycle === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  <span className="font-semibold text-slate-700">{plan.activeSubscribers}</span> active corporate tenants
                </p>
              </div>

              <div className="mt-5 space-y-2.5">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Features Included:</p>
                {(Array.isArray(plan.features) ? plan.features : []).map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => toggleArchive(plan.id, plan.status)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <Archive className="h-3.5 w-3.5" />
                <span>{plan.status === 'active' ? 'Archive Tier' : 'Activate Tier'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 rounded-2xl shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="font-display text-lg font-bold text-slate-900">Create Subscription Plan</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Plan Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Growth Tier"
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="149"
                    value={newPlan.priceMonthly}
                    onChange={(e) => setNewPlan({ ...newPlan, priceMonthly: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Price (₹)</label>
                  <input
                    type="number"
                    placeholder="1400"
                    value={newPlan.priceAnnual}
                    onChange={(e) => setNewPlan({ ...newPlan, priceAnnual: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Max Employee Capacity</label>
                <input
                  type="number"
                  placeholder="100"
                  value={newPlan.maxEmployees}
                  onChange={(e) => setNewPlan({ ...newPlan, maxEmployees: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Features (one per line)
                </label>
                <textarea
                  rows="4"
                  placeholder="Clock-In / Clock-Out&#10;Leave Management&#10;Priority Support"
                  value={newPlan.featuresText}
                  onChange={(e) => setNewPlan({ ...newPlan, featuresText: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow disabled:opacity-50 cursor-pointer"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{submitting ? 'Saving...' : 'Save Plan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}