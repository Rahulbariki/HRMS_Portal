import { useState, useEffect } from 'react';
import {
  Newspaper, Plus, Pin, MessageSquare, Trash2, CheckCircle2,
  Calendar, User, Eye, Send, ArrowRight
} from 'lucide-react';
import clsx from 'clsx';
import api from '../../services/api';

export default function ManagerNews() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [activeCommentsNewsId, setActiveCommentsNewsId] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // Form
  const [form, setForm] = useState({
    title: '',
    category: 'Townhall',
    read_time: '3 min read',
    author: 'David Chen (Engineering Director)',
    pinned: false,
    summary: '',
    content: ''
  });

  const fetchNews = async () => {
    try {
      const res = await api.get('/announcements');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setAnnouncements(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/announcements', {
        ...form,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      });
      if (res.data?.success) {
        setFeedback(`Announcement "${form.title}" published to organization!`);
        setShowModal(false);
        setForm({
          title: '',
          category: 'Townhall',
          read_time: '3 min read',
          author: 'David Chen (Engineering Director)',
          pinned: false,
          summary: '',
          content: ''
        });
        fetchNews();
        setTimeout(() => setFeedback(''), 4000);
      }
    } catch (err) {
      console.error('Publishing error:', err);
    }
  };

  const handleOpenComments = async (newsId) => {
    setActiveCommentsNewsId(newsId);
    try {
      const res = await api.get(`/api/news/${newsId}/comments`);
      if (res.data?.success) {
        setComments(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !activeCommentsNewsId) return;
    try {
      const res = await api.post(`/api/news/${activeCommentsNewsId}/comments`, {
        comment: newComment,
        user_name: 'David Chen (Manager)',
        user_id: 'IA-MG-001'
      });
      if (res.data?.success) {
        setComments(prev => [...prev, res.data.data]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Company News & Circulars Governance
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Publish organization-wide townhall broadcasts, policy circulars, and team milestone updates.
          </p>
        </div>
        <div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-900 dark:bg-teal-600 text-white hover:bg-slate-800 transition shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Publish Announcement
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

      {/* Announcements Feed */}
      <div className="grid grid-cols-1 gap-5">
        {announcements.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
                  {item.category}
                </span>
                {item.pinned && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                    <Pin className="h-3 w-3" /> Pinned Bulletin
                  </span>
                )}
                <span className="text-xs text-slate-400">• {item.date}</span>
                <span className="text-xs text-slate-400">• {item.read_time}</span>
              </div>

              <button
                onClick={() => handleOpenComments(item.id)}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition"
              >
                <MessageSquare className="h-4 w-4" />
                Comments
              </button>
            </div>

            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mt-3">
              {item.title}
            </h3>

            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              {item.summary}
            </p>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-700 dark:text-slate-300">Published by:</span>
                <span>{item.author}</span>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                Broadcasted to All Staff
              </span>
            </div>

            {/* Comment Drawer if active */}
            {activeCommentsNewsId === item.id && (
              <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="font-semibold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Employee Discussion ({comments.length})
                </h4>

                <div className="space-y-2.5 max-h-48 overflow-y-auto">
                  {comments.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No comments yet. Start the conversation!</p>
                  ) : (
                    comments.map(c => (
                      <div key={c.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                        <div className="flex justify-between items-center font-semibold text-slate-800 dark:text-slate-200 mb-1">
                          <span>{c.user_name}</span>
                          <span className="text-[10px] text-slate-400">{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">{c.comment}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handlePostComment} className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Reply as David Chen (Manager)..."
                    className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-teal-600 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" /> Post
                  </button>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Publish Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Publish Corporate Announcement
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Broadcast circulars directly to the employee portal feed.
            </p>

            <form onSubmit={handleCreate} className="mt-4 space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Q4 2026 Global Townhall & Strategy Alignment"
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
                    <option value="Townhall">Townhall</option>
                    <option value="HR Updates">HR Updates</option>
                    <option value="Benefits">Benefits</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Culture">Culture</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Estimated Read Time</label>
                  <input
                    type="text"
                    value={form.read_time}
                    onChange={(e) => setForm({ ...form, read_time: e.target.value })}
                    placeholder="3 min read"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Summary *</label>
                <textarea
                  rows="2"
                  required
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  placeholder="Brief 1-2 sentence executive summary..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Detailed HTML Content</label>
                <textarea
                  rows="4"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="<p>Full announcement body details...</p>"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.pinned}
                    onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Pin to top of employee feed
                  </span>
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
                  Publish Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
