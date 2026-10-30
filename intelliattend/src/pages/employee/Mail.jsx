import { useState, useMemo, useEffect } from 'react';
import {
  Search, Mail as MailIcon, PenSquare, Inbox, Star, Send, Trash2,
  Paperclip, ArrowLeft, Reply, CheckSquare, Square, RefreshCw, X,
  Clock, CheckCircle2, User, ChevronRight, CornerDownLeft, FileText,
  Forward, RotateCcw, AlertCircle, Sparkles, Filter, Check, Tag
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const EMAIL_LABELS = ['General', 'Corporate', 'Urgent', 'Announcement', 'Project'];

export default function EmployeeMail() {
  const { user } = useAuth();
  const [emails, setEmails] = useState([]);
  const [activeFolder, setActiveFolder] = useState('inbox'); // 'inbox' | 'starred' | 'sent' | 'drafts' | 'trash'
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('all');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Compose form state
  const [composeDraftId, setComposeDraftId] = useState(null);
  const [composeTo, setComposeTo] = useState('');
  const [composeCc, setComposeCc] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeLabel, setComposeLabel] = useState('General');
  const [includeSignature, setIncludeSignature] = useState(true);
  const [colleagues, setColleagues] = useState([]);
  const [attachedFiles, setAttachedFiles] = useState([]);

  // Inline Quick Reply state (at bottom of email detail view)
  const [inlineReplyText, setInlineReplyText] = useState('');
  const [isSendingInline, setIsSendingInline] = useState(false);

  // Fetch emails from server
  const fetchEmails = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setIsRefreshing(true);

      const userEmail = (user?.email || '').toLowerCase().trim();
      const res = await api.get(`/mail/emails?folder=${activeFolder}&userEmail=${encodeURIComponent(userEmail)}`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        const mapped = res.data.data.map(m => ({
          id: m.id,
          sender: m.sender_name || 'Corporate Staff',
          senderEmail: m.sender_email || '',
          senderInitial: m.sender_initial || (m.sender_name ? m.sender_name.slice(0, 2).toUpperCase() : 'HR'),
          recipientEmail: m.recipient_email || '',
          cc: m.cc || '',
          isSystem: Boolean(m.is_system),
          subject: m.subject || '(No subject)',
          snippet: m.snippet || (m.body ? m.body.slice(0, 100) : ''),
          body: m.body || '',
          folder: m.folder || 'inbox',
          isUnread: Boolean(m.is_unread),
          isStarred: Boolean(m.is_starred),
          hasAttachment: Boolean(m.has_attachment || m.attachments),
          attachments: m.attachments || '',
          time: m.time || '10:00 AM',
          date: m.date || 'Today',
          label: m.label || 'General'
        }));
        setEmails(mapped);

        // Keep selected email updated if open
        if (selectedEmail) {
          const fresh = mapped.find(e => e.id === selectedEmail.id);
          if (fresh) setSelectedEmail(fresh);
        }
      }
    } catch (err) {
      console.error('Failed to load corporate emails:', err);
    } finally {
      if (!silent) setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load directory colleagues for compose suggestions
  useEffect(() => {
    api.get('/users/directory')
      .then(res => {
        if (res.data?.success && Array.isArray(res.data.data)) {
          setColleagues(res.data.data.filter(u => u.email !== user?.email));
        }
      })
      .catch(() => {});
  }, [user?.email]);

  useEffect(() => {
    fetchEmails();
    setSelectedIds([]);
  }, [activeFolder, user?.email]);

  // Periodic polling every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      fetchEmails(true);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeFolder, user?.email]);

  // Toggle star
  const toggleStar = async (id, e) => {
    if (e) e.stopPropagation();
    const target = emails.find(em => em.id === id);
    if (!target) return;
    const nextVal = !target.isStarred;
    setEmails(prev => prev.map(em => em.id === id ? { ...em, isStarred: nextVal } : em));
    if (selectedEmail?.id === id) {
      setSelectedEmail(prev => prev ? { ...prev, isStarred: nextVal } : null);
    }
    try {
      await api.patch(`/mail/emails/${id}`, { isStarred: nextVal });
    } catch (err) {
      console.error('Failed to update star:', err);
    }
  };

  // Select email to read
  const handleSelectEmail = async (email) => {
    // If clicking a draft, open it in the compose modal directly!
    if (activeFolder === 'drafts' || email.folder === 'drafts') {
      setComposeDraftId(email.id);
      setComposeTo(email.recipientEmail || '');
      setComposeCc(email.cc || '');
      setComposeSubject(email.subject || '');
      setComposeBody(email.body || '');
      setComposeLabel(email.label || 'General');
      setIsComposeOpen(true);
      return;
    }

    setSelectedEmail(email);
    if (email.isUnread) {
      setEmails(prev => prev.map(em => em.id === email.id ? { ...em, isUnread: false } : em));
      try {
        await api.patch(`/mail/emails/${email.id}`, { isUnread: false });
      } catch (err) {
        console.error('Failed to mark read:', err);
      }
    }
  };

  // Move to trash or restore
  const handleMoveToTrash = async (id) => {
    setEmails(prev => prev.filter(em => em.id !== id));
    if (selectedEmail?.id === id) setSelectedEmail(null);
    try {
      await api.delete(`/mail/emails/${id}`);
      setFeedback('Email moved to trash');
      setTimeout(() => setFeedback(''), 3000);
    } catch (err) {
      console.error('Failed to delete email:', err);
    }
  };

  // Restore from trash
  const handleRestoreFromTrash = async (id) => {
    try {
      const res = await api.post(`/mail/emails/${id}/restore`);
      setEmails(prev => prev.filter(em => em.id !== id));
      if (selectedEmail?.id === id) setSelectedEmail(null);
      const target = res.data?.data?.folder ? `to ${res.data.data.folder}` : '';
      setFeedback(`Email restored ${target}`.trim());
      setTimeout(() => setFeedback(''), 3000);
    } catch (err) {
      console.error('Failed to restore email:', err);
    }
  };

  // Empty Trash
  const handleEmptyTrash = async () => {
    if (!window.confirm('Are you sure you want to permanently delete all emails in Trash?')) return;
    try {
      await api.post('/mail/empty-trash', { userEmail: user?.email });
      setEmails([]);
      setSelectedEmail(null);
      setSelectedIds([]);
      setFeedback('Trash emptied successfully');
      setTimeout(() => setFeedback(''), 3000);
    } catch (err) {
      console.error('Failed to empty trash:', err);
    }
  };

  // Send compose email
  const handleSendCompose = async (e) => {
    if (e) e.preventDefault();
    if (!composeTo || !composeSubject || !composeBody) return;

    let fullBody = composeBody.trim();
    if (includeSignature) {
      const designation = user?.designation || user?.role || 'Staff Member';
      fullBody += `\n\n--\nBest regards,\n${user?.name || 'Corporate Colleague'}\n${designation}\nIntelliAttend Enterprise HRMS`;
    }

    try {
      const res = await api.post('/mail/send', {
        to: composeTo.trim(),
        cc: composeCc.trim(),
        subject: composeSubject.trim(),
        body: fullBody,
        label: composeLabel,
        attachments: attachedFiles.map(f => f.name).join(', '),
        senderName: user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Corporate Staff',
        senderEmail: user?.email || 'user@intelliattend.com',
        draftId: composeDraftId
      });

      if (res.data?.success) {
        setIsComposeOpen(false);
        setComposeDraftId(null);
        setComposeTo('');
        setComposeCc('');
        setComposeSubject('');
        setComposeBody('');
        setAttachedFiles([]);
        setFeedback(res.data?.message || 'Email sent successfully!');
        setActiveFolder('sent');
        fetchEmails(true);
        setTimeout(() => setFeedback(''), 4000);
      }
    } catch (err) {
      console.error('Failed to send mail:', err);
    }
  };

  // Save as Draft
  const handleSaveDraft = async () => {
    try {
      await api.post('/mail/drafts', {
        id: composeDraftId,
        to: composeTo.trim(),
        cc: composeCc.trim(),
        subject: composeSubject.trim() || '(Draft)',
        body: composeBody.trim(),
        label: composeLabel,
        senderName: user?.name || 'Corporate Staff',
        senderEmail: user?.email || 'user@intelliattend.com',
      });
      setIsComposeOpen(false);
      setComposeDraftId(null);
      setComposeTo('');
      setComposeCc('');
      setComposeSubject('');
      setComposeBody('');
      setFeedback('Saved to Drafts');
      if (activeFolder === 'drafts') fetchEmails(true);
      setTimeout(() => setFeedback(''), 3000);
    } catch (err) {
      console.error('Failed to save draft:', err);
    }
  };

  // Send Inline Quick Reply
  const handleSendInlineReply = async (e) => {
    e.preventDefault();
    if (!inlineReplyText.trim() || !selectedEmail) return;

    setIsSendingInline(true);
    const text = inlineReplyText.trim();
    const sub = selectedEmail.subject.startsWith('Re:') ? selectedEmail.subject : `Re: ${selectedEmail.subject}`;
    const to = selectedEmail.senderEmail || selectedEmail.recipientEmail;

    try {
      await api.post('/mail/send', {
        to,
        subject: sub,
        body: `${text}\n\n--- In reply to ${selectedEmail.sender} ---\n> ${selectedEmail.body.replace(/\n/g, '\n> ')}`,
        label: selectedEmail.label || 'General',
        senderName: user?.name || 'Corporate Staff',
        senderEmail: user?.email || 'user@intelliattend.com'
      });
      setInlineReplyText('');
      setFeedback(`Reply sent to ${selectedEmail.sender}!`);
      fetchEmails(true);
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      console.error('Failed to send inline reply:', err);
    } finally {
      setIsSendingInline(false);
    }
  };

  // Reply button pre-fill modal
  const handleReply = (email) => {
    setComposeDraftId(null);
    setComposeTo(email.senderEmail || email.sender);
    setComposeSubject(email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`);
    setComposeBody(`\n\n--- On ${email.date} at ${email.time}, ${email.sender} wrote: ---\n> ${email.body.replace(/\n/g, '\n> ')}`);
    setComposeLabel(email.label || 'General');
    setIsComposeOpen(true);
  };

  // Forward button pre-fill modal
  const handleForward = (email) => {
    setComposeDraftId(null);
    setComposeTo('');
    setComposeSubject(email.subject.startsWith('Fwd:') ? email.subject : `Fwd: ${email.subject}`);
    setComposeBody(`\n\n---------- Forwarded message ---------\nFrom: ${email.sender} <${email.senderEmail}>\nDate: ${email.date} at ${email.time}\nSubject: ${email.subject}\nTo: ${email.recipientEmail}\n\n${email.body}`);
    setComposeLabel(email.label || 'General');
    setIsComposeOpen(true);
  };

  // Filtered emails
  const filteredEmails = useMemo(() => {
    return emails.filter(em => {
      if (unreadOnly && !em.isUnread) return false;
      if (selectedLabel !== 'all' && em.label?.toLowerCase() !== selectedLabel.toLowerCase()) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          em.subject.toLowerCase().includes(q) ||
          em.sender.toLowerCase().includes(q) ||
          em.recipientEmail.toLowerCase().includes(q) ||
          em.snippet.toLowerCase().includes(q) ||
          em.body.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [emails, unreadOnly, selectedLabel, searchQuery]);

  // Bulk actions
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredEmails.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEmails.map(e => e.id));
    }
  };

  const toggleSelectId = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedIds.length === 0) return;
    try {
      await api.post('/mail/bulk', { ids: selectedIds, action });
      if (action === 'delete' || action === 'trash' || action === 'restore') {
        setEmails(prev => prev.filter(e => !selectedIds.includes(e.id)));
        if (selectedEmail && selectedIds.includes(selectedEmail.id)) setSelectedEmail(null);
      } else if (action === 'read') {
        setEmails(prev => prev.map(e => selectedIds.includes(e.id) ? { ...e, isUnread: false } : e));
      } else if (action === 'unread') {
        setEmails(prev => prev.map(e => selectedIds.includes(e.id) ? { ...e, isUnread: true } : e));
      } else if (action === 'star') {
        setEmails(prev => prev.map(e => selectedIds.includes(e.id) ? { ...e, isStarred: true } : e));
      }
      setSelectedIds([]);
      setFeedback(`Bulk action ${action} completed`);
      setTimeout(() => setFeedback(''), 3000);
    } catch (err) {
      console.error('Bulk action failed:', err);
    }
  };

  return (
    <div className="h-full min-h-[550px] flex-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex overflow-hidden">
      {/* 1. LEFT PANE: Folders navigation */}
      <div className="w-56 lg:w-60 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-950/40 p-4">
        {/* Compose Button */}
        <button
          onClick={() => {
            setComposeDraftId(null);
            setComposeTo('');
            setComposeCc('');
            setComposeSubject('');
            setComposeBody('');
            setAttachedFiles([]);
            setIsComposeOpen(true);
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 text-white font-bold text-xs shadow-sm transition mb-5 cursor-pointer"
        >
          <PenSquare className="w-4 h-4 text-teal-400 dark:text-white" />
          <span>Compose Email</span>
        </button>

        {/* Folders List */}
        <div className="space-y-1">
          {[
            { id: 'inbox', label: 'Inbox', icon: Inbox },
            { id: 'starred', label: 'Starred', icon: Star },
            { id: 'sent', label: 'Sent Mail', icon: Send },
            { id: 'drafts', label: 'Drafts', icon: FileText },
            { id: 'trash', label: 'Trash', icon: Trash2 },
          ].map((f) => {
            const Icon = f.icon;
            const isActive = activeFolder === f.id;
            return (
              <button
                key={f.id}
                onClick={() => {
                  setActiveFolder(f.id);
                  setSelectedEmail(null);
                }}
                className={clsx(
                  'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer',
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={clsx('w-4 h-4', isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400')} />
                  <span>{f.label}</span>
                </div>
                {f.id === 'inbox' && emails.filter(e => e.isUnread).length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-md bg-teal-500 text-white text-[10px] font-bold">
                    {emails.filter(e => e.isUnread).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Labels Filter Section */}
        <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Category Labels</p>
          <div className="space-y-1">
            {['all', ...EMAIL_LABELS].map(label => (
              <button
                key={label}
                onClick={() => setSelectedLabel(label)}
                className={clsx(
                  'w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs capitalize transition cursor-pointer',
                  selectedLabel === label
                    ? 'font-bold text-teal-600 dark:text-teal-400 bg-teal-50/60 dark:bg-teal-950/40'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                <Tag className="w-3 h-3 text-slate-400" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Unread toggle */}
        <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-700 text-teal-600 focus:ring-teal-500"
            />
            <span>Unread only</span>
          </label>
        </div>
      </div>

      {/* 2. MIDDLE PANE: Email list */}
      <div className={clsx(
        'w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900',
        selectedEmail ? 'hidden md:flex' : 'flex'
      )}>
        {/* Top search & bulk actions */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={`Search in ${activeFolder}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div className="flex items-center justify-between text-xs px-1">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSelectAll}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title="Select all"
              >
                {selectedIds.length > 0 && selectedIds.length === filteredEmails.length ? (
                  <CheckSquare className="w-4 h-4 text-teal-600" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </button>

              {selectedIds.length > 0 ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBulkAction('read')}
                    className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-teal-600 cursor-pointer"
                    title="Mark Read"
                  >
                    Read
                  </button>
                  <button
                    onClick={() => handleBulkAction('star')}
                    className="text-[11px] font-semibold text-amber-500 hover:text-amber-600 cursor-pointer"
                    title="Star"
                  >
                    Star
                  </button>
                  <button
                    onClick={() => handleBulkAction(activeFolder === 'trash' ? 'restore' : 'trash')}
                    className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                  >
                    {activeFolder === 'trash' ? 'Restore' : 'Trash'} ({selectedIds.length})
                  </button>
                </div>
              ) : activeFolder === 'trash' && emails.length > 0 ? (
                <button
                  onClick={handleEmptyTrash}
                  className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                >
                  Empty Trash
                </button>
              ) : null}
            </div>

            <button
              onClick={() => fetchEmails(true)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              title="Refresh inbox"
            >
              <RefreshCw className={clsx('w-3.5 h-3.5', isRefreshing && 'animate-spin text-teal-500')} />
            </button>
          </div>
        </div>

        {/* Feedback Alert Pill */}
        {feedback && (
          <div className="mx-3 my-2 p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{feedback}</span>
            </div>
            <button onClick={() => setFeedback('')} className="p-0.5"><X className="w-3 h-3" /></button>
          </div>
        )}

        {/* Email Items List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading correspondence...</div>
          ) : filteredEmails.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No emails in {activeFolder}.</div>
          ) : (
            filteredEmails.map((email) => {
              const isSelected = selectedEmail?.id === email.id;
              const isChecked = selectedIds.includes(email.id);

              return (
                <div
                  key={email.id}
                  onClick={() => handleSelectEmail(email)}
                  className={clsx(
                    'p-3.5 transition cursor-pointer relative flex items-start gap-3',
                    isSelected
                      ? 'bg-teal-50/40 dark:bg-slate-800/80 shadow-xs'
                      : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40',
                    email.isUnread && 'bg-slate-50/40 dark:bg-slate-800/20 font-medium'
                  )}
                >
                  {/* Select Checkbox */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelectId(email.id);
                    }}
                    className="mt-0.5 text-slate-300 hover:text-slate-500 dark:hover:text-slate-400 cursor-pointer"
                  >
                    {isChecked ? (
                      <CheckSquare className="w-3.5 h-3.5 text-teal-600" />
                    ) : (
                      <Square className="w-3.5 h-3.5" />
                    )}
                  </div>

                  {/* Star Toggle */}
                  <button
                    type="button"
                    onClick={(e) => toggleStar(email.id, e)}
                    className="mt-0.5 text-slate-300 hover:text-amber-400 dark:hover:text-amber-400 transition cursor-pointer"
                  >
                    <Star className={clsx('w-3.5 h-3.5', email.isStarred ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600')} />
                  </button>

                  {/* Content details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <p className={clsx(
                        'text-xs truncate',
                        email.isUnread
                          ? 'font-bold text-slate-900 dark:text-white'
                          : 'font-medium text-slate-700 dark:text-slate-300'
                      )}>
                        {activeFolder === 'sent' ? `To: ${email.recipientEmail}` : email.sender}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0">{email.time}</span>
                    </div>

                    <p className={clsx(
                      'text-xs truncate mb-1',
                      email.isUnread ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
                    )}>
                      {email.subject}
                    </p>

                    <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1">
                      {email.snippet}
                    </p>

                    {/* Footer tags */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[9px] font-semibold text-slate-500 dark:text-slate-400">
                        {email.label}
                      </span>
                      {email.hasAttachment && (
                        <span className="flex items-center text-[10px] text-slate-400">
                          <Paperclip className="w-3 h-3" />
                        </span>
                      )}
                      {email.isSystem && (
                        <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[9px] font-bold">
                          Broadcast
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. RIGHT PANE: Email Reading & Quick Reply */}
      <div className={clsx(
        'flex-1 flex flex-col bg-white dark:bg-slate-900 min-w-0 overflow-y-auto',
        selectedEmail ? 'flex' : 'hidden md:flex'
      )}>
        {selectedEmail ? (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Reading Pane Header Bar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-white dark:bg-slate-900 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="md:hidden p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 cursor-pointer"
                  title="Back to email list"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold text-xs">
                  {selectedEmail.label}
                </span>
                {selectedEmail.isSystem && (
                  <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                    Official Broadcast
                  </span>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleReply(selectedEmail)}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                  title="Reply"
                >
                  <Reply className="w-4 h-4 text-teal-600" />
                  <span className="hidden sm:inline">Reply</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleForward(selectedEmail)}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                  title="Forward"
                >
                  <Forward className="w-4 h-4 text-indigo-500" />
                  <span className="hidden sm:inline">Forward</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => toggleStar(selectedEmail.id, e)}
                  className="p-2 rounded-xl text-slate-400 hover:text-amber-400 transition cursor-pointer"
                  title="Star email"
                >
                  <Star className={clsx('w-4 h-4', selectedEmail.isStarred ? 'fill-amber-400 text-amber-400' : 'text-slate-400')} />
                </button>
                {activeFolder === 'trash' ? (
                  <button
                    type="button"
                    onClick={() => handleRestoreFromTrash(selectedEmail.id)}
                    className="p-2 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
                    title="Restore to Inbox"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Restore</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleMoveToTrash(selectedEmail.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                    title="Move to trash"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Email Body & Details Content */}
            <div className="p-6 space-y-6 flex-1">
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight mb-4">
                  {selectedEmail.subject}
                </h1>

                {/* Sender & Recipient Metadata Card */}
                <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-800 dark:bg-teal-700 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                      {selectedEmail.senderInitial}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">
                        {selectedEmail.sender}
                      </p>
                      <p className="text-xs text-slate-400 font-mono">
                        {selectedEmail.senderEmail}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        To: <span className="font-medium text-slate-700 dark:text-slate-300">{selectedEmail.recipientEmail}</span>
                        {selectedEmail.cc && <span className="ml-2 font-mono">CC: {selectedEmail.cc}</span>}
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-xs text-slate-400 shrink-0 font-medium">
                    <p>{selectedEmail.date}</p>
                    <p className="mt-0.5">{selectedEmail.time}</p>
                  </div>
                </div>
              </div>

              {/* Main Body */}
              <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                {selectedEmail.body}
              </div>

              {/* Attached files chips */}
              {selectedEmail.attachments && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>Attachments (1)</span>
                  </p>
                  <div className="inline-flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
                    <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{selectedEmail.attachments}</span>
                    <span className="text-[10px] text-teal-600 dark:text-teal-400 underline cursor-pointer ml-2">Download</span>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Quick Inline Reply Box at Bottom of Reading Pane */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60">
              <form onSubmit={handleSendInlineReply} className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Reply className="w-3.5 h-3.5 text-teal-600" /> Quick Reply to {selectedEmail.sender}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleReply(selectedEmail)}
                    className="text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                  >
                    Open Full Composer
                  </button>
                </div>
                <div className="relative">
                  <textarea
                    rows={3}
                    value={inlineReplyText}
                    onChange={(e) => setInlineReplyText(e.target.value)}
                    placeholder="Type your response here..."
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                  <button
                    type="submit"
                    disabled={!inlineReplyText.trim() || isSendingInline}
                    className="absolute right-3 bottom-3 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 text-white font-bold text-xs transition disabled:opacity-40 cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-3 h-3" />
                    <span>{isSendingInline ? 'Sending...' : 'Send'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* Empty reading view placeholder */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/20 dark:bg-slate-950/20">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4 shadow-sm">
              <MailIcon className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">
              Select an email to read
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed mb-4">
              Choose an email from the list to view its complete correspondence, or compose a new corporate message.
            </p>
            <button
              onClick={() => {
                setComposeDraftId(null);
                setComposeTo('');
                setComposeCc('');
                setComposeSubject('');
                setComposeBody('');
                setIsComposeOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-teal-600 text-white text-xs font-semibold hover:bg-slate-800 dark:hover:bg-teal-500 transition cursor-pointer shadow-sm"
            >
              Compose New Message
            </button>
          </div>
        )}
      </div>

      {/* 4. FULL COMPOSE EMAIL MODAL */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden animate-in fade-in-0 zoom-in-95 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-950/60">
              <div className="flex items-center gap-2">
                <PenSquare className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {composeDraftId ? 'Edit Saved Draft' : 'Compose Corporate Email'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsComposeOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendCompose} className="p-5 space-y-3.5 text-xs flex-1 flex flex-col overflow-y-auto">
              {/* Recipient with suggestions */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    To (Recipient)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCc(!showCc)}
                    className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline font-semibold"
                  >
                    {showCc ? 'Hide CC' : '+ Add CC'}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    required
                    value={composeTo}
                    onChange={(e) => setComposeTo(e.target.value)}
                    placeholder="Search colleague by name or enter email address"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                  {/* Matching Colleagues Dropdown */}
                  {composeTo.trim() && !colleagues.some(c => c.email.toLowerCase() === composeTo.trim().toLowerCase()) && (
                    (() => {
                      const q = composeTo.toLowerCase().trim();
                      const matches = colleagues.filter(c =>
                        (c.name && c.name.toLowerCase().includes(q)) ||
                        (c.first_name && c.first_name.toLowerCase().includes(q)) ||
                        (c.last_name && c.last_name.toLowerCase().includes(q)) ||
                        (c.email && c.email.toLowerCase().includes(q)) ||
                        (c.role && c.role.toLowerCase().includes(q))
                      ).slice(0, 4);

                      if (matches.length === 0) return null;
                      return (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-20 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700/60">
                          {matches.map(c => (
                            <div
                              key={c.id}
                              onClick={() => setComposeTo(c.email)}
                              className="p-2.5 hover:bg-teal-50 dark:hover:bg-slate-700/50 cursor-pointer flex items-center justify-between transition"
                            >
                              <div>
                                <p className="font-semibold text-xs text-slate-900 dark:text-white">
                                  {c.name || `${c.first_name} ${c.last_name}`}
                                </p>
                                <p className="text-[10px] text-teal-600 dark:text-teal-400 font-mono">
                                  {c.email}
                                </p>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 uppercase">
                                {c.role}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    })()
                  )}
                </div>

                {/* Quick suggestions pills */}
                {colleagues.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[10px] text-slate-400 self-center mr-1">Quick Add:</span>
                    {colleagues.slice(0, 4).map(c => (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => setComposeTo(c.email)}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-600 font-medium cursor-pointer transition"
                      >
                        {c.name || `${c.first_name} ${c.last_name}`}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* CC Field if enabled */}
              {showCc && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                    CC (Carbon Copy)
                  </label>
                  <input
                    type="text"
                    value={composeCc}
                    onChange={(e) => setComposeCc(e.target.value)}
                    placeholder="Enter comma separated emails"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              )}

              {/* Subject & Category Label */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                    placeholder="Enter email subject"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                    Category
                  </label>
                  <select
                    value={composeLabel}
                    onChange={(e) => setComposeLabel(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  >
                    {EMAIL_LABELS.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 min-h-[160px]">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                  Message Content
                </label>
                <textarea
                  rows={7}
                  required
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Write your corporate message here..."
                  className="w-full h-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white resize-none text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 leading-relaxed font-sans"
                />
              </div>

              {/* Options: Signature Toggle & Attachments */}
              <div className="flex items-center justify-between text-xs pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={includeSignature}
                    onChange={(e) => setIncludeSignature(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-700 text-teal-600 focus:ring-teal-500"
                  />
                  <span>Attach corporate email signature</span>
                </label>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer">
                    <Paperclip className="w-3.5 h-3.5 text-teal-600" />
                    <span>Attach file</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setAttachedFiles(prev => [...prev, file]);
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Attached file chips */}
              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {attachedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-[11px]">
                      <Paperclip className="w-3 h-3" />
                      <span className="truncate max-w-[140px]">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== idx))}
                        className="hover:text-rose-500 ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Bottom modal actions */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono truncate max-w-[180px]">
                  From: {user?.email}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs cursor-pointer transition"
                  >
                    Save Draft
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 text-white font-bold text-xs shadow-sm transition cursor-pointer"
                  >
                    Send Email
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
