import { useState, useEffect } from 'react';
import {
  Download, FileText, CheckCircle2, IndianRupee, Printer,
  Building, ShieldCheck, X, Eye, Loader2, ArrowUpRight
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import PayslipModal from '../../components/PayslipModal';

export default function EmployeeSalary() {
  const { user } = useAuth();
  const userId = user?.id || 'IA-EM-001';

  const [structure, setStructure] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadSuccess, setDownloadSuccess] = useState('');
  const [activeSlip, setActiveSlip] = useState(null);

  useEffect(() => {
    const fetchSalaryData = async () => {
      try {
        const [structRes, slipsRes] = await Promise.all([
          api.get(`/salary/structure?userId=${userId}`),
          api.get(`/salary/payslips?userId=${userId}`)
        ]);

        if (structRes.data?.success && structRes.data?.data) {
          setStructure(structRes.data.data);
        }
        if (slipsRes.data?.success && Array.isArray(slipsRes.data?.data)) {
          setPayslips(slipsRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching salary details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSalaryData();
  }, [userId]);

  const handleDownload = (slip) => {
    setActiveSlip(slip);
  };

  const earnings = structure ? [
    { title: 'Basic Salary', amount: Number(structure.basicSalary) },
    { title: 'House Rent Allowance (HRA)', amount: Number(structure.hra) },
    { title: 'Special Allowance', amount: Number(structure.specialAllowance) },
    { title: 'Performance Bonus / Incentive', amount: Number(structure.performanceBonus) },
  ] : [];

  const deductions = structure ? [
    { title: 'Employee Provident Fund (EPF / PF)', amount: Number(structure.pfDeduction) },
    { title: 'Income Tax (TDS / Deductions)', amount: Number(structure.tdsDeduction) },
    { title: 'Group Health Insurance Premium', amount: Number(structure.insuranceDeduction) },
    { title: 'Professional Tax (PT)', amount: Number(structure.professionalTax) },
  ] : [];

  const totalEarnings = earnings.reduce((sum, item) => sum + item.amount, 0);
  const totalDeductions = deductions.reduce((sum, item) => sum + item.amount, 0);
  const netMonthly = structure ? Number(structure.monthlyNetInr) : totalEarnings - totalDeductions;
  const annualCtc = structure ? Number(structure.annualCtcInr) : 0;

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        <p className="text-xs font-semibold">Loading verified compensation details from Neon PostgreSQL...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">Salary & Payslips</h1>
          <p className="text-sm text-slate-500 mt-1">Compensation overview, statutory tax breakdowns, and official monthly payslips</p>
        </div>
        <button
          onClick={() => payslips.length > 0 && handleDownload(payslips[0])}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <FileText className="h-4 w-4 text-teal-400" />
          <span>View Latest Payslip</span>
        </button>
      </div>

      {downloadSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{downloadSuccess}</span>
          </div>
          <button type="button" onClick={() => setDownloadSuccess('')} className="text-emerald-700 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Take-Home Salary</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 font-mono">
            ₹{netMonthly.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Direct deposit credited</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Annual Compensation (CTC)</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 font-mono">
            ₹{annualCtc.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-400 mt-1">{structure?.salaryBand || 'Standard Band'}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Next Disbursal Date</p>
          <p className="text-2xl font-bold text-slate-800 mt-2">Oct 31, 2026</p>
          <p className="text-xs text-slate-400 mt-1">End of month payroll cycle</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Statutory Deductions</p>
          <p className="text-2xl font-bold text-slate-800 mt-2 font-mono">
            ₹{totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-400 mt-1">EPF + TDS + PT + Insurance</p>
        </div>
      </div>

      {/* Current Month Detailed Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 mb-6 gap-2">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">Official Compensation Structure</h3>
            <p className="text-xs text-slate-500">
              Gross Monthly: <span className="font-mono font-bold text-slate-800">₹{totalEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span> •
              Net Disbursal: <span className="font-mono font-bold text-teal-700">₹{netMonthly.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-semibold text-teal-900 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
              {structure?.salaryBand || 'Band L4'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Earnings Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center justify-between pb-2 border-b border-emerald-100">
              <span>Earnings / Allowances</span>
              <span className="font-mono">₹{totalEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </h4>
            <div className="space-y-2">
              {earnings.map((e, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs py-1.5 border-b border-slate-50">
                  <span className="text-slate-600 font-medium">{e.title}</span>
                  <span className="font-mono font-bold text-slate-900">
                    ₹{e.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Deductions Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center justify-between pb-2 border-b border-rose-100">
              <span>Statutory & Tax Deductions</span>
              <span className="font-mono">₹{totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </h4>
            <div className="space-y-2">
              {deductions.map((d, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs py-1.5 border-b border-slate-50">
                  <span className="text-slate-600 font-medium">{d.title}</span>
                  <span className="font-mono font-bold text-rose-600">
                    -₹{d.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bank & Tax Verification Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50/70 p-3.5 rounded-xl">
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Disbursal Account</span>
            <span className="font-semibold text-slate-800">{structure?.bankAccount || '•••• •••• 4892 (HDFC Bank)'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase">PAN Identifier</span>
            <span className="font-mono font-bold text-slate-800">{structure?.panNumber || 'ABCDE1234F'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Payment Protocol</span>
            <span className="font-semibold text-slate-800">Automated Direct RTGS / NEFT</span>
          </div>
        </div>
      </div>

      {/* Historical Payslips Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-500" />
            <h3 className="font-semibold text-sm text-slate-900">Historical Monthly Payslips (Neon PostgreSQL)</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">{payslips.length} Disbursals</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Disbursal Period</th>
                <th className="px-6 py-3.5">Payment Date</th>
                <th className="px-6 py-3.5">Gross (INR)</th>
                <th className="px-6 py-3.5">Deductions</th>
                <th className="px-6 py-3.5">Net Disbursed</th>
                <th className="px-6 py-3.5">Reference ID</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {payslips.map((slip) => (
                <tr key={slip.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900 text-xs">
                    {slip.month}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-600">
                    {slip.payDate}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-700">
                    ₹{Number(slip.gross).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-rose-600">
                    -₹{Number(slip.deductions).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono font-bold text-emerald-700">
                    ₹{Number(slip.net).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-400">
                    {slip.transactionRef}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDownload(slip)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold transition bg-white hover:bg-slate-50 cursor-pointer shadow-2xs"
                    >
                      <Eye className="h-3.5 w-3.5 text-teal-600" />
                      <span>View Slip</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Payslip Modal with Print */}
      {activeSlip && (
        <PayslipModal
          payslip={activeSlip}
          employee={{
            name: structure?.userName || user?.name || 'Sarah Miller',
            id: structure?.userId || user?.employeeId || user?.id || 'IA-EM-001',
            designation: structure?.designation || user?.designation || 'Lead SDE',
            department: user?.department || 'Engineering Pod',
            bankAccount: user?.bankAccount || 'HDFC0001849201',
            panNumber: structure?.panNumber || 'ABCDE1234F'
          }}
          onClose={() => setActiveSlip(null)}
        />
      )}
    </div>
  );
}