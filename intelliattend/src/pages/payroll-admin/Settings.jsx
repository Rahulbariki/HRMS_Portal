import { useState } from 'react';
import {
  Settings, Landmark, Shield, FileText, CheckCircle2,
  Percent, CreditCard, Building2
} from 'lucide-react';
import clsx from 'clsx';

export default function PayrollAdminSettings() {
  const [feedback, setFeedback] = useState('');
  const [settings, setSettings] = useState({
    epfRate: '12%',
    professionalTax: '200',
    primaryBank: 'HDFC Corporate Banking Services',
    accountNumber: '•••• •••• •••• 9921',
    ifscCode: 'HDFC0000492',
    cutOffDay: '30th of each month',
    tdsFilingQuarter: 'Q3 FY27'
  });

  const handleSave = (e) => {
    e.preventDefault();
    setFeedback('Payroll configuration and statutory withholding parameters saved successfully!');
    setTimeout(() => setFeedback(''), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Payroll & Statutory Withholding Configuration
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Define corporate banking credentials, provident fund rates, professional tax brackets, and disbursal dates.
        </p>
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

      <form onSubmit={handleSave} className="space-y-6">
        {/* Banking Setup */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Landmark className="h-5 w-5 text-teal-500" />
            Corporate Disbursal Bank Account
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Corporate Bank</label>
              <input
                type="text"
                value={settings.primaryBank}
                onChange={(e) => setSettings({ ...settings, primaryBank: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Account Number Mask</label>
              <input
                type="text"
                value={settings.accountNumber}
                onChange={(e) => setSettings({ ...settings, accountNumber: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">IFSC Code</label>
              <input
                type="text"
                value={settings.ifscCode}
                onChange={(e) => setSettings({ ...settings, ifscCode: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Monthly Salary Cut-off</label>
              <input
                type="text"
                value={settings.cutOffDay}
                onChange={(e) => setSettings({ ...settings, cutOffDay: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Statutory Withholdings */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Percent className="h-5 w-5 text-teal-500" />
            Statutory Rates (EPF & Professional Tax)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Employee EPF Contribution Rate</label>
              <input
                type="text"
                value={settings.epfRate}
                onChange={(e) => setSettings({ ...settings, epfRate: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Statutory Professional Tax (INR ₹)</label>
              <input
                type="text"
                value={settings.professionalTax}
                onChange={(e) => setSettings({ ...settings, professionalTax: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl font-semibold bg-slate-900 dark:bg-teal-600 text-white hover:bg-slate-800 transition shadow-sm"
          >
            Save Payroll Settings
          </button>
        </div>
      </form>
    </div>
  );
}

