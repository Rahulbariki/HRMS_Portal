import { useState } from 'react';
import {
  FileText, Download, Printer, CheckCircle2, ShieldCheck,
  Building2, Award, Calendar, ExternalLink, X, Eye
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function EmployeeLetters() {
  const { user } = useAuth();
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [downloadSuccess, setDownloadSuccess] = useState('');

  const employeeName = user ? `${user.firstName || user.first_name || 'Sarah'} ${user.lastName || user.last_name || 'Miller'}` : 'Sarah Miller';
  const employeeId = user?.employeeId || user?.id || 'IA-EM-001';
  const designation = user?.designation || 'Senior Full Stack Engineer';
  const department = user?.department || 'Engineering';
  const companyName = user?.companyName || user?.company_name || 'Acme Enterprise';
  const doj = user?.doj || '15 Jan 2025';
  const location = user?.workLocation || user?.work_location || 'Hyderabad, India';

  const letterTemplates = [
    {
      id: 'employment-verification',
      title: 'Employment Verification Letter',
      category: 'Official HR Letter',
      description: 'Formal statement verifying your current employment status, title, department, and tenure.',
      issuedDate: 'Immediate on Request',
      validity: '6 Months',
      badge: 'Most Requested'
    },
    {
      id: 'salary-certificate',
      title: 'Salary & Compensation Certificate',
      category: 'Financial Certificate',
      description: 'Official proof of earnings and statutory CTC breakdown for bank loan, credit card, or visa processing.',
      issuedDate: 'Immediate on Request',
      validity: '3 Months',
      badge: 'Banking & Visa'
    },
    {
      id: 'bonafide-letter',
      title: 'Bonafide Corporate Certificate',
      category: 'General Certificate',
      description: 'Certifies active status as a bona fide corporate employee for conferences, travel, or statutory bodies.',
      issuedDate: 'Immediate on Request',
      validity: '1 Year',
      badge: 'Travel & Events'
    },
    {
      id: 'experience-certificate',
      title: 'Provisional Service Certificate',
      category: 'Tenure Document',
      description: 'Detailed record of roles, key achievements, and duration of service to date.',
      issuedDate: 'Immediate on Request',
      validity: 'Permanent',
      badge: 'Service Record'
    }
  ];

  const handlePrint = () => {
    window.print();
    setDownloadSuccess('Letter generated and prepared for print/PDF export.');
    setTimeout(() => setDownloadSuccess(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">Letters & Certificates</h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate and download digitally verified corporate letters, employment proof, and credentials
          </p>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{downloadSuccess}</span>
          </div>
          <button onClick={() => setDownloadSuccess('')} className="font-bold cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {letterTemplates.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800">
                  {item.badge}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base mt-4">{item.title}</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{item.description}</p>

              <div className="mt-5 pt-3 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
                <span>Validity: <strong className="text-slate-700">{item.validity}</strong></span>
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Instant Generation</span>
                </span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedLetter(item)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-teal-400" />
                <span>Preview & Print Letter</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Official Printable Letterhead Modal */}
      {selectedLetter && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Official Document Preview
              </span>
              <button onClick={() => setSelectedLetter(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Content */}
            <div className="p-8 overflow-y-auto space-y-6 text-slate-800 text-xs leading-relaxed font-serif">
              {/* Company Letterhead */}
              <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-end">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 font-sans">{companyName}</h2>
                  <p className="text-[11px] text-slate-500 font-sans">Corporate Human Resources & Identity Governance</p>
                  <p className="text-[10px] text-slate-400 font-sans">{location} • support@intelliattend.com</p>
                </div>
                <div className="text-right font-sans text-[11px] text-slate-500">
                  <p className="font-semibold text-slate-800">Ref: IA-HR-{new Date().getFullYear()}-{Math.floor(1000 + Math.random() * 9000)}</p>
                  <p>Date: {new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>

              <div className="pt-2 text-center">
                <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-900 underline underline-offset-4">
                  {selectedLetter.title}
                </h3>
              </div>

              <p className="pt-2">
                <strong>TO WHOMSOEVER IT MAY CONCERN</strong>
              </p>

              <p>
                This is to certify that <strong>{employeeName}</strong> (Employee ID: <strong>{employeeId}</strong>) is currently employed with <strong>{companyName}</strong> on a full-time basis as <strong>{designation}</strong> in the <strong>{department}</strong> department, since <strong>{doj}</strong>.
              </p>

              {selectedLetter.id === 'salary-certificate' ? (
                <p>
                  As per our official compensation records, {employeeName}&apos;s current gross annual Cost to Company (CTC) is ₹18,00,000/- (Rupees Eighteen Lakhs Only), with standard monthly disbursements processed via verified direct bank transfer with statutory deductions (EPF, TDS, and Professional Tax).
                </p>
              ) : (
                <p>
                  During their tenure with the organization, {employeeName} has demonstrated exemplary professional conduct, integrity, and dedication toward organizational objectives.
                </p>
              )}

              <p>
                This certificate is issued at the request of the employee for official verification purposes without any legal or financial liability on part of the issuing authority or the company.
              </p>

              {/* Signatures & Seal */}
              <div className="pt-8 flex justify-between items-end font-sans">
                <div>
                  <div className="w-32 border-b border-slate-400 pb-1 mb-2 font-mono text-[11px] text-teal-700 italic">
                    Digitally Authorized
                  </div>
                  <p className="font-bold text-slate-900 text-xs">Head of Human Resources</p>
                  <p className="text-[11px] text-slate-500">{companyName}</p>
                </div>
                <div className="text-right">
                  <div className="inline-block p-2 rounded-lg border-2 border-dashed border-teal-700/60 text-teal-800 font-mono text-[10px] uppercase font-bold">
                    Official Corporate Seal
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedLetter(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-md transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-teal-400" />
                <span>Print Official Letter</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}