import React, { useState, useEffect } from 'react';
import { 
  LogOut, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Laptop, 
  CreditCard, 
  Briefcase, 
  HelpCircle,
  Send,
  Calendar,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function EmployeeOffboarding() {
  const { user } = useAuth();
  const [resignationStatus, setResignationStatus] = useState('not_submitted'); // 'not_submitted', 'pending', 'approved', 'in_clearance'
  const [reason, setReason] = useState('Career Growth & New Opportunities');
  const [customComments, setCustomComments] = useState('');
  const [noticePeriodDays, setNoticePeriodDays] = useState(60);
  const [submittedAt, setSubmittedAt] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [clearanceItems, setClearanceItems] = useState([
    { id: 1, title: 'Company MacBook Pro & Accessories', dept: 'IT Systems', status: 'Pending Return', icon: Laptop },
    { id: 2, title: 'Corporate Access Badge & Smart Card', dept: 'Facilities', status: 'Pending Return', icon: CreditCard },
    { id: 3, title: 'Project Handover & Repo KT Signoff', dept: 'Engineering', status: 'In Progress', icon: Briefcase },
    { id: 4, title: 'Travel & Expense Clearance', dept: 'Finance & Accounts', status: 'Cleared', icon: CheckCircle2 },
    { id: 5, title: 'Confidentiality & Non-Disclosure (NDA)', dept: 'Legal & HR', status: 'Signed', icon: ShieldCheck }
  ]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get(`/offboarding/status?userId=${user?.id || 'IA-EM-001'}`);
        if (res.data?.success && res.data.data) {
          setResignationStatus(res.data.data.status || 'pending');
          setReason(res.data.data.reason || reason);
          if (res.data.data.resignation_date) {
            setSubmittedAt(new Date(res.data.data.resignation_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }));
          }
        }
      } catch (err) {
        console.error('Failed to load offboarding record from Neon DB:', err);
      }
    };
    fetchStatus();
  }, [user?.id]);

  const handleApplyResignation = async (e) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to submit your formal resignation notice? Your manager and HR will be notified immediately.')) return;
    
    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await api.post('/offboarding/apply', {
        employeeId: user?.id || 'IA-EM-001',
        employeeName: user?.name || 'Sarah Miller',
        reason,
        customComments,
        noticePeriodDays
      });
      if (res.data?.success !== false) {
        setResignationStatus('pending');
        setSubmittedAt(new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }));
      } else {
        setErrorMessage(res.data?.message || 'Failed to submit resignation. Please try again.');
      }
    } catch (err) {
      console.error('Failed to save resignation to Neon DB:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to submit resignation request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const calculatedLWD = () => {
    const d = new Date();
    d.setDate(d.getDate() + noticePeriodDays);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
              <LogOut className="w-6 h-6" />
            </span>
            Employee Separation & Clearance
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Formal resignation protocol, standard notice period tracking, and department clearance checklists
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${
            resignationStatus === 'not_submitted'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
          }`}>
            <span className={`w-2 h-2 rounded-full ${resignationStatus === 'not_submitted' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`}></span>
            {resignationStatus === 'not_submitted' ? 'Active Employment' : 'Separation In-Progress'}
          </span>
        </div>
      </div>

      {resignationStatus === 'not_submitted' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Submit Formal Notice of Resignation
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Pursuant to company terms, standard contractual notice periods apply. Please provide full context to facilitate a smooth transition.
              </p>

              <form onSubmit={handleApplyResignation} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Primary Reason for Separation
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Career Growth & New Opportunities">Career Growth & New Opportunities</option>
                    <option value="Higher Education / Certifications">Higher Education / Certifications</option>
                    <option value="Relocation / Family Commitments">Relocation / Family Commitments</option>
                    <option value="Personal Health / Medical Reasons">Personal Health / Medical Reasons</option>
                    <option value="Entrepreneurship / Starting a Venture">Entrepreneurship / Starting a Venture</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Contractual Notice Period
                    </label>
                    <div className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium text-sm">
                      {noticePeriodDays} Days (Standard Indian Tech Policy)
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Proposed Last Working Day (LWD)
                    </label>
                    <div className="px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold text-sm flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {calculatedLWD()}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Handover Notes & Comments
                  </label>
                  <textarea
                    rows={4}
                    value={customComments}
                    onChange={(e) => setCustomComments(e.target.value)}
                    placeholder="Briefly describe ongoing projects, current status, and proposed handover plan..."
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Submitting this form initiates an official exit workflow. You will receive an exit interview invitation from HR, and your manager will schedule a KT handover schedule.
                  </span>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                    {errorMessage}
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? 'Submitting...' : 'Submit Formal Resignation'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                Separation Guidelines
              </h3>
              <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0"></span>
                  <span>Full and final settlement (F&F) is credited within 30 days of the last working day.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0"></span>
                  <span>Unencashed earned leaves (EL) will be liquidated as per the Leaves & Encashment policy.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0"></span>
                  <span>Relieving and Experience certificates will be available on the portal post IT & Finance no-dues signoff.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Separation Case #SEP-2026-004
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  Resignation Active & In Review
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Submitted on {submittedAt} • Proposed Last Working Day: <span className="font-semibold text-slate-800 dark:text-slate-200">{calculatedLWD()}</span>
                </p>
              </div>
              <div className="px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Manager Review in Progress
              </div>
            </div>

            {/* Department No-Dues Checklist */}
            <div className="mt-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                Departmental Clearance & No-Dues Matrix
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clearanceItems.map((item) => {
                  const Icon = item.icon;
                  const isDone = item.status === 'Cleared' || item.status === 'Signed';
                  return (
                    <div key={item.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-lg ${isDone ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{item.dept}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        isDone 
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}