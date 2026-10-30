import { useState, useEffect } from 'react';
import {
  FileCheck, Plus, Search, Eye, Trash2, CheckCircle2,
  Calendar, Shield, Download, FileText, ArrowUpRight
} from 'lucide-react';
import clsx from 'clsx';
import api from '../../services/api';

const CATEGORIES = ['All', 'Conduct', 'Security', 'Leave', 'Workplace', 'General'];

export default function ManagerPolicies() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [feedback, setFeedback] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  // Form State
  const [form, setForm] = useState({
    title: '',
    category: 'Conduct',
    version: 'v1.0',
    description: '',
    content: ''
  });

  const fetchPolicies = async () => {
    try {
      const res = await api.get('/policies');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setPolicies(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching policies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/policies', form);
      if (res.data?.success) {
        setFeedback(`Policy "${form.title}" published successfully!`);
        setShowModal(false);
        setForm({ title: '', category: 'Conduct', version: 'v1.0', description: '', content: '' });
        fetchPolicies();
        setTimeout(() => setFeedback(''), 4000);
      }
    } catch (err) {
      console.error('Error creating policy:', err);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete policy "${title}"?`)) return;
    try {
      await api.delete(`/policies/${id}`);
      setFeedback(`Policy "${title}" removed.`);
      fetchPolicies();
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      console.error('Error deleting policy:', err);
    }
  };

  const filtered = policies.filter(p => {
    const matchesCategory = categoryFilter === 'All' || p.category.toLowerCase() === categoryFilter.toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.title.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      p.category.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Company Policies & Compliance Handbook
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Author statutory workplace guidelines, code of conduct, security protocols, and operational compliance rules.
          </p>
        </div>
        <div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-900 dark:bg-teal-600 text-white hover:bg-slate-800 transition shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Corporate Policy
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

      {/* Search & Categories */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search policies by keyword, title, or compliance terms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-900 dark:text-white"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Policy Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((pol) => (
          <div
            key={pol.id}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
                  {pol.category}
                </span>
                <span className="text-xs font-mono font-medium text-slate-400">
                  {pol.version || 'v1.0'}
                </span>
              </div>

              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mt-3">
                {pol.title}
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                {pol.description || pol.content}
              </p>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 flex justify-between">
                <span>Updated: {pol.last_updated || 'Oct 2026'}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Active & Binding</span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <button
                onClick={() => setSelectedPolicy(pol)}
                className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                <Eye className="h-3.5 w-3.5" /> Read Full Policy
              </button>
              <button
                onClick={() => handleDelete(pol.id, pol.title)}
                className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                title="Delete Policy"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Policy Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Add Corporate Policy Document
            </h3>
            <form onSubmit={handleCreate} className="mt-4 space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Policy Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Information Security & Device Access Policy"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="Conduct">Code of Conduct</option>
                    <option value="Security">Information Security</option>
                    <option value="Leave">Leave & Attendance</option>
                    <option value="Workplace">Workplace Health & Safety</option>
                    <option value="General">General Governance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Version</label>
                  <input
                    type="text"
                    value={form.version}
                    onChange={(e) => setForm({ ...form, version: e.target.value })}
                    placeholder="v1.0"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Brief Description</label>
                <textarea
                  rows="2"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Summary of the policy purpose and scope..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Policy Clauses & Content *</label>
                <textarea
                  rows="5"
                  required
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Enter full policy terms, guidelines, compliance clauses..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
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
                  Publish Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Read Policy Modal */}
      {selectedPolicy && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                  {selectedPolicy.category} • {selectedPolicy.version}
                </span>
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {selectedPolicy.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPolicy(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="mt-5 space-y-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {selectedPolicy.content || selectedPolicy.description}
            </div>

            <div className="mt-6 flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedPolicy(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-900 dark:bg-teal-600 text-white"
              >
                Close Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
