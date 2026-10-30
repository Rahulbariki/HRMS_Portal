import { useState, useEffect } from 'react';
import {
  FileText, Download, Printer, CheckCircle2, ShieldCheck,
  Building2, Award, Calendar, ExternalLink, X, Eye
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function EmployeeLetters() {
  const { user } = useAuth();
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [downloadSuccess, setDownloadSuccess] = useState('');
  const [issuedLetters, setIssuedLetters] = useState([]);
  const [issuedLetterRecord, setIssuedLetterRecord] = useState(null);
  const [isIssuing, setIsIssuing] = useState(false);
  const [issuanceFailed, setIssuanceFailed] = useState(false);

  const employeeName = user ? `${user.firstName || user.first_name || 'Sarah'} ${user.lastName || user.last_name || 'Miller'}` : 'Sarah Miller';
  const employeeId = user?.employeeId || user?.id || 'IA-EM-001';
  const designation = user?.designation || 'Senior Full Stack Engineer';
  const department = user?.department || 'Engineering';
  const companyName = user?.companyName || user?.company_name || 'Acme Enterprise';
  const doj = user?.doj || '15 Jan 2025';
  const location = user?.workLocation || user?.work_location || 'Hyderabad, India';

  const fetchIssuedLetters = async () => {
    try {
      const res = await api.get(`/employee/letters?userId=${employeeId}`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setIssuedLetters(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load issued letters:', err);
    }
  };

  useEffect(() => {
    fetchIssuedLetters();
  }, [employeeId]);

  useEffect(() => {
    if (!selectedLetter) {
      setIssuedLetterRecord(null);
      setIsIssuing(false);
      setIssuanceFailed(false);
      return;
    }

    let isSubscribed = true;
    setIsIssuing(true);
    setIssuanceFailed(false);

    api.post('/employee/letters/request', {
      letterType: selectedLetter.id || selectedLetter.title,
      employeeId,
      employeeName
    }).then(res => {
      if (isSubscribed) {
        const record = res.data?.data;
        const isApproved = record && ['approved', 'issued'].includes(String(record.status || '').toLowerCase());
        if (res.data?.success && isApproved) {
          setIssuedLetterRecord(record);
          fetchIssuedLetters();
        } else {
          setIssuedLetterRecord(null);
          if (!res.data?.success) {
            setIssuanceFailed(true);
          }
          fetchIssuedLetters();
        }
      }
    }).catch(err => {
      if (isSubscribed) {
        console.error('Letter issuance request failed:', err);
        setIssuanceFailed(true);
        setIssuedLetterRecord(null);
      }
    }).finally(() => {
      if (isSubscribed) setIsIssuing(false);
    });

    return () => { isSubscribed = false; };
  }, [selectedLetter, employeeId, employeeName]);

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
    if (!issuedLetterRecord) return;
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
                  <p className="font-semibold text-slate-800">
                    Ref: {issuedLetterRecord ? `IA-HR-${new Date(issuedLetterRecord.issue_date || Date.now()).getFullYear()}-${String(issuedLetterRecord.id).padStart(4, '0')}` : 'IA-HR-PREVIEW'}
                  </p>
                  <p>
                    Date: {issuedLetterRecord?.issue_date 
                      ? new Date(issuedLetterRecord.issue_date).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })
                      : new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="pt-2 text-center">
                <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-900 underline underline-offset-4">
                  {issuedLetterRecord?.title || selectedLetter.title}
                </h3>
              </div>

              {issuedLetterRecord ? (
                /* Canonical Server-Generated Approved Letter Content */
                <div className="space-y-4 pt-2">
                  <p>
                    <strong>TO WHOMSOEVER IT MAY CONCERN</strong>
                  </p>
                  <div className="whitespace-pre-line leading-relaxed">
                    {issuedLetterRecord.content}
                  </div>
                </div>
              ) : (
                /* Client Draft Preview (Official Print Blocked) */
                <div className="space-y-4 pt-2">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px] font-sans font-medium">
                    Preliminary Preview Only: Official printing is locked pending HR review and approval.
                  </div>
                  <p>
                    <strong>TO WHOMSOEVER IT MAY CONCERN</strong>
                  </p>
                  <p>
                    This is to certify that <strong>{employeeName}</strong> (Employee ID: <strong>{employeeId}</strong>) is currently employed with <strong>{companyName}</strong> on a full-time basis as <strong>{designation}</strong> in the <strong>{department}</strong> department, since <strong>{doj}</strong>.
                  </p>
                  <p>
                    During their tenure with the organization, {employeeName} has demonstrated exemplary professional conduct, integrity, and dedication toward organizational objectives.
                  </p>
                </div>
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
                  <p className="font-bold text-slate-900 text-xs">
                    {issuedLetterRecord?.issued_by || 'Head of Human Resources'}
                  </p>
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
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-[11px]">
                {isIssuing && <span className="text-slate-500">Submitting issuance request...</span>}
                {issuanceFailed && <span className="text-rose-600 font-semibold">Issuance failed. Official printing is disabled.</span>}
                {!isIssuing && !issuanceFailed && !issuedLetterRecord && (
                  <span className="text-amber-600 font-semibold">Letter request is pending approval. Official printing is disabled.</span>
                )}
                {issuedLetterRecord && <span className="text-emerald-700 font-semibold">Official letter approved and ready to print.</span>}
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedLetter(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!issuedLetterRecord || isIssuing}
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-md transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Printer className="w-3.5 h-3.5 text-teal-400" />
                  <span>{isIssuing ? 'Issuing...' : 'Print Official Letter'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}