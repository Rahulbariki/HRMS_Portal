import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Award, IndianRupee, FileText, Users, CheckCircle2, Clock,
  ArrowUpRight, ShieldCheck, ChevronRight, Landmark, Calendar
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function PayrollAdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeEmployees: 5,
    pendingInvoices: 1,
    totalDisbursed: 1083000,
    payrollCycle: 'Monthly (30th EOM)'
  });
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, invRes] = await Promise.all([
          api.get('/payroll-admin/dashboard'),
          api.get('/payroll-admin/invoices')
        ]);
        if (dashRes.data?.success) setStats(dashRes.data.data);
        if (invRes.data?.success) setRecentInvoices(invRes.data.data.slice(0, 4));
      } catch (err) {
        console.error('Error fetching dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Payroll Administrator Workspace
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Welcome back, <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.name || 'James Wilson'}</span> • Finance & Compensation Directorate
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/payroll-admin/invoices"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-900 dark:bg-teal-600 text-white hover:bg-slate-800 transition shadow-sm"
          >
            <FileText className="h-4 w-4" />
            Generate Monthly Invoice
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Eligible Staff Roster</p>
            <p className="font-display text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.activeEmployees}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Salaried personnel</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Awaiting Disbursal</p>
            <p className="font-display text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.pendingInvoices}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">October 2026 payroll</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Settled Disbursal (YTD)</p>
            <p className="font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              ₹{Number(stats.totalDisbursed || 1083000).toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Direct bank wires</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <IndianRupee className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Next Salary Cut-off</p>
            <p className="font-display text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">31 Oct 2026</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{stats.payrollCycle}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Calendar className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Payroll Invoice Runs
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Monthly consolidated salary disbursal orders and verification status.
            </p>
          </div>
          <Link
            to="/payroll-admin/invoices"
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
          >
            View all invoices <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Invoice Number</th>
                <th className="px-6 py-4">Payroll Cycle</th>
                <th className="px-6 py-4">Headcount</th>
                <th className="px-6 py-4">Gross Total</th>
                <th className="px-6 py-4">Total Deductions</th>
                <th className="px-6 py-4">Net Disbursal</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {recentInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                  <td className="px-6 py-4 font-mono font-medium text-slate-900 dark:text-white">
                    {inv.invoice_number}
                  </td>
                  <td className="px-6 py-4 text-slate-800 dark:text-slate-200 font-medium">
                    {inv.month} {inv.year}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    {inv.total_employees} Employees
                  </td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                    ₹{Number(inv.gross_amount).toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-rose-600 dark:text-rose-400">
                    -₹{Number(inv.total_deductions).toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{Number(inv.net_disbursal).toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={clsx(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
                      inv.status === 'paid'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : inv.status === 'submitted'
                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    )}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {inv.status === 'paid' ? 'Disbursed' : inv.status === 'submitted' ? 'Under Review' : 'Draft'}
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
