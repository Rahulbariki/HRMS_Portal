import { useState } from 'react';
import { Download, FileText, CheckCircle2 } from 'lucide-react';

const PAYSLIP_HISTORY = [
  { id: 1, month: 'September 2026', gross: '₹7,350.00', deductions: '₹900.00', net: '₹6,450.00', payDate: 'Sep 30, 2026', status: 'paid' },
  { id: 2, month: 'August 2026', gross: '₹7,350.00', deductions: '₹900.00', net: '₹6,450.00', payDate: 'Aug 31, 2026', status: 'paid' },
  { id: 3, month: 'July 2026', gross: '₹7,350.00', deductions: '₹900.00', net: '₹6,450.00', payDate: 'Jul 31, 2026', status: 'paid' },
  { id: 4, month: 'June 2026', gross: '₹7,350.00', deductions: '₹900.00', net: '₹6,450.00', payDate: 'Jun 30, 2026', status: 'paid' },
  { id: 5, month: 'May 2026', gross: '₹7,350.00', deductions: '₹900.00', net: '₹6,450.00', payDate: 'May 31, 2026', status: 'paid' },
];

export default function EmployeeSalary() {
  const [downloadSuccess, setDownloadSuccess] = useState('');

  const earnings = [
    { title: 'Basic Salary', amount: '₹4,200.00' },
    { title: 'House Rent Allowance (HRA)', amount: '₹1,600.00' },
    { title: 'Special Allowance', amount: '₹1,100.00' },
    { title: 'Performance Incentive', amount: '₹450.00' },
  ];

  const deductions = [
    { title: 'Provident Fund / 401(k)', amount: '₹420.00' },
    { title: 'Income Tax (TDS / PAYE)', amount: '₹380.00' },
    { title: 'Health Insurance Premium', amount: '₹100.00' },
  ];

  const handleDownload = (month) => {
    setDownloadSuccess(`Payslip for ${month} downloaded successfully!`);
    setTimeout(() => setDownloadSuccess(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">Salary & Payslips</h1>
          <p className="text-sm text-slate-500 mt-1">Compensation overview, tax breakdowns, and monthly payslips</p>
        </div>
        <button
          onClick={() => handleDownload('Latest Month')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-md transition-all self-start sm:self-auto"
        >
          <Download className="h-4 w-4 text-teal-400" />
          <span>Download Latest Payslip (PDF)</span>
        </button>
      </div>

      {downloadSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Monthly Salary</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">₹6,450.00</p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Processed to direct deposit</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Annual Compensation</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">₹88,200.00</p>
          <p className="text-xs text-slate-400 mt-1">Base + performance tiers</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Next Disbursal Date</p>
          <p className="text-2xl font-bold text-slate-800 mt-2">Oct 31, 2026</p>
          <p className="text-xs text-slate-400 mt-1">In 5 business days</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tax Deductions YTD</p>
          <p className="text-2xl font-bold text-slate-800 mt-2">₹3,420.00</p>
          <p className="text-xs text-slate-400 mt-1">Form 16 / W-2 on track</p>
        </div>
      </div>

      {/* Current Month Detailed Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">Current Salary Breakdown</h3>
            <p className="text-xs text-slate-500">Gross: ₹7,350.00 • Net: ₹6,450.00</p>
          </div>
          <span className="text-xs font-semibold text-teal-900 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
            Salary Band: L4-Engineer
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Earnings Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center justify-between pb-2 border-b border-emerald-100">
              <span>Earnings</span>
              <span>Amount</span>
            </h4>
            <div className="divide-y divide-slate-100">
              {earnings.map((e, idx) => (
                <div key={idx} className="py-2.5 flex justify-between text-xs font-medium">
                  <span className="text-slate-700">{e.title}</span>
                  <span className="text-slate-900 font-mono font-bold">{e.amount}</span>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-between text-xs font-bold text-slate-900">
              <span>Total Gross Earnings</span>
              <span className="font-mono text-emerald-700">₹7,350.00</span>
            </div>
          </div>

          {/* Deductions Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center justify-between pb-2 border-b border-rose-100">
              <span>Deductions & Withholdings</span>
              <span>Amount</span>
            </h4>
            <div className="divide-y divide-slate-100">
              {deductions.map((d, idx) => (
                <div key={idx} className="py-2.5 flex justify-between text-xs font-medium">
                  <span className="text-slate-700">{d.title}</span>
                  <span className="text-rose-600 font-mono font-bold">{d.amount}</span>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-between text-xs font-bold text-slate-900">
              <span>Total Deductions</span>
              <span className="font-mono text-rose-600">₹900.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Payslips Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-slate-900">Payslip History</h3>
          <span className="text-xs text-slate-400 font-medium">Past 6 Months</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Pay Period</th>
                <th className="px-6 py-3.5">Gross Pay</th>
                <th className="px-6 py-3.5">Deductions</th>
                <th className="px-6 py-3.5">Net Pay</th>
                <th className="px-6 py-3.5">Disbursal Date</th>
                <th className="px-6 py-3.5 text-right">Payslip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {PAYSLIP_HISTORY.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-teal-600" />
                    <span>{p.month}</span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-700">
                    {p.gross}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-rose-600">
                    {p.deductions}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-900 font-bold">
                    {p.net}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {p.payDate}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDownload(p.month)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 hover:bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 transition"
                    >
                      <Download className="h-3 w-3" />
                      <span>Download</span>
                    </button>
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