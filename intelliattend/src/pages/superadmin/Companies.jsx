import { useState } from 'react';
import { Plus, Search, Filter, ExternalLink } from 'lucide-react';
import clsx from 'clsx';

const INITIAL_COMPANIES = [
  {
    id: 1,
    name: 'Acme Enterprise',
    domain: 'acme.hrms.portal',
    plan: 'Enterprise',
    employees: 480,
    managers: 32,
    status: 'active',
    joinedDate: 'Jan 15, 2025',
    adminEmail: 'client@company.com',
  },
  {
    id: 2,
    name: 'Global Tech Corp',
    domain: 'globaltech.hrms.portal',
    plan: 'Growth',
    employees: 195,
    managers: 14,
    status: 'active',
    joinedDate: 'Mar 02, 2025',
    adminEmail: 'hr@globaltech.com',
  },
  {
    id: 3,
    name: 'Nexus Dynamics',
    domain: 'nexus.hrms.portal',
    plan: 'Starter',
    employees: 45,
    managers: 4,
    status: 'trial',
    joinedDate: 'Oct 10, 2026',
    adminEmail: 'contact@nexusdyn.io',
  },
  {
    id: 4,
    name: 'Pinnacle Labs',
    domain: 'pinnacle.hrms.portal',
    plan: 'Enterprise',
    employees: 620,
    managers: 48,
    status: 'active',
    joinedDate: 'Jun 22, 2024',
    adminEmail: 'admin@pinnaclelabs.com',
  },
  {
    id: 5,
    name: 'Vanguard Retail Ltd',
    domain: 'vanguard.hrms.portal',
    plan: 'Growth',
    employees: 310,
    managers: 20,
    status: 'suspended',
    joinedDate: 'Dec 05, 2024',
    adminEmail: 'hr@vanguardretail.com',
  },
];

export default function SuperAdminCompanies() {
  const [companies, setCompanies] = useState(INITIAL_COMPANIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '',
    domain: '',
    plan: 'Growth',
    adminEmail: '',
    employees: 50,
  });

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.adminEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateCompany = (e) => {
    e.preventDefault();
    if (!newCompany.name) return;

    const created = {
      id: Date.now(),
      name: newCompany.name,
      domain: newCompany.domain || `${newCompany.name.toLowerCase().replace(/\s+/g, '')}.hrms.portal`,
      plan: newCompany.plan,
      employees: Number(newCompany.employees) || 20,
      managers: Math.max(1, Math.round(Number(newCompany.employees) / 10)),
      status: 'active',
      joinedDate: 'Just now',
      adminEmail: newCompany.adminEmail || `admin@${newCompany.name.toLowerCase().replace(/\s+/g, '')}.com`,
    };

    setCompanies([created, ...companies]);
    setIsAddModalOpen(false);
    setNewCompany({ name: '', domain: '', plan: 'Growth', adminEmail: '', employees: 50 });
  };

  const toggleStatus = (id) => {
    setCompanies(companies.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: c.status === 'active' ? 'suspended' : 'active',
        };
      }
      return c;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">Companies Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Oversee tenant organizations, employee limits, and subscription tiers
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 text-teal-400" />
          <span>Add New Company</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Total Tenants</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{companies.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-emerald-600">Active Companies</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">
            {companies.filter(c => c.status === 'active').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-amber-600">Trial Period</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">
            {companies.filter(c => c.status === 'trial').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Total Managed Users</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {companies.reduce((sum, c) => sum + c.employees, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company, domain or email..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="trial">Trial Only</option>
            <option value="suspended">Suspended Only</option>
          </select>
        </div>
      </div>

      {/* Companies Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Company</th>
                <th className="px-6 py-3.5">Plan</th>
                <th className="px-6 py-3.5">Users & Managers</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Joined Date</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400">
                    No companies match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-teal-300 flex items-center justify-center font-bold text-sm border border-slate-700">
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{c.name}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-1">
                            <span>{c.domain}</span>
                            <ExternalLink className="h-3 w-3 opacity-60" />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        'px-2.5 py-1 rounded-full text-xs font-bold',
                        c.plan === 'Enterprise' ? 'bg-purple-100 text-purple-700'
                          : c.plan === 'Growth' ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-700'
                      )}>
                        {c.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-800 font-semibold">{c.employees} Employees</div>
                      <div className="text-xs text-slate-400">{c.managers} Managers</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize',
                        c.status === 'active' ? 'bg-emerald-100 text-emerald-800'
                          : c.status === 'trial' ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      )}>
                        <span className={clsx(
                          'w-1.5 h-1.5 rounded-full',
                          c.status === 'active' ? 'bg-emerald-600'
                            : c.status === 'trial' ? 'bg-amber-600'
                            : 'bg-rose-600'
                        )} />
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {c.joinedDate}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => toggleStatus(c.id)}
                        className={clsx(
                          'text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all',
                          c.status === 'active'
                            ? 'text-rose-600 border-rose-200 hover:bg-rose-50'
                            : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                        )}
                      >
                        {c.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Company Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-0 zoom-in-95">
            <h3 className="font-display text-lg font-bold text-slate-900 mb-1">Onboard New Company</h3>
            <p className="text-xs text-slate-500 mb-5">Create a dedicated enterprise tenant workspace</p>

            <form onSubmit={handleCreateCompany} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  placeholder="e.g. Apex Global Corp"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Email</label>
                <input
                  type="email"
                  required
                  value={newCompany.adminEmail}
                  onChange={(e) => setNewCompany({ ...newCompany, adminEmail: e.target.value })}
                  placeholder="admin@company.com"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subscription Plan</label>
                  <select
                    value={newCompany.plan}
                    onChange={(e) => setNewCompany({ ...newCompany, plan: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
                  >
                    <option value="Starter">Starter (up to 50)</option>
                    <option value="Growth">Growth (up to 300)</option>
                    <option value="Enterprise">Enterprise (unlimited)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Employees</label>
                  <input
                    type="number"
                    value={newCompany.employees}
                    onChange={(e) => setNewCompany({ ...newCompany, employees: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow"
                >
                  Create Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}