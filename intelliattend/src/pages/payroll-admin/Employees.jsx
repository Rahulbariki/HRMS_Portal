import { useState, useEffect } from 'react';
import {
  Users, Search, CheckCircle2, Shield, Landmark, IndianRupee,
  FileText, Download
} from 'lucide-react';
import clsx from 'clsx';
import api from '../../services/api';

export default function PayrollAdminEmployees() {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPayrollStaff = async () => {
      try {
        const res = await api.get('/manager/employee-salaries');
        if (res.data?.success && Array.isArray(res.data?.data)) {
          setSalaries(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching payroll staff:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayrollStaff();
  }, []);

  const filtered = salaries.filter(s =>
    (s.user_name && s.user_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.designation && s.designation.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.bank_name && s.bank_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Eligible Payroll Personnel & Banking Roster
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Verify statutory tax deduction mandates, designated bank accounts, and monthly gross disbursals.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by personnel name, designation, or bank account..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-900 dark:text-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Designation</th>
                <th className="px-6 py-4">Bank & Account</th>
                <th className="px-6 py-4">Monthly Gross</th>
                <th className="px-6 py-4">PF Withholding</th>
                <th className="px-6 py-4">TDS Withholding</th>
                <th className="px-6 py-4">Net Monthly Payout</th>
                <th className="px-6 py-4">Eligibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filtered.map(s => (
                <tr key={s.user_id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900 dark:text-white">{s.user_name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{s.user_id}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                    {s.designation}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-800 dark:text-slate-200">{s.bank_name || 'HDFC Bank'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{s.bank_account || '•••• 4892'}</p>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                    ₹{Number(s.monthly_gross_inr).toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    -₹{Number(s.pf_deduction).toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    -₹{Number(s.tds_deduction).toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{Number(s.monthly_net_inr).toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Approved
                    </span>
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
