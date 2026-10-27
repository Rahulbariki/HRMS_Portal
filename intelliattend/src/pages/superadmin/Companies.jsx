import { useState, useEffect } from 'react';
import {
  Plus, Search, Filter, ExternalLink, Loader2,
  Building2, Trash2, CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';
import clsx from 'clsx';
import api from '../../services/api';

export default function SuperAdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [newCompany, setNewCompany] = useState({
    name: '',
    domain: '',
    plan: 'Enterprise Tier',
    adminEmail: 'clientadmin.intelliattend@gmail.com',
    employees: 100,
    managers: 8
  });

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await api.get('/companies');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setCompanies(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    if (!newCompany.name || !newCompany.adminEmail) return;

    try {
      setSubmitting(true);
      const res = await api.post('/companies', newCompany);
      if (res.data?.success) {
        setFeedback({ type: 'success', text: `Tenant "${newCompany.name}" onboarded successfully!` });
        setIsAddModalOpen(false);
        setNewCompany({
          name: '',
          domain: '',
          plan: 'Enterprise Tier',
          adminEmail: 'clientadmin.intelliattend@gmail.com',
          employees: 100,
          managers: 8
        });
        fetchCompanies();
      } else {
        setFeedback({ type: 'error', text: res.data?.message || 'Failed to create company' });
      }
    } catch (err) {
      console.error('Error creating company:', err);
      setFeedback({ type: 'error', text: 'Server error while creating company.' });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await api.patch(`/companies/${id}/status`, { status: nextStatus });
      if (res.data?.success) {
        setCompanies(prev => prev.map(c => c.id === id ? { ...c, status: nextStatus } : c));
        setFeedback({ type: 'success', text: `Company status updated to ${nextStatus}` });
      }
    } catch (err) {
      console.error('Error updating company status:', err);
      setFeedback({ type: 'error', text: 'Failed to update company status' });
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove tenant "${name}"?`)) return;
    try {
      const res = await api.delete(`/companies/${id}`);
      if (res.data?.success) {
        setCompanies(prev => prev.filter(c => c.id !== id));
        setFeedback({ type: 'success', text: `Company "${name}" removed.` });
      }
    } catch (err) {
      console.error('Error deleting company:', err);
      setFeedback({ type: 'error', text: 'Failed to delete company' });
    }
  };

  const filteredCompanies = companies.filter(c => {
    const matchesSearch =
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.domain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.adminEmail?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalUsers = companies.reduce((sum, c) => sum + Number(c.employees || 0), 0);
  const totalManagers = companies.reduce((sum, c) => sum + Number(c.managers || 0), 0);
  const activeCount = companies.filter(c => c.status === 'active').length;

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        <p className="text-xs font-semibold">Loading verified corporate tenants from Neon PostgreSQL...</p>
      </div>
    );
  }

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
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchCompanies()}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-md transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="h-4 w-4 text-teal-400" />
            <span>Add New Company</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={clsx(
            'p-4 rounded-xl border flex items-center justify-between text-xs font-semibold',
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          )}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="font-bold cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tenants</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{companies.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">Corporate databases</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Active Tenants</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{activeCount}</p>
          <p className="text-xs text-emerald-600/80 mt-0.5">{((activeCount / (companies.length || 1)) * 100).toFixed(0)}% operational</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Total Employees</p>
          <p className="text-2xl font-bold text-indigo-700 mt-1">{totalUsers.toLocaleString('en-IN')}</p>
          <p className="text-xs text-indigo-500 mt-0.5">Across all workspaces</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Managers Count</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalManagers.toLocaleString('en-IN')}</p>
          <p className="text-xs text-slate-400 mt-0.5">Supervisory hierarchy</p>
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
                <th className="px-6 py-3.5">Company & Domain</th>
                <th className="px-6 py-3.5">Plan Tier</th>
                <th className="px-6 py-3.5">Users & Hierarchy</th>
                <th className="px-6 py-3.5">Admin Email</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Joined Date</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400">
                    No corporate tenants match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-teal-300 flex items-center justify-center font-bold text-sm border border-slate-700">
                          {c.name ? c.name.slice(0, 2).toUpperCase() : 'CO'}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{c.name}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                            <span>{c.domain}</span>
                            <ExternalLink className="h-3 w-3 opacity-60" />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        'px-2.5 py-1 rounded-full text-xs font-bold',
                        c.plan?.includes('Enterprise') ? 'bg-purple-100 text-purple-700'
                          : c.plan?.includes('Professional') ? 'bg-blue-100 text-blue-700'
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
                      <span className="text-xs font-mono text-slate-600 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                        {c.adminEmail}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize',
                        c.status === 'active' ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      )}>
                        <span className={clsx(
                          'w-1.5 h-1.5 rounded-full',
                          c.status === 'active' ? 'bg-emerald-600' : 'bg-rose-600'
                        )} />
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {c.joinedDate || 'Recently Added'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => toggleStatus(c.id, c.status)}
                          className={clsx(
                            'text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer',
                            c.status === 'active'
                              ? 'text-rose-600 border-rose-200 hover:bg-rose-50'
                              : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                          )}
                        >
                          {c.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                          title="Delete Company"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">Onboard New Tenant</h3>
                <p className="text-xs text-slate-500">Create a dedicated enterprise workspace</p>
              </div>
            </div>

            <form onSubmit={handleCreateCompany} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  placeholder="e.g. Apex Global Corp"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Client Admin Email</label>
                <input
                  type="email"
                  required
                  value={newCompany.adminEmail}
                  onChange={(e) => setNewCompany({ ...newCompany, adminEmail: e.target.value })}
                  placeholder="clientadmin.intelliattend@gmail.com"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900"
                />
                <p className="text-[11px] text-slate-400 mt-1">Must be an authorized production account.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subscription Plan</label>
                  <select
                    value={newCompany.plan}
                    onChange={(e) => setNewCompany({ ...newCompany, plan: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
                  >
                    <option value="Starter Tier">Starter Tier</option>
                    <option value="Professional Tier">Professional Tier</option>
                    <option value="Enterprise Tier">Enterprise Tier</option>
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
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow disabled:opacity-50 cursor-pointer"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{submitting ? 'Creating...' : 'Create Tenant'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}