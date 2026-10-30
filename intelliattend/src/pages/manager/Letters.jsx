import { useState, useEffect } from 'react';
import {
  FileText, Plus, Search, Download, Eye, CheckCircle2,
  Calendar, User, Award, Shield, Check
} from 'lucide-react';
import clsx from 'clsx';
import api from '../../services/api';

const LETTER_TYPES = [
  'All',
  'Offer Letter',
  'Appointment Letter',
  'Promotion Letter',
  'Experience Certificate',
  'Relieving Certificate',
  'Non-Disclosure Agreement (NDA)'
];

export default function ManagerLetters() {
  const [activeTab, setActiveTab] = useState('issued');
  const [issuedLetters, setIssuedLetters] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState('');

  // Modals
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [previewLetter, setPreviewLetter] = useState(null);

  // Form State
  const [form, setForm] = useState({
    user_id: '',
    letter_type: 'Appointment',
    title: 'Official Letter of Regular Appointment',
    content: ''
  });

  const fetchData = async () => {
    try {
      const [letRes, tmplRes, empRes] = await Promise.all([
        api.get('/manager/letters'),
        api.get('/manager/letters/templates'),
        api.get('/manager/employees')
      ]);
      if (letRes.data?.success) setIssuedLetters(letRes.data.data);
      if (tmplRes.data?.success) setTemplates(tmplRes.data.data);
      if (empRes.data?.success && empRes.data.data.length > 0) {
        setEmployees(empRes.data.data);
        setForm(prev => ({ ...prev, user_id: empRes.data.data[0].id }));
      }
    } catch (err) {
      console.error('Error fetching letters data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleIssueLetter = async (e) => {
    e.preventDefault();
    const emp = employees.find(x => x.id === form.user_id);
    const empName = emp ? `${emp.first_name} ${emp.last_name}` : 'Staff Member';

    try {
      const res = await api.post('/manager/letters', {
        ...form,
        user_name: empName
      });
      if (res.data?.success) {
        setFeedback(`Letter "${form.title}" issued to ${empName}!`);
        setShowIssueModal(false);
        fetchData();
        setTimeout(() => setFeedback(''), 4000);
      }
    } catch (err) {
      console.error('Failed to issue letter:', err);
    }
  };

  const filteredLetters = issuedLetters.filter(l =>
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.letter_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Letters & Certification Governance
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Generate, sign, and issue corporate employment offers, promotions, and relieving certificates.
          </p>
        </div>
        <div>
          <button
            onClick={() => setShowIssueModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-900 dark:bg-teal-600 text-white hover:bg-slate-800 transition shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Issue New Letter
          </button>
        </div>
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

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('issued')}
          className={clsx(
            'flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition -mb-px',
            activeTab === 'issued'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          )}
        >
          <FileText className="h-4 w-4" />
          Issued Certificates & Letters ({issuedLetters.length})
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={clsx(
            'flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition -mb-px',
            activeTab === 'templates'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          )}
        >
          <Award className="h-4 w-4" />
          Corporate Templates ({templates.length})
        </button>
      </div>

      {activeTab === 'issued' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by recipient name, title, or letter type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-900 dark:text-white"
            />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Letter Document</th>
                    <th className="px-6 py-4">Recipient</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Issue Date</th>
                    <th className="px-6 py-4">Authorized By</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Preview</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredLetters.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900 dark:text-white">{l.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">REF-LTR-#{l.id}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-800 dark:text-slate-200">{l.user_name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{l.user_id}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                          {l.letter_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">
                        {l.issue_date}
                      </td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                        {l.issued_by || 'David Chen'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          Issued & Valid
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setPreviewLetter(l)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Preview Letter"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((t) => (
            <div key={t.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
                  {t.type} Template
                </span>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mt-3">
                  {t.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-3 whitespace-pre-line">
                  {t.body_template}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-500">Corporate Standard</span>
                <button
                  onClick={() => {
                    setForm(prev => ({
                      ...prev,
                      letter_type: t.type,
                      title: t.title,
                      content: t.body_template
                    }));
                    setShowIssueModal(true);
                  }}
                  className="font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                >
                  Use Template →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Issue Official Employment Letter
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select recipient employee and customize body text.
            </p>

            <form onSubmit={handleIssueLetter} className="mt-4 space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Recipient Staff *</label>
                <select
                  value={form.user_id}
                  onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.first_name} {e.last_name} ({e.id}) — {e.designation}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Letter Type</label>
                  <select
                    value={form.letter_type}
                    onChange={(e) => setForm({ ...form, letter_type: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="Appointment">Appointment Letter</option>
                    <option value="Offer">Offer Letter</option>
                    <option value="Promotion">Promotion Letter</option>
                    <option value="Experience">Experience Certificate</option>
                    <option value="Relieving">Relieving Certificate</option>
                    <option value="NDA">NDA Agreement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Document Title</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Letter Body / Terms</label>
                <textarea
                  rows="4"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Enter specific salary terms, effective date, or formal certification language..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm bg-slate-900 dark:bg-teal-600 text-white font-semibold"
                >
                  Issue & Sign Letter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewLetter && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-8 border border-slate-200 dark:border-slate-800 shadow-xl max-h-[90vh] overflow-y-auto">
            {/* Letterhead */}
            <div className="border-b-2 border-slate-900 dark:border-teal-500 pb-4 flex justify-between items-center">
              <div>
                <h2 className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  INTELLIATTEND TECHNOLOGIES
                </h2>
                <p className="text-xs text-slate-500">Corporate Headquarters • Financial District, Hyderabad</p>
              </div>
              <Award className="h-8 w-8 text-teal-600" />
            </div>

            <div className="mt-6 space-y-4 text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Ref: REF-LTR-#{previewLetter.id}</span>
                <span>Date: {previewLetter.issue_date}</span>
              </div>

              <h3 className="font-display text-base font-bold text-center underline my-3">
                {previewLetter.title}
              </h3>

              <p>
                To,<br />
                <span className="font-bold">{previewLetter.user_name}</span><br />
                Employee ID: {previewLetter.user_id}
              </p>

              <p className="whitespace-pre-line py-2">
                {previewLetter.content || 'This certifies regular corporate employment and official standing in good standing with IntelliAttend Technologies.'}
              </p>

              <div className="pt-8 flex justify-between items-end border-t border-slate-100 dark:border-slate-800">
                <div>
                  <div className="font-serif italic text-lg text-slate-700 dark:text-slate-300">David Chen</div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">Director of Engineering & Operations</p>
                  <p className="text-[11px] text-slate-500">IntelliAttend Technologies Pvt Ltd</p>
                </div>
                <div className="w-16 h-16 rounded-full border border-teal-500/40 flex items-center justify-center text-[10px] font-bold text-teal-600 text-center uppercase p-1">
                  Corporate Seal
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setPreviewLetter(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-900 dark:bg-teal-600 text-white"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
