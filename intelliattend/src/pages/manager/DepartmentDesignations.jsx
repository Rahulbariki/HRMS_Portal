import { useState, useEffect } from 'react';
import {
  Building2, Briefcase, Plus, Search, Edit2, Trash2, CheckCircle2,
  XCircle, Users, Award, Shield, ChevronRight, Layers
} from 'lucide-react';
import clsx from 'clsx';
import api from '../../services/api';

export default function ManagerDepartmentDesignations() {
  const [activeTab, setActiveTab] = useState('departments');
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState('');

  // Modals
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showDesModal, setShowDesModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Forms
  const [deptForm, setDeptForm] = useState({ name: '', code: '', head_name: '', description: '' });
  const [desForm, setDesForm] = useState({ title: '', department: 'Engineering', level: 'Mid-Level', description: '' });

  const fetchData = async () => {
    try {
      const [deptRes, desRes] = await Promise.all([
        api.get('/manager/departments'),
        api.get('/manager/designations')
      ]);
      if (deptRes.data?.success) setDepartments(deptRes.data.data);
      if (desRes.data?.success) setDesignations(desRes.data.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveDept = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/manager/departments/${editingItem.id}`, deptForm);
        setFeedback(`Department "${deptForm.name}" updated successfully!`);
      } else {
        await api.post('/manager/departments', deptForm);
        setFeedback(`Department "${deptForm.name}" created successfully!`);
      }
      setShowDeptModal(false);
      setEditingItem(null);
      setDeptForm({ name: '', code: '', head_name: '', description: '' });
      fetchData();
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      console.error('Error saving department:', err);
    }
  };

  const handleSaveDes = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/manager/designations/${editingItem.id}`, desForm);
        setFeedback(`Designation "${desForm.title}" updated successfully!`);
      } else {
        await api.post('/manager/designations', desForm);
        setFeedback(`Designation "${desForm.title}" created successfully!`);
      }
      setShowDesModal(false);
      setEditingItem(null);
      setDesForm({ title: '', department: 'Engineering', level: 'Mid-Level', description: '' });
      fetchData();
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      console.error('Error saving designation:', err);
    }
  };

  const handleToggleDept = async (id) => {
    try {
      await api.put(`/manager/departments/${id}/toggle`);
      fetchData();
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const handleToggleDes = async (id) => {
    try {
      await api.put(`/manager/designations/${id}/toggle`);
      fetchData();
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const handleDeleteDept = async (id, name) => {
    if (!window.confirm(`Delete department "${name}"?`)) return;
    try {
      await api.delete(`/manager/departments/${id}`);
      setFeedback(`Department "${name}" deleted.`);
      fetchData();
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleDeleteDes = async (id, title) => {
    if (!window.confirm(`Delete designation "${title}"?`)) return;
    try {
      await api.delete(`/manager/designations/${id}`);
      setFeedback(`Designation "${title}" deleted.`);
      fetchData();
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const filteredDepts = departments.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.code && d.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (d.head_name && d.head_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredDesignations = designations.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.department && d.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (d.level && d.level.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Departments & Role Architecture
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organize business functions, operational pods, managerial hierarchy, and job designations.
          </p>
        </div>
        <div>
          {activeTab === 'departments' ? (
            <button
              onClick={() => {
                setEditingItem(null);
                setDeptForm({ name: '', code: '', head_name: '', description: '' });
                setShowDeptModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-900 dark:bg-teal-600 text-white hover:bg-slate-800 transition shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add Department
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingItem(null);
                setDesForm({ title: '', department: departments[0]?.name || 'Engineering', level: 'Mid-Level', description: '' });
                setShowDesModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-900 dark:bg-teal-600 text-white hover:bg-slate-800 transition shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add Designation
            </button>
          )}
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
          onClick={() => { setActiveTab('departments'); setSearchQuery(''); }}
          className={clsx(
            'flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition -mb-px',
            activeTab === 'departments'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          )}
        >
          <Building2 className="h-4 w-4" />
          Departments ({departments.length})
        </button>
        <button
          onClick={() => { setActiveTab('designations'); setSearchQuery(''); }}
          className={clsx(
            'flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition -mb-px',
            activeTab === 'designations'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          )}
        >
          <Briefcase className="h-4 w-4" />
          Designations & Levels ({designations.length})
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder={activeTab === 'departments' ? 'Search departments by name, code, or lead...' : 'Search designations by title, level, or department...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-900 dark:text-white"
        />
      </div>

      {/* DEPARTMENTS TAB CONTENT */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDepts.map((d) => (
            <div
              key={d.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                    {d.code || d.name.substring(0, 3).toUpperCase()}
                  </div>
                  <span className={clsx(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
                    d.status === 'active'
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  )}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    {d.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mt-4">{d.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {d.description || 'Core organizational business division.'}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>Head of Department:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{d.head_name || 'Unassigned'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>Assigned Staff:</span>
                    <span className="font-semibold text-teal-600 dark:text-teal-400">{d.employee_count || 0} Employees</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => handleToggleDept(d.id)}
                  className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  {d.status === 'active' ? 'Disable' : 'Enable'}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingItem(d);
                      setDeptForm({ name: d.name, code: d.code, head_name: d.head_name, description: d.description });
                      setShowDeptModal(true);
                    }}
                    className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDept(d.id, d.name)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DESIGNATIONS TAB CONTENT */}
      {activeTab === 'designations' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Designation Title</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Seniority Band</th>
                  <th className="px-6 py-4">Active Staff</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredDesignations.map((des) => (
                  <tr key={des.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                      {des.title}
                    </td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                      {des.department}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                        {des.level || 'Mid-Level'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-teal-600 dark:text-teal-400 font-semibold">
                      {des.employee_count || 0} Staff
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
                        des.status === 'active'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      )}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {des.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingItem(des);
                            setDesForm({ title: des.title, department: des.department, level: des.level, description: des.description });
                            setShowDesModal(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDes(des.id, des.title)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Department Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              {editingItem ? 'Edit Department' : 'Create Department'}
            </h3>
            <form onSubmit={handleSaveDept} className="mt-4 space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  placeholder="e.g. Artificial Intelligence Pod"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Department Code</label>
                <input
                  type="text"
                  value={deptForm.code}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                  placeholder="e.g. AIP"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Head of Department</label>
                <input
                  type="text"
                  value={deptForm.head_name}
                  onChange={(e) => setDeptForm({ ...deptForm, head_name: e.target.value })}
                  placeholder="e.g. David Chen"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={deptForm.description}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowDeptModal(false)}
                  className="px-4 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm bg-slate-900 dark:bg-teal-600 text-white font-semibold"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Designation Modal */}
      {showDesModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              {editingItem ? 'Edit Designation' : 'Create Designation'}
            </h3>
            <form onSubmit={handleSaveDes} className="mt-4 space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Designation Title *</label>
                <input
                  type="text"
                  required
                  value={desForm.title}
                  onChange={(e) => setDesForm({ ...desForm, title: e.target.value })}
                  placeholder="e.g. Principal Architect"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                <select
                  value={desForm.department}
                  onChange={(e) => setDesForm({ ...desForm, department: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Seniority Band</label>
                <select
                  value={desForm.level}
                  onChange={(e) => setDesForm({ ...desForm, level: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="Associate Level">Associate Level (L1-L2)</option>
                  <option value="Mid-Level">Mid-Level (L3)</option>
                  <option value="Senior Level">Senior Level (L4)</option>
                  <option value="Lead Level">Lead Level (L5)</option>
                  <option value="Executive Level">Executive Leadership</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowDesModal(false)}
                  className="px-4 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm bg-slate-900 dark:bg-teal-600 text-white font-semibold"
                >
                  Save Designation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

