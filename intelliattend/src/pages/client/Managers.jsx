import { useState } from 'react';
import { Plus, Search, Mail, X } from 'lucide-react';

const INITIAL_MANAGERS = [
  {
    id: 1,
    name: 'David Chen',
    email: 'manager.intelliattend@gmail.com',
    department: 'Engineering',
    title: 'Lead Engineering & Delivery Director',
    directReports: 14,
    status: 'active',
    avatar: 'DC',
    joinedDate: 'Jan 2025',
  },
  {
    id: 2,
    name: 'Marcus Brody',
    email: 'marcus.brody@intelliattend.com',
    department: 'Product Management',
    title: 'VP of Product',
    directReports: 8,
    status: 'active',
    avatar: 'MB',
    joinedDate: 'Mar 2025',
  },
  {
    id: 3,
    name: 'Elena Rostova',
    email: 'elena.rostova@intelliattend.com',
    department: 'People & Culture',
    title: 'Lead Talent Manager',
    directReports: 6,
    status: 'active',
    avatar: 'ER',
    joinedDate: 'Jun 2024',
  },
  {
    id: 4,
    name: 'Samantha Lee',
    email: 'samantha.lee@intelliattend.com',
    department: 'Sales & Growth',
    title: 'Regional Sales Lead',
    directReports: 18,
    status: 'active',
    avatar: 'SL',
    joinedDate: 'Nov 2024',
  },
];

export default function ClientManagers() {
  const [managers, setManagers] = useState(INITIAL_MANAGERS);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newManager, setNewManager] = useState({
    name: '',
    email: '',
    department: 'Engineering',
    title: '',
    directReports: 5,
  });

  const filtered = managers.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.department.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
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
      title: newManager.title || 'Team Lead',
      directReports: Number(newManager.directReports) || 5,
      status: 'active',
      avatar: initials || 'MG',
      joinedDate: 'Oct 2026',
    };

    setManagers([created, ...managers]);
    setIsModalOpen(false);
    setNewManager({ name: '', email: '', department: 'Engineering', title: '', directReports: 5 });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">Managers & Department Heads</h1>
          <p className="text-sm text-slate-500 mt-1">Configure company hierarchy, manager assignments, and departmental leads</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-xs transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Assign New Manager</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Total Managers</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{managers.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Departments Covered</p>
          <p className="text-2xl font-bold text-teal-700 mt-1">
            {new Set(managers.map(m => m.department)).size}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Total Direct Reports</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {managers.reduce((sum, m) => sum + m.directReports, 0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-emerald-600">Active Status</p>
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
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-teal-300 font-bold flex items-center justify-center text-sm border border-teal-500/30 shadow-xs">
                {m.avatar}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900">{m.name}</h3>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full capitalize">
                    {m.status}
                  </span>
                </div>
                <p className="text-xs text-teal-700 font-medium">{m.title} • {m.department}</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{m.email}</span>
                </div>
                <div className="text-xs text-slate-500 pt-1">
                  Manages <strong className="text-slate-800">{m.directReports} direct reports</strong>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Manager Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-display text-lg font-bold text-slate-900">Add Manager</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
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
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  value={newManager.email}
                  onChange={(e) => setNewManager({ ...newManager, email: e.target.value })}
                  placeholder="j.miller@intelliattend.com"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900"
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
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
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
    </div>
  );
}