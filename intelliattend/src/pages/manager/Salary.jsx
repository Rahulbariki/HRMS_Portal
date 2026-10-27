import { useState, useEffect } from 'react';
import {
  IndianRupee, Users, CreditCard, CheckCircle2,
  AlertCircle, Search, Filter, Loader2, ArrowUpRight,
  ShieldCheck, Banknote, Calendar, RefreshCw, Send, X, Eye
} from 'lucide-react';
import clsx from 'clsx';
import api from '../../services/api';

export default function ManagerSalary() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [selectedMember, setSelectedMember] = useState(null);
  const [disbursing, setDisbursing] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [disburseMonth, setDisburseMonth] = useState('October 2026');
  const [showDisburseModal, setShowDisburseModal] = useState(false);

  const fetchTeamSalaries = async () => {
    try {
      setLoading(true);
      const res = await api.get('/salary/team');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setTeam(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching team salary roster:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamSalaries();
  }, []);

  const handleDisbursePayroll = async () => {
    try {
      setDisbursing(true);
      const res = await api.post('/salary/disburse', {
        month: disburseMonth,
        payDate: new Date().toISOString().split('T')[0]
      });

      if (res.data?.success) {
        setStatusMessage({
          type: 'success',
          text: res.data.message || `Payroll for ${disburseMonth} processed successfully.`
        });
        setShowDisburseModal(false);
        fetchTeamSalaries();
      } else {
        setStatusMessage({
          type: 'error',
          text: res.data?.message || 'Payroll disbursal failed.'
        });
      }
    } catch (err) {
      console.error('Disbursal error:', err);
      setStatusMessage({
        type: 'error',
        text: 'Network error processing payroll disbursal.'
      });
    } finally {
      setDisbursing(false);
    }
  };

  const filteredTeam = team.filter((member) => {
    const matchesSearch =
      member.name?.toLowerCase().includes(search.toLowerCase()) ||
      member.role?.toLowerCase().includes(search.toLowerCase()) ||
      member.id?.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === 'all' || member.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const totalMonthlyGross = team.reduce((acc, m) => acc + Number(m.monthlyGross || 0), 0);
  const totalMonthlyNet = team.reduce((acc, m) => acc + Number(m.monthlyNet || 0), 0);
  const totalAnnualCtc = team.reduce((acc, m) => acc + Number(m.annualCtc || 0), 0);
  const departments = Array.from(new Set(team.map((m) => m.department).filter(Boolean)));

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        <p className="text-xs font-semibold">Loading verified payroll roster from Neon PostgreSQL...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">Team Payroll & Compensation</h1>
          <p className="text-sm text-slate-500 mt-1">
            Departmental salary governance, statutory CTC distribution, and monthly payroll disbursal
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchTeamSalaries()}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
            title="Refresh Roster"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowDisburseModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-md shadow-teal-600/20 transition-all cursor-pointer"
          >
            <Banknote className="h-4 w-4" />
            <span>Disburse Monthly Payroll</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={clsx(
            'p-4 rounded-xl border flex items-center justify-between text-xs font-semibold',
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          )}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="font-bold cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Monthly Outlay</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold font-mono text-slate-900">
            ₹{totalMonthlyNet.toLocaleString('en-IN')}
          </p>
          <p className="mt-1 text-xs text-slate-500">Gross: ₹{totalMonthlyGross.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Annual CTC Budget</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold font-mono text-indigo-600">
            ₹{totalAnnualCtc.toLocaleString('en-IN')}
          </p>
          <p className="mt-1 text-xs text-slate-500">Total verified team CTC</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Headcount on Payroll</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold font-mono text-slate-900">{team.length}</p>
          <p className="mt-1 text-xs text-emerald-600 font-medium">100% KYC & Bank linked</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Payroll Cycle</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-lg font-bold text-slate-900">Monthly (Last Day)</p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>NEFT / RTGS Configured</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID or role..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-600">Dept:</span>
          </div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Team Payroll Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Employee</th>
                <th className="py-3.5 px-6">Department & Role</th>
                <th className="py-3.5 px-6">Band</th>
                <th className="py-3.5 px-6">Annual CTC</th>
                <th className="py-3.5 px-6">Monthly Net</th>
                <th className="py-3.5 px-6">Bank Account</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTeam.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No employee records match the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTeam.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center font-bold text-xs text-slate-700 border border-slate-200">
                          {member.avatar ? (
                            <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                          ) : (
                            member.name?.charAt(0) || 'U'
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{member.name}</p>
                          <p className="text-xs text-slate-400 font-mono">{member.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-slate-800 font-medium">{member.role}</p>
                      <p className="text-xs text-slate-400">{member.department}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {member.salaryBand}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono font-semibold text-slate-900">
                      ₹{Number(member.annualCtc || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-teal-600">
                      ₹{Number(member.monthlyNet || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-500">
                      {member.bankAccount}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedMember(member)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-teal-500 hover:text-teal-600 text-xs font-semibold text-slate-700 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Breakup</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disburse Payroll Modal */}
      {showDisburseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Disburse Team Payroll</h3>
                  <p className="text-xs text-slate-500">Batch generate payslips and trigger bank transfers</p>
                </div>
              </div>
              <button
                onClick={() => setShowDisburseModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Payroll Month / Period
                </label>
                <select
                  value={disburseMonth}
                  onChange={(e) => setDisburseMonth(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                >
                  <option value="October 2026">October 2026</option>
                  <option value="November 2026">November 2026</option>
                  <option value="December 2026">December 2026</option>
                </select>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Eligible Employees:</span>
                  <span className="font-bold text-slate-800">{team.length}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Total Net Disbursal:</span>
                  <span className="font-bold font-mono text-teal-700">
                    ₹{totalMonthlyNet.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Statutory Deductions (EPF + TDS):</span>
                  <span className="font-bold font-mono text-slate-800">
                    ₹{(totalMonthlyGross - totalMonthlyNet).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                Notice: Disbursal will automatically credit verified bank accounts and generate verifiable monthly payslips for all eligible personnel.
              </p>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDisburseModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDisbursePayroll}
                disabled={disbursing}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-md shadow-teal-600/20 disabled:opacity-50 transition cursor-pointer"
              >
                {disbursing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Disbursal...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Confirm & Disburse</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Salary Breakup Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">{selectedMember.name}</h3>
                <p className="text-xs text-slate-500">{selectedMember.role} • {selectedMember.department}</p>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="text-xs text-slate-400 font-medium">Annual CTC</span>
                  <p className="text-lg font-bold font-mono text-slate-900">
                    ₹{Number(selectedMember.annualCtc || 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium">Monthly Take-Home</span>
                  <p className="text-lg font-bold font-mono text-teal-600">
                    ₹{Number(selectedMember.monthlyNet || 0).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Salary Band:</span>
                  <span className="font-semibold text-slate-800">{selectedMember.salaryBand}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Bank Account No:</span>
                  <span className="font-mono font-semibold text-slate-800">{selectedMember.bankAccount}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Monthly Gross:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    ₹{Number(selectedMember.monthlyGross || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Monthly Deductions (PF/TDS/PT):</span>
                  <span className="font-mono font-semibold text-rose-600">
                    -₹{(Number(selectedMember.monthlyGross || 0) - Number(selectedMember.monthlyNet || 0)).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-600">Payment Status:</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active & Verified</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}