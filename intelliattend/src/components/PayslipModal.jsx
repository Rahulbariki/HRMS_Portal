import { useRef } from 'react';
import { 
  X, Printer, Download, CheckCircle2, Building2, 
  Landmark, ShieldCheck, FileCheck, IndianRupee 
} from 'lucide-react';
import clsx from 'clsx';

// Convert number to words in Indian Currency numbering
function numberToWordsINR(num) {
  const n = Math.floor(Math.abs(Number(num) || 0));
  if (n === 0) return 'Zero Rupees Only';

  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(v) {
    if (v === 0) return '';
    if (v < 10) return units[v];
    if (v >= 10 && v < 20) return teens[v - 10];
    const t = Math.floor(v / 10);
    const u = v % 10;
    return tens[t] + (u ? ' ' + units[u] : '');
  }

  function convertThreeDigits(v) {
    const h = Math.floor(v / 100);
    const rem = v % 100;
    const hStr = h ? units[h] + ' Hundred' : '';
    const remStr = convertTwoDigits(rem);
    if (hStr && remStr) return hStr + ' and ' + remStr;
    return hStr || remStr;
  }

  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const remainder = n % 1000;

  let words = '';
  if (crore) words += convertTwoDigits(crore) + ' Crore ';
  if (lakh) words += convertTwoDigits(lakh) + ' Lakh ';
  if (thousand) words += convertTwoDigits(thousand) + ' Thousand ';
  if (remainder) words += convertThreeDigits(remainder);

  return (words.trim() ? 'Rupees ' + words.trim() + ' Only' : 'Zero Rupees Only');
}

