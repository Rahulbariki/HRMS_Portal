import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Laptop, 
  CreditCard, 
  Briefcase, 
  ShieldCheck,
  Search,
  Filter,
  Check,
  X
} from 'lucide-react';

export default function ManagerOffboarding() {
  const [activeTab, setActiveTab] = useState('in_progress');
  const [searchTerm, setSearchTerm] = useState('');
  const [exitRequests, setExitRequests] = useState([
    {
      id: 'SEP-2026-004',
      employeeName: 'Priya Sharma',
      email: 'employee.intelliattend@gmail.com',
      role: 'Senior Software Engineer',
      department: 'Engineering',
      resignationDate: '2026-10-15',
      proposedLwd: '2026-12-14',
      status: 'Under Clearance',
      reason: 'Career Growth & New Opportunities',
      ktSignoff: false,
      hardwareReturned: false,
      financeNoDues: true
    }
  ]);

  const toggleStatus = (id, field) => {
    setExitRequests(prev => prev.map(req => {
      if (req.id === id) {
        return { ...req, [field]: !req[field] };
      }
      return req;
    }));
  };

  const handleApproveClearance = (id) => {
    alert(`Separation clearance for ${id} has been verified and forwarded to HR Operations for Final Settlement.`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <Briefcase className="w-6 h-6" />
            </span>
            Team Separation & Exit Governance
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review departmental resignation notices, authorize knowledge transfer (KT) milestones, and verify no-dues signoffs
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Separations</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">1</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending KT Signoffs</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">1</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Completed This FY</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">0</p>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('in_progress')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'in_progress'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Active Separations (1)
            </button>
            <button
              onClick={() => setActiveTab('archive')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'archive'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Archived (0)
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-5">Separation ID & Candidate</th>
                <th className="py-3.5 px-5">Dates (Resigned / LWD)</th>
                <th className="py-3.5 px-5">Reason</th>
                <th className="py-3.5 px-5">KT Milestone Signoff</th>
                <th className="py-3.5 px-5">Asset Handover</th>
                <th className="py-3.5 px-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {exitRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                  <td className="py-4 px-5">
                    <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold">{req.id}</span>
                    <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{req.employeeName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{req.email}</p>
                  </td>
                  <td className="py-4 px-5 text-xs text-slate-600 dark:text-slate-300">
                    <div><span className="text-slate-400">Notice:</span> {req.resignationDate}</div>
                    <div className="font-semibold text-rose-600 dark:text-rose-400 mt-1"><span className="text-slate-400">LWD:</span> {req.proposedLwd}</div>
                  </td>
                  <td className="py-4 px-5 text-xs text-slate-600 dark:text-slate-300">
                    {req.reason}
                  </td>
                  <td className="py-4 px-5">
                    <button
                      onClick={() => toggleStatus(req.id, 'ktSignoff')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                        req.ktSignoff
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {req.ktSignoff ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                      {req.ktSignoff ? 'KT Signed Off' : 'Pending KT'}
                    </button>
                  </td>
                  <td className="py-4 px-5">
                    <button
                      onClick={() => toggleStatus(req.id, 'hardwareReturned')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                        req.hardwareReturned
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {req.hardwareReturned ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                      {req.hardwareReturned ? 'Hardware Received' : 'Hardware In-Custody'}
                    </button>
                  </td>
                  <td className="py-4 px-5">
                    <button
                      onClick={() => handleApproveClearance(req.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition shadow-sm"
                    >
                      Certify Clearances
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