import { useState, useEffect } from 'react';
import {
  Users, UserPlus, Search, Filter, Shield, KeyRound, CheckCircle2,
  XCircle, ChevronRight, Download, Eye, ArrowUpRight, ArrowDownRight,
  Mail, Phone, Calendar, Briefcase, Building2, MapPin, Clock, Award
} from 'lucide-react';
import clsx from 'clsx';
import api from '../../services/api';

export default function ManagerEmployees() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [feedback, setFeedback] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: 'employee',
    department: 'Engineering',
    designation: 'Senior Software Engineer',
    phone: '',
    doj: new Date().toISOString().split('T')[0],
    shift: 'General Day (09:00 AM - 06:00 PM)',
    work_location: 'Corporate HQ, Hyderabad',
    annual_ctc: 900000
  });

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/manager/employees');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setEmployees(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeptsAndDesignations = async () => {
    try {
      const [deptRes, desRes] = await Promise.all([
        api.get('/manager/departments'),
        api.get('/manager/designations')
      ]);
      if (deptRes.data?.success) setDepartments(deptRes.data.data);
      if (desRes.data?.success) setDesignations(desRes.data.data);
    } catch (err) {
      console.error('Error loading metadata:', err);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchDeptsAndDesignations();
  }, []);

  const handleSuggestEmail = (first, last) => {
    if (!first || !last) return;
    const cleanFirst = first.toLowerCase().replace(/[^a-z]/g, '');
    const cleanLast = last.toLowerCase().replace(/[^a-z]/g, '');
    setFormData(prev => ({ ...prev, email: `${cleanFirst}.${cleanLast}@intelliattend.com` }));
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post('/manager/employees', formData);
      if (res.data?.success) {
        setFeedback(`Employee "${formData.first_name} ${formData.last_name}" created successfully!`);
        setShowAddModal(false);
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          role: 'employee',
          department: 'Engineering',
          designation: 'Senior Software Engineer',
          phone: '',
          doj: new Date().toISOString().split('T')[0],
          shift: 'General Day (09:00 AM - 06:00 PM)',
          work_location: 'Corporate HQ, Hyderabad',
          annual_ctc: 900000
        });
        fetchEmployees();
        setTimeout(() => setFeedback(''), 4000);
      }
    } catch (err) {
      console.error('Failed to create employee:', err);
      setFeedback('Error: Failed to register employee');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePromote = async (id, currentRole) => {
    try {
      const endpoint = currentRole === 'manager' ? `/manager/employees/${id}/demote` : `/manager/employees/${id}/promote`;
      const res = await api.put(endpoint);
      if (res.data?.success) {
        setFeedback(`Role updated successfully!`);
        fetchEmployees();
        setTimeout(() => setFeedback(''), 4000);
      }
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  const handleResetPassword = async (id, name) => {
    if (!window.confirm(`Reset password for ${name} to default "password123"?`)) return;
    try {
      const res = await api.put(`/manager/employees/${id}/reset-password`);
      if (res.data?.success) {
        setFeedback(`Password for ${name} reset to "password123"`);
        setTimeout(() => setFeedback(''), 4000);
      }
    } catch (err) {
      console.error('Failed to reset password:', err);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const res = await api.put(`/manager/employees/${id}`, {
        status: nextStatus,
        is_active: nextStatus === 'active'
      });
      if (res.data?.success) {
        setFeedback(`Employee status marked as ${nextStatus}`);
        fetchEmployees();
        setTimeout(() => setFeedback(''), 4000);
      }
    } catch (err) {
      console.error('Status change failed:', err);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Role', 'Department', 'Designation', 'Phone', 'DOJ', 'Status'];
    const rows = employees.map(e => [
      e.id,
      e.name,
      e.email,
      e.role,
      e.department || '',
      e.designation || '',
      e.phone || '',
      e.doj || '',
      e.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `employees_roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredEmployees = employees.filter(e => {
    const matchesSearch =
      (e.name && e.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.email && e.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.designation && e.designation.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDept = departmentFilter === 'all' || (e.department || '').toLowerCase() === departmentFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const totalCount = employees.length;
  const activeCount = employees.filter(e => e.status === 'active').length;
  const engineeringCount = employees.filter(e => (e.department || '').toLowerCase().includes('engineering')).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Employee Directory & Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Supervise personnel rosters, onboard staff, manage roles, and review compensation bands.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
          >
            <Download className="h-4 w-4" />
            Export Staff Roster
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-900 dark:bg-teal-600 text-white hover:bg-slate-800 transition shadow-sm"
          >
            <UserPlus className="h-4 w-4" />
            Add New Employee
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Personnel</p>
            <p className="font-display text-3xl font-bold text-slate-900 dark:text-white mt-1">{totalCount}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Corporate roster</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Staff</p>
            <p className="font-display text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{activeCount}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">In operational service</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Engineering Pod</p>
            <p className="font-display text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{engineeringCount}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Core technical engineers</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Briefcase className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Departments</p>
            <p className="font-display text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">{departments.length || 5}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Functional operational units</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Building2 className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, designation, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          >
            <option value="all">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Role & Designation</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Joining Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex justify-center items-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-teal-500 border-t-transparent"></div>
                      <span>Loading employee records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    No matching personnel found.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 flex-shrink-0">
                          {emp.first_name ? emp.first_name[0] : 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white leading-tight">
                            {emp.first_name} {emp.last_name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{emp.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{emp.designation}</p>
                      <span className={clsx(
                        'inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold mt-1',
                        emp.role === 'manager'
                          ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
                          : emp.role === 'payroll_admin'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                          : 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300'
                      )}>
                        {emp.role.toUpperCase()}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{emp.department || 'General'}</span>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        {emp.email}
                      </p>
                      {emp.phone && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          {emp.phone}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">
                      {emp.doj || '01-01-2026'}
                    </td>

                    <td className="px-6 py-4">
                      <span className={clsx(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
                        emp.status === 'active'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                      )}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {emp.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedEmployee(emp)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="View Profile Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handlePromote(emp.id, emp.role)}
                          className="p-1.5 text-purple-600 hover:text-purple-700 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/40 transition"
                          title={emp.role === 'manager' ? 'Demote to Employee' : 'Promote to Manager'}
                        >
                          {emp.role === 'manager' ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                        </button>

                        <button
                          onClick={() => handleResetPassword(emp.id, emp.name)}
                          className="p-1.5 text-amber-600 hover:text-amber-700 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/40 transition"
                          title="Reset Password"
                        >
                          <KeyRound className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleToggleActive(emp.id, emp.status)}
                          className={clsx(
                            'p-1.5 rounded-lg transition',
                            emp.status === 'active'
                              ? 'text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                              : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                          )}
                          title={emp.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          {emp.status === 'active' ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
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

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  Provision New Personnel
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Enter onboarding credentials, department, and salary band.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => {
                      setFormData({ ...formData, first_name: e.target.value });
                      handleSuggestEmail(e.target.value, formData.last_name);
                    }}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => {
                      setFormData({ ...formData, last_name: e.target.value });
                      handleSuggestEmail(formData.first_name, e.target.value);
                    }}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Corporate Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date of Joining</label>
                  <input
                    type="date"
                    value={formData.doj}
                    onChange={(e) => setFormData({ ...formData, doj: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Annual CTC (INR ₹)</label>
                  <input
                    type="number"
                    value={formData.annual_ctc}
                    onChange={(e) => setFormData({ ...formData, annual_ctc: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Work Shift</label>
                  <select
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                  >
                    <option value="General Day (09:00 AM - 06:00 PM)">General Day (09:00 AM - 06:00 PM)</option>
                    <option value="Executive Shift (09:30 AM - 06:30 PM)">Executive Shift (09:30 AM - 06:30 PM)</option>
                    <option value="Evening Operations (02:00 PM - 11:00 PM)">Evening Operations (02:00 PM - 11:00 PM)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-slate-900 dark:bg-teal-600 text-white hover:bg-slate-800 transition shadow-sm flex items-center gap-2"
                >
                  {actionLoading ? 'Creating Personnel...' : 'Create Employee Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Employee Details Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-lg">
                  {selectedEmployee.first_name ? selectedEmployee.first_name[0] : 'U'}
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    {selectedEmployee.first_name} {selectedEmployee.last_name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{selectedEmployee.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3 py-2 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">Designation</span>
                <span className="font-medium text-slate-900 dark:text-white">{selectedEmployee.designation}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 py-2 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">Department</span>
                <span className="font-medium text-slate-900 dark:text-white">{selectedEmployee.department}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 py-2 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">Corporate Email</span>
                <span className="font-medium text-slate-900 dark:text-white">{selectedEmployee.email}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 py-2 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">Work Shift</span>
                <span className="font-medium text-slate-900 dark:text-white">{selectedEmployee.shift || 'General Day'}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 py-2 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">Work Location</span>
                <span className="font-medium text-slate-900 dark:text-white">{selectedEmployee.work_location || 'Corporate HQ'}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 py-2 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">Annual CTC</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  ₹{Number(selectedEmployee.annual_ctc || 900000).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 py-2">
                <span className="text-slate-500">Employment Type</span>
                <span className="font-medium text-slate-900 dark:text-white">{selectedEmployee.employment_type || 'Full-Time Regular'}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-900 dark:bg-teal-600 text-white"
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