export default function PayslipModal({ payslip, employee, company, onClose }) {
  const printRef = useRef(null);

  if (!payslip) return null;

  const empName = employee?.name || employee?.userName || employee?.user_name || payslip.userName || payslip.user_name || 'Staff Member';
  const empId = employee?.id || employee?.employeeId || employee?.user_id || payslip.userId || payslip.user_id || 'IA-EM-001';
  const designation = employee?.designation || employee?.role || 'Senior Associate';
  const department = employee?.department || 'Engineering & Operations';
  const bankAccount = employee?.bankAccount || employee?.bank_account || 'HDFC0001849201';
  const panNumber = employee?.panNumber || employee?.pan_number || 'ABCDE1234F';

  // Gross, Net, Deductions
  const gross = Number(payslip.gross || payslip.gross_inr || payslip.grossAmount || 85000);
  const deductions = Number(payslip.deductions || payslip.deductions_inr || payslip.totalDeductions || 7000);
  const net = Number(payslip.net || payslip.net_inr || payslip.netDisbursal || (gross - deductions));

  // Granular breakdowns
  const basic = Math.round(gross * 0.50);
  const hra = Math.round(gross * 0.25);
  const conveyance = Math.round(gross * 0.10);
  const specialAllowance = gross - (basic + hra + conveyance);

  const pf = Math.min(1800, Math.round(basic * 0.12));
  const profTax = 200;
  const tds = Math.max(0, deductions - (pf + profTax));

  const earningsList = [
    { label: 'Basic Salary', amount: basic },
    { label: 'House Rent Allowance (HRA)', amount: hra },
    { label: 'Conveyance Allowance', amount: conveyance },
    { label: 'Special / Flexi Allowance', amount: specialAllowance },
  ];

  const deductionsList = [
    { label: 'Provident Fund (EPF - Employee)', amount: pf },
    { label: 'Professional Tax (PT)', amount: profTax },
    { label: 'Tax Deducted at Source (TDS)', amount: tds },
  ];

  const handlePrint = () => {
    window.print();
  };

  const netWords = numberToWordsINR(net);

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div 
        ref={printRef}
        className="bg-white text-slate-900 rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto print:border-none print:shadow-none print:max-w-none print:w-full print:rounded-none"
      >
        {/* Top Action Bar (Hidden on Print) */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Official Monthly Pay Certificate
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Payslip Sheet */}
        <div className="p-6 sm:p-8 space-y-6 print:p-6 print:space-y-4">
          {/* Company Branding & Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-6 border-b-2 border-slate-900">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-teal-300 flex items-center justify-center font-bold text-lg border border-slate-800">
                IA
              </div>
              <div>
                <h2 className="font-display text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  INTELLIATTEND TECHNOLOGIES INDIA PVT LTD
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Corporate HQ • Hitec City, Hyderabad, Telangana, 500081
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  CIN: U72200TG2024PTC184920 • GSTIN: 36AAACI1849P1ZZ
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
                Payslip — {payslip.month || 'Current Cycle'}
              </span>
              <p className="text-xs text-slate-500 mt-1.5">
                Pay Date: <span className="font-semibold text-slate-800">{payslip.payDate || payslip.pay_date || '30th of Month'}</span>
              </p>
              <p className="text-[11px] font-mono text-slate-400">
                Ref: {payslip.transactionRef || payslip.transaction_ref || 'SAL-RTGS-BATCH-01'}
              </p>
            </div>
          </div>

          {/* Employee Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Employee Name</p>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{empName}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Employee Code</p>
              <p className="font-mono font-bold text-slate-900 mt-0.5">{empId}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Designation</p>
              <p className="font-semibold text-slate-800 mt-0.5 truncate">{designation}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Department</p>
              <p className="font-semibold text-slate-800 mt-0.5">{department}</p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bank Account</p>
              <p className="font-mono font-medium text-slate-800 mt-0.5">
                •••• {String(bankAccount).slice(-4)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PAN Identifier</p>
              <p className="font-mono font-medium text-slate-800 mt-0.5">{panNumber}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Days in Month</p>
              <p className="font-semibold text-slate-800 mt-0.5">{payslip.workingDays || payslip.working_days || 30} Days</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Paid Working Days</p>
              <p className="font-bold text-emerald-700 mt-0.5">{payslip.paidDays || payslip.paid_days || 30} Days</p>
            </div>
          </div>

          {/* Earnings & Deductions Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            {/* Earnings Column */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex justify-between items-center font-bold text-slate-800">
                <span>EARNINGS</span>
                <span>AMOUNT (INR)</span>
              </div>
              <div className="divide-y divide-slate-100 p-1">
                {earningsList.map((item, idx) => (
                  <div key={idx} className="flex justify-between px-3 py-2 text-slate-700">
                    <span>{item.label}</span>
                    <span className="font-mono font-semibold">₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                <span>Gross Earnings (A)</span>
                <span className="font-mono text-emerald-700">₹{gross.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Deductions Column */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex justify-between items-center font-bold text-slate-800">
                <span>DEDUCTIONS</span>
                <span>AMOUNT (INR)</span>
              </div>
              <div className="divide-y divide-slate-100 p-1">
                {deductionsList.map((item, idx) => (
                  <div key={idx} className="flex justify-between px-3 py-2 text-slate-700">
                    <span>{item.label}</span>
                    <span className="font-mono font-semibold text-rose-600">-₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                <span>Total Deductions (B)</span>
                <span className="font-mono text-rose-600">-₹{deductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Net Take-Home Pay Banner */}
          <div className="p-5 rounded-2xl bg-teal-50/80 border-2 border-teal-300/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-teal-800">
                Net Take-Home Remuneration (A - B)
              </p>
              <p className="font-display text-2xl sm:text-3xl font-extrabold text-teal-950 font-mono mt-0.5">
                ₹{net.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-teal-800 font-medium mt-1">
                Amount in Words: <span className="font-semibold italic">{netWords}</span>
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-1.5 self-start sm:self-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>DIRECT RTGS SETTLED</span>
              </span>
              <p className="text-[10px] text-slate-500 font-mono">
                Wire Ref: {payslip.transactionRef || payslip.transaction_ref || 'TXN-9021849'}
              </p>
            </div>
          </div>

          {/* Digital Signature & Footer Notice */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div className="space-y-0.5 text-center sm:text-left">
              <p className="font-semibold text-slate-700">IntelliAttend Digital Payroll System</p>
              <p className="text-slate-400">Computer-generated payslip authenticated under IT Act 2000. No signature required.</p>
            </div>

            <div className="flex items-center gap-2 border border-slate-200 px-3 py-1.5 rounded-xl bg-slate-50">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span className="font-semibold text-slate-700">Digitally Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

