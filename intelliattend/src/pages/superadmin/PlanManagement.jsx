import { useState } from 'react';
import {
  Plus, Check, Edit2, Archive, X
} from 'lucide-react';
import clsx from 'clsx';

const INITIAL_PLANS = [
  {
    id: 1,
    name: 'Starter Tier',
    priceMonthly: 99,
    priceAnnual: 950,
    maxEmployees: 50,
    activeSubscribers: 14,
    status: 'active',
    features: [
      'Clock-In / Clock-Out Tracking',
      'Leave Management & Approvals',
      'Basic Salary Slip Downloads',
      'Email Support (48h response)',
    ],
  },
  {
    id: 2,
    name: 'Professional Tier',
    priceMonthly: 249,
    priceAnnual: 2390,
    maxEmployees: 200,
    activeSubscribers: 28,
    status: 'active',
    popular: true,
    features: [
      'All Starter Features',
      'Multi-Department Manager Hierarchy',
      'Team Task Delegation & Review',
      'Detailed Audit Logs & Export',
      'Priority Support (12h response)',
    ],
  },
  {
    id: 3,
    name: 'Enterprise Tier',
    priceMonthly: 499,
    priceAnnual: 4800,
    maxEmployees: 1000,
    activeSubscribers: 12,
    status: 'active',
    features: [
      'All Professional Features',
      'Unlimited Departments & Managers',
      'Custom Role Permissions & Security Policies',
      'Dedicated Customer Success Manager',
      'Custom Subdomain & Single Sign-On (SSO)',
      '99.9% Uptime SLA',
    ],
  },
];

export default function SuperAdminPlanManagement() {
  const [plans, setPlans] = useState(INITIAL_PLANS);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: '',
    priceMonthly: '',
    priceAnnual: '',
    maxEmployees: '',
    featuresText: '',
  });

  const toggleArchive = (id) => {
    setPlans((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: p.status === 'active' ? 'archived' : 'active' } : p
      )
    );
  };

  const handleCreatePlan = (e) => {
    e.preventDefault();
    if (!newPlan.name || !newPlan.priceMonthly) return;

    const created = {
      id: Date.now(),
      name: newPlan.name,
      priceMonthly: Number(newPlan.priceMonthly),
      priceAnnual: Number(newPlan.priceAnnual || newPlan.priceMonthly * 10),
      maxEmployees: Number(newPlan.maxEmployees || 100),
      activeSubscribers: 0,
      status: 'active',
      features: newPlan.featuresText
        ? newPlan.featuresText.split('\n').filter(Boolean)
        : ['Basic HRMS Access', 'Standard Support'],
    };

    setPlans([...plans, created]);
    setNewPlan({
      name: '',
      priceMonthly: '',
      priceAnnual: '',
      maxEmployees: '',
      featuresText: '',
    });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Plan Management</h1>
          <p className="text-muted mt-1">Configure subscription tiers, pricing, seat quotas, and plan features</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create New Plan
        </button>
      </div>

      <div className="flex justify-center">
        <div className="bg-slate-100 p-1 rounded-xl inline-flex items-center gap-1">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={clsx(
              'px-4 py-1.5 rounded-lg text-xs font-semibold transition-all',
              billingCycle === 'monthly'
                ? 'bg-white text-primary shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            )}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={clsx(
              'px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5',
              billingCycle === 'annual'
                ? 'bg-white text-primary shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            )}
          >
            Annual Billing
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
              'card-elevated p-6 relative flex flex-col justify-between transition-all',
              plan.popular ? 'border-primary ring-2 ring-primary/20 shadow-md' : '',
              plan.status === 'archived' && 'opacity-60 bg-slate-50'
            )}
          >
            <div>
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                  Most Popular
                </span>
              )}

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-800">{plan.name}</h3>
                  <p className="text-xs text-muted mt-0.5">Up to {plan.maxEmployees} employee seats</p>
                </div>
                <span
                  className={clsx(
                    'px-2 py-0.5 rounded text-[11px] font-bold uppercase',
                    plan.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  )}
                >
                  {plan.status}
                </span>
              </div>

              <div className="mt-5 pb-5 border-b border-slate-100">
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-3xl font-extrabold text-primary">
                    ${billingCycle === 'monthly' ? plan.priceMonthly : plan.priceAnnual}
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
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => toggleArchive(plan.id)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-1"
              >
                <Archive className="h-3.5 w-3.5" />
                {plan.status === 'active' ? 'Archive' : 'Activate'}
              </button>

              <button className="btn-secondary w-auto text-xs py-1.5 px-3 flex items-center gap-1">
                <Edit2 className="h-3.5 w-3.5" /> Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-elevated max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="font-display text-lg font-bold text-primary">Create Subscription Plan</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
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
                  className="input-field text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Price ($)</label>
                  <input
                    type="number"
                    required
                    placeholder="149"
                    value={newPlan.priceMonthly}
                    onChange={(e) => setNewPlan({ ...newPlan, priceMonthly: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Price ($)</label>
                  <input
                    type="number"
                    placeholder="1400"
                    value={newPlan.priceAnnual}
                    onChange={(e) => setNewPlan({ ...newPlan, priceAnnual: e.target.value })}
                    className="input-field text-sm"
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
                  className="input-field text-sm"
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
                  className="input-field text-sm resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary w-auto text-sm px-4"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary w-auto text-sm px-5">
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}