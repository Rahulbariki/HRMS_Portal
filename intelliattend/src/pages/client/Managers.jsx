import { useState, useEffect } from 'react';
import { Plus, Search, Mail, X, Loader2, RefreshCw, UserCheck, Shield } from 'lucide-react';
import api from '../../services/api';

export default function ClientManagers() {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accessModalManager, setAccessModalManager] = useState(null);
  const [managerPerms, setManagerPerms] = useState({
    employees: true,
    departments: true,
    tasks: true,
    leaves: true,
    attendance: true,
    expenses: true,
    internal_expenses: true,
    income: true,
    employee_salaries: true,
    payroll_admins: true,
    letters: true,
    news: true,
    policies: true,
    offboarding: true
  });
  const [feedback, setFeedback] = useState('');
  const [newManager, setNewManager] = useState({
    name: '',
    email: '',
    department: 'Engineering',
    title: '',
    directReports: 5,
  });

  const fetchManagers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/directory');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        // Filter users who are managers or leaders
        const mgrs = res.data.data
          .filter(u => u.loginEmail === 'manager.intelliattend@gmail.com' || u.designation?.toLowerCase().includes('director') || u.designation?.toLowerCase().includes('lead') || u.designation?.toLowerCase().includes('manager'))
          .map(u => ({
            id: u.id,
            name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'David Chen',
            email: u.loginEmail || u.email,
            department: u.department || 'Engineering',
            title: u.designation || 'Lead Engineering & Delivery Director',
            directReports: 14,
            status: 'active',
            avatar: u.avatarUrl || null,
            initials: `${(u.firstName || 'D')[0]}${(u.lastName || 'C')[0]}`,
            joinedDate: u.doj || 'Jan 2025',
          }));
        setManagers(mgrs);
      }
    } catch (err) {
      console.error('Error fetching managers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  const filtered = managers.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.department?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddManager = (e) => {
    e.preventDefault();
    if (!newManager.name || !newManager.email) return;

    const initials = newManager.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const created = {
      id: Date.now(),
      name: newManager.name,
      email: newManager.email,
      department: newManager.department,
      title: newManager.title || 'Department Lead',
      directReports: Number(newManager.directReports) || 5,
      status: 'active',
      avatar: null,
      initials: initials || 'MG',
      joinedDate: 'Oct 2026',
    };

    setManagers([created, ...managers]);
    setIsModalOpen(false);
    setNewManager({ name: '', email: '', department: 'Engineering', title: '', directReports: 5 });
  };

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        <p className="text-xs font-semibold">Loading verified organizational leaders from Neon PostgreSQL...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">Managers & Department Heads</h1>
          <p className="text-sm text-slate-500 mt-1">Configure company hierarchy, manager assignments, and departmental leads</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchManagers()}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-xs transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Assign New Manager</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Managers</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{managers.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Departments Covered</p>
          <p className="text-2xl font-bold text-teal-700 mt-1">
            {new Set(managers.map(m => m.department)).size}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Direct Reports</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {managers.reduce((sum, m) => sum + Number(m.directReports || 0), 0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Active Status</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">100%</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by manager name, department or email..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900"
          />
        </div>
      </div>

      {/* Managers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((m) => (
          <div key={m.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-teal-300 font-bold flex items-center justify-center text-sm border border-teal-500/30 shadow-xs overflow-hidden">
                {m.avatar ? (
                  <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
                ) : (
                  m.initials
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900">{m.name}</h3>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full capitalize">
                    {m.status}
                  </span>
                </div>
                <p className="text-xs text-teal-700 font-medium">{m.title} • {m.department}</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1 font-mono">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{m.email}</span>
                </div>
                <div className="text-xs text-slate-500 pt-1">
                  Manages <strong className="text-slate-800">{m.directReports} direct reports</strong>
                </div>
              </div>
            </div>

            <div>
              <button
                onClick={() => {
                  setAccessModalManager(m);
                  api.get(`/client/managers/${m.id || 'IA-MG-001'}/access`)
                    .then(res => {
                      if (res.data?.success && res.data.data) {
                        setManagerPerms(prev => ({ ...prev, ...res.data.data }));
                      }
                    })
                    .catch(() => {});
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition"
                title="Manage Module Access"
              >
                <Shield className="h-3.5 w-3.5 text-teal-600" />
                Access
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Manager Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-display text-lg font-bold text-slate-900">Add Manager</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddManager} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newManager.name}
                  onChange={(e) => setNewManager({ ...newManager, name: e.target.value })}
                  placeholder="e.g. Jordan Miller"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  value={newManager.email}
                  onChange={(e) => setNewManager({ ...newManager, email: e.target.value })}
                  placeholder="manager.intelliattend@gmail.com"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={newManager.department}
                    onChange={(e) => setNewManager({ ...newManager, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900 bg-white"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product Management">Product</option>
                    <option value="Sales & Growth">Sales</option>
                    <option value="People & Culture">HR / People</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Direct Reports</label>
                  <input
                    type="number"
                    value={newManager.directReports}
                    onChange={(e) => setNewManager({ ...newManager, directReports: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title</label>
                <input
                  type="text"
                  value={newManager.title}
                  onChange={(e) => setNewManager({ ...newManager, title: e.target.value })}
                  placeholder="e.g. Engineering Manager"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-xs cursor-pointer"
                >
                  Save Manager
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Access Control Modal */}
      {accessModalManager && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-0 zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Manager Permissions: {accessModalManager.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Granularly configure accessible tabs and supervisory actions.
                </p>
              </div>
              <button onClick={() => setAccessModalManager(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 py-2 text-sm">
              {[
                { key: 'employees', label: 'Employee Directory & Promotion Governance' },
                { key: 'departments', label: 'Departments & Designations Management' },
                { key: 'tasks', label: 'Task Assignments & Sprint Monitoring' },
                { key: 'leaves', label: 'Leave Reviews & Quota Allocation' },
                { key: 'attendance', label: 'Attendance Logs & Regularization Approvals' },
                { key: 'expenses', label: 'Employee Reimbursement Claim Approvals' },
                { key: 'internal_expenses', label: 'Company Internal Operational Expenses' },
                { key: 'income', label: 'Client Revenue & Inward Remittances' },
                { key: 'employee_salaries', label: 'Compensation Structures & Band Governance' },
                { key: 'payroll_admins', label: 'Payroll Admin Role Assignments' },
                { key: 'letters', label: 'Official Letter Generation & Sign-offs' },
                { key: 'news', label: 'Publish Announcements & Moderate Comments' },
                { key: 'policies', label: 'Company Policies Handbook Publishing' },
                { key: 'offboarding', label: 'Resignation Approvals & Relieving Letters' }
              ].map(p => (
                <label key={p.key} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 cursor-pointer">
                  <span className="text-xs font-medium text-slate-800">{p.label}</span>
                  <input
                    type="checkbox"
                    checked={Boolean(managerPerms[p.key])}
                    onChange={(e) => setManagerPerms({ ...managerPerms, [p.key]: e.target.checked })}
                    className="h-4 w-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
              <button
                type="button"
                onClick={() => setAccessModalManager(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await api.put(`/client/managers/${accessModalManager.id || 'IA-MG-001'}/access`, {
                      permissions: managerPerms
                    });
                    setAccessModalManager(null);
                  } catch (err) {
                    console.error('Error updating access:', err);
                  }
                }}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-xs cursor-pointer"
              >
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}