import { useState, useEffect } from 'react';
import {
  Award, IndianRupee, Search, Edit2, CheckCircle2, Shield,
  CreditCard, Landmark, FileText, ArrowUpRight, TrendingUp
} from 'lucide-react';
import clsx from 'clsx';
import api from '../../services/api';

export default function ManagerEmployeeSalaries() {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState('');
  const [editingUser, setEditingUser] = useState(null);

  // Form State
  const [form, setForm] = useState({
    annual_ctc_inr: '',
    basic_salary: '',
    hra: '',
    special_allowance: '',
    pf_deduction: 1800,
    tds_deduction: 0,
    bank_name: '',
    bank_account: ''
  });

  const fetchSalaries = async () => {
    try {
      const res = await api.get('/manager/employee-salaries');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setSalaries(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching salaries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaries();
  }, []);

  const handleEditClick = (s) => {
    setEditingUser(s);
    setForm({
      annual_ctc_inr: s.annual_ctc_inr,
      basic_salary: s.basic_salary,
      hra: s.hra,
      special_allowance: s.special_allowance,
      pf_deduction: s.pf_deduction,
      tds_deduction: s.tds_deduction,
      bank_name: s.bank_name || 'HDFC Bank',
      bank_account: s.bank_account || ''
    });
  };

  const handleSaveSalary = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/manager/employee-salaries/${editingUser.user_id}`, form);
      if (res.data?.success) {
        setFeedback(`Compensation structure for ${editingUser.user_name} updated!`);
        setEditingUser(null);
        fetchSalaries();
        setTimeout(() => setFeedback(''), 4000);
      }
    } catch (err) {
      console.error('Failed to update salary:', err);
    }
  };

  const totalMonthlyGross = salaries.reduce((acc, curr) => acc + Number(curr.monthly_gross_inr || 0), 0);
  const totalAnnualCTC = salaries.reduce((acc, curr) => acc + Number(curr.annual_ctc_inr || 0), 0);
  const totalPF = salaries.reduce((acc, curr) => acc + Number(curr.pf_deduction || 0), 0);
  const totalTDS = salaries.reduce((acc, curr) => acc + Number(curr.tds_deduction || 0), 0);

  const filtered = salaries.filter(s =>
    (s.user_name && s.user_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.designation && s.designation.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.department && s.department.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Employee Compensation & Salary Structures
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review Cost to Company (CTC) compositions, statutory PF/TDS withholdings, and monthly net payouts.
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Monthly Gross Payroll</p>
            <p className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-1">
              ₹{totalMonthlyGross.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Active team members</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <IndianRupee className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Annual CTC Run-Rate</p>
            <p className="font-display text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
              ₹{totalAnnualCTC.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Annualized commitment</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">EPF Withholdings</p>
            <p className="font-display text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              ₹{totalPF.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Statutory monthly deposit</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Shield className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">TDS Tax Withholding</p>
            <p className="font-display text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              ₹{totalTDS.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Income tax deductions</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Landmark className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by employee name, department, or designation..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-900 dark:text-white"
        />
      </div>

      {/* Salary Structures Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Annual CTC</th>
                <th className="px-6 py-4">Monthly Gross</th>
                <th className="px-6 py-4">Basic Pay</th>
                <th className="px-6 py-4">HRA & Allowances</th>
                <th className="px-6 py-4">Deductions (PF+TDS)</th>
                <th className="px-6 py-4">Monthly Net Payout</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filtered.map((s) => (
                <tr key={s.user_id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900 dark:text-white">{s.user_name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{s.designation}</p>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                    ₹{Number(s.annual_ctc_inr).toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                    ₹{Number(s.monthly_gross_inr).toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    ₹{Number(s.basic_salary).toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    ₹{(Number(s.hra) + Number(s.special_allowance)).toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-rose-600 dark:text-rose-400 font-medium">
                    -₹{(Number(s.pf_deduction) + Number(s.tds_deduction)).toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{Number(s.monthly_net_inr).toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleEditClick(s)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Edit Salary Structure"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Salary Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Edit Salary Structure: {editingUser.user_name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Employee ID: {editingUser.user_id} • {editingUser.designation}
            </p>

            <form onSubmit={handleSaveSalary} className="mt-4 space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Annual CTC (INR ₹) *</label>
                <input
                  type="number"
                  required
                  value={form.annual_ctc_inr}
                  onChange={(e) => {
                    const ctc = Number(e.target.value);
                    const gross = Math.round(ctc / 12);
                    const basic = Math.round(gross * 0.5);
                    const hra = Math.round(basic * 0.4);
                    const special = gross - basic - hra;
                    setForm({
                      ...form,
                      annual_ctc_inr: ctc,
                      basic_salary: basic,
                      hra: hra,
                      special_allowance: special
                    });
                  }}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Monthly Basic Pay</label>
                  <input
                    type="number"
                    value={form.basic_salary}
                    onChange={(e) => setForm({ ...form, basic_salary: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">HRA Allowance</label>
                  <input
                    type="number"
                    value={form.hra}
                    onChange={(e) => setForm({ ...form, hra: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Special Allowance</label>
                  <input
                    type="number"
                    value={form.special_allowance}
                    onChange={(e) => setForm({ ...form, special_allowance: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Monthly PF Deduction</label>
                  <input
                    type="number"
                    value={form.pf_deduction}
                    onChange={(e) => setForm({ ...form, pf_deduction: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Monthly TDS Deduction</label>
                  <input
                    type="number"
                    value={form.tds_deduction}
                    onChange={(e) => setForm({ ...form, tds_deduction: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={form.bank_name}
                    onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm bg-slate-900 dark:bg-teal-600 text-white font-semibold"
                >
                  Save Compensation Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

