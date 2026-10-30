import { useState, useEffect } from 'react';
import {
  Shield, UserPlus, Users, CheckCircle2, XCircle, Search,
  Award, FileText, Trash2, KeyRound
} from 'lucide-react';
import clsx from 'clsx';
import api from '../../services/api';

export default function ManagerPayrollAdmins() {
  const [admins, setAdmins] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState('');
  const [canViewSalaries, setCanViewSalaries] = useState(true);
  const [canProcessInvoices, setCanProcessInvoices] = useState(true);

  const fetchData = async () => {
    try {
      const [adminRes, empRes] = await Promise.all([
        api.get('/manager/payroll-admins'),
        api.get('/manager/employees')
      ]);
      if (adminRes.data?.success) setAdmins(adminRes.data.data);
      if (empRes.data?.success) {
        setCandidates(empRes.data.data);
        if (empRes.data.data.length > 0) setSelectedUser(empRes.data.data[0].id);
      }
    } catch (err) {
      console.error('Error fetching payroll admins:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/manager/payroll-admins', {
        user_id: selectedUser,
        can_view_salaries: canViewSalaries,
        can_process_invoices: canProcessInvoices
      });
      if (res.data?.success) {
        setFeedback('Payroll administrator authority granted successfully!');
        setShowModal(false);
        fetchData();
        setTimeout(() => setFeedback(''), 4000);
      }
    } catch (err) {
      console.error('Error assigning admin:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Payroll Administrators Governance
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Delegate disbursal review, salary verification, and invoice processing authorizations to finance personnel.
          </p>
        </div>
        <div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-900 dark:bg-teal-600 text-white hover:bg-slate-800 transition shadow-sm"
          >
            <UserPlus className="h-4 w-4" />
            Assign Payroll Admin
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

      {/* Admins Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Administrator</th>
                <th className="px-6 py-4">Designation</th>
                <th className="px-6 py-4">Assigned Authority</th>
                <th className="px-6 py-4">Assigned By</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {admins.map((adm) => (
                <tr key={adm.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                        {adm.first_name ? adm.first_name[0] : 'P'}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white leading-tight">
                          {adm.first_name} {adm.last_name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{adm.user_id}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">
                    {adm.designation || 'Senior Payroll Specialist'}
                  </td>

                  <td className="px-6 py-4 space-y-1">
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold block">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Can Process Monthly Invoices
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 font-semibold block">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Full Compensation Visibility
                    </span>
                  </td>

                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    {adm.assigned_by || 'Executive Leadership'}
                  </td>

                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      Active Admin
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Authorize Payroll Administrator
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select an employee and grant administrative permissions for invoice runs.
            </p>

            <form onSubmit={handleAssign} className="mt-4 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Candidate *</label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  {candidates.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.first_name} {c.last_name} ({c.id}) — {c.department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canViewSalaries}
                    onChange={(e) => setCanViewSalaries(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Allow viewing confidential salary structures</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canProcessInvoices}
                    onChange={(e) => setCanProcessInvoices(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Allow generating & submitting payroll invoices</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm bg-slate-900 dark:bg-teal-600 text-white font-semibold"
                >
                  Authorize Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
