import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Search, Filter, Bell, MessageSquare, Mail as MailIcon,
  PenSquare, Inbox, Star, Clock, Send, FileText, Trash2, Settings,
  RotateCw, Paperclip, ChevronLeft, ChevronRight, X, Reply,
  Share2, ChevronDown, CheckSquare, Square
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext';

const INITIAL_EMAILS = [
  {
    id: 1,
    sender: 'HRMS',
    senderEmail: 'hrms-notifications@intelliattend.com',
    senderInitial: 'U',
    isSystem: true,
    subject: 'Leave request Approved: Leave Without Pay',
    snippet: 'Dear Rahul Bariki, Your leave request has been Approved. Request Details: Leave Type: Leave Without Pay (LWP), From: 28 Oct 2026, To: 28 Oct 2026.',
    body: `Dear Rahul Bariki,

Your leave request has been Approved by your Reporting Manager.

Request Summary:
• Leave Type: Leave Without Pay (LWP)
• Start Date: 28 Oct 2026
• End Date: 28 Oct 2026
• Total Days: 1.0 Day
• Reason: Personal Commitment

Your attendance records and payroll calculations have been updated accordingly.

Regards,
Human Resources Team
IntelliAttend Workspace`,
    folder: 'inbox',
    isUnread: true,
    isStarred: false,
    hasAttachment: false,
    time: '16:13',
    date: 'Today',
    label: 'HR & Leaves',
  },
  {
    id: 2,
    sender: 'HRMS',
    senderEmail: 'hrms-notifications@intelliattend.com',
    senderInitial: 'U',
    isSystem: true,
    subject: 'Leave request received: Leave Without Pay',
    snippet: 'Dear Rahul Bariki, Your leave request has been submitted and is awaiting approval from your reporting manager Aditya Dhiman.',
    body: `Dear Rahul Bariki,

Your leave application has been logged into the system and forwarded to your manager for review.

Leave Details:
• Type: Leave Without Pay
• Applied On: 26 Oct 2026
• Duration: 1 Day

You will receive an automated notification once your manager approves or comments on this request.

Regards,
IntelliAttend HRMS System`,
    folder: 'inbox',
    isUnread: true,
    isStarred: false,
    hasAttachment: false,
    time: '15:02',
    date: 'Today',
    label: 'HR & Leaves',
  },
  {
    id: 3,
    sender: 'HRMS',
    senderEmail: 'tasks@intelliattend.com',
    senderInitial: 'U',
    isSystem: true,
    subject: 'Task Status Update: Work on dashboards implementation in the panels of yo...',
    snippet: 'Dear Rahul, Assignee Status has been updated for task #2: Work on dashboards implementation in the panels of employee, manager, and client views.',
    body: `Dear Rahul,

Task status update:
• Task ID: #2
• Title: Work on dashboards implementation
• Status: Completed (100%)
• Reviewer: Aditya Dhiman

Great job finishing the responsive layouts and metric charts on time.

Regards,
Task Management Service`,
    folder: 'inbox',
    isUnread: false,
    isStarred: true,
    hasAttachment: false,
    time: '23 Oct',
    date: '23 Oct 2026',
    label: 'Tasks',
  },
  {
    id: 4,
    sender: 'HRMS',
    senderEmail: 'tasks@intelliattend.com',
    senderInitial: 'U',
    isSystem: true,
    subject: 'Task Status Update: Work on dashboards implementation in the panels of yo...',
    snippet: 'Dear Rahul, Assignee Status notification. New comments were posted on the discussion thread.',
    body: `Dear Rahul,

Aditya Dhiman added a comment on Task #2:
"Ensure responsiveness on tablets and mobile screens for all quick action widgets."

You can reply directly in the portal under My Tasks.

Regards,
Task Tracker`,
    folder: 'inbox',
    isUnread: false,
    isStarred: false,
    hasAttachment: false,
    time: '23 Oct',
    date: '23 Oct 2026',
    label: 'Tasks',
  },
  {
    id: 5,
    sender: 'HRMS',
    senderEmail: 'announcements@intelliattend.com',
    senderInitial: 'U',
    isSystem: true,
    subject: 'New Holiday Added - Diwali',
    snippet: "Dear Team, We're pleased to inform you that a new holiday has been added to the company calendar for Diwali (Deepavali) on Sunday, 08 Nov 2026.",
    body: `Dear Team,

We are pleased to inform you that a new company holiday has been added to the calendar:

• Holiday: Diwali (Deepavali)
• Date: 08 November 2026
• Day: Sunday
• Type: Gazetted Paid Holiday

Wishing everyone a joyous and safe festival season!

Warm Regards,
Management & People Ops`,
    folder: 'inbox',
    isUnread: false,
    isStarred: false,
    hasAttachment: false,
    time: '23 Oct',
    date: '23 Oct 2026',
    label: 'Announcements',
  },
  {
    id: 6,
    sender: 'HRMS',
    senderEmail: 'announcements@intelliattend.com',
    senderInitial: 'U',
    isSystem: true,
    subject: 'New Holiday Added - Choti Diwali',
    snippet: "Dear Team, We're pleased to inform you that a new holiday has been added to the calendar for Choti Diwali.",
    body: `Dear Team,

The holiday calendar has been updated to mark Choti Diwali observances.

Please check your Holidays tab for complete regional holiday lists.

Regards,
HR Operations`,
    folder: 'inbox',
    isUnread: false,
    isStarred: false,
    hasAttachment: false,
    time: '23 Oct',
    date: '23 Oct 2026',
    label: 'Announcements',
  },
  {
    id: 7,
    sender: 'Payroll Operations',
    senderEmail: 'payroll@intelliattend.com',
    senderInitial: 'PO',
    isSystem: false,
    subject: 'Monthly Payslip Generated - October 2026',
    snippet: 'Dear Rahul Bariki, Your monthly payslip for October 2026 is now generated and ready to download in your Salary tab.',
    body: `Dear Rahul Bariki,

Your salary slip for October 2026 has been finalized and credited:

• Basic: ₹55,000.00
• HRA: ₹22,000.00
• Special Allowance: ₹18,000.00
• Net Pay: ₹91,400.00

You can download the password-protected PDF slip anytime under the Salary menu.

Best regards,
Payroll Department`,
    folder: 'inbox',
    isUnread: false,
    isStarred: true,
    hasAttachment: true,
    time: '22 Oct',
    date: '22 Oct 2026',
    label: 'Finance',
  },
  {
    id: 8,
    sender: 'Aditya Dhiman',
    senderEmail: 'aditya.dhiman@intelliattend.com',
    senderInitial: 'AD',
    isSystem: false,
    subject: 'Sprint Retrospective & Code Review Sync',
    snippet: 'Hi Rahul, Please prepare the walkthrough for the new Attendance regularizations and camera verification module.',
    body: `Hi Rahul,

Let's connect this Wednesday at 4:30 PM for our sprint review. Please ensure the following:
1. Demo of the MediaPipe face match flow
2. Attendance regularization submission & manager approval test cases
3. Zero warnings on oxlint

See you in the team space!

Regards,
Aditya Dhiman
Lead Engineering Manager`,
    folder: 'inbox',
    isUnread: false,
    isStarred: true,
    hasAttachment: false,
    time: '21 Oct',
    date: '21 Oct 2026',
    label: 'Tasks',
  },
];

export default function EmployeeMail() {
  const { user } = useAuth();
  const [emails, setEmails] = useState(INITIAL_EMAILS);
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [attachmentsOnly, setAttachmentsOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  // Compose form
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');

  // Status dropdown
  const [presence, setPresence] = useState('Active');
  const [presenceOpen, setPresenceOpen] = useState(false);

  // Filtered emails
  const filteredEmails = useMemo(() => {
    return emails.filter(email => {
      // Folder check
      if (activeFolder === 'starred' && !email.isStarred) return false;
      if (activeFolder !== 'starred' && email.folder !== activeFolder) return false;

      // Filter unread
      if (unreadOnly && !email.isUnread) return false;

      // Filter attachments
      if (attachmentsOnly && !email.hasAttachment) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchSubject = email.subject.toLowerCase().includes(q);
        const matchSnippet = email.snippet.toLowerCase().includes(q);
        const matchSender = email.sender.toLowerCase().includes(q);
        if (!matchSubject && !matchSnippet && !matchSender) return false;
      }

      return true;
    });
  }, [emails, activeFolder, unreadOnly, attachmentsOnly, searchQuery]);

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

  const toggleStar = (id, e) => {
    e.stopPropagation();
    setEmails(emails.map(email =>
      email.id === id ? { ...email, isStarred: !email.isStarred } : email
    ));
    if (selectedEmail && selectedEmail.id === id) {
      setSelectedEmail(prev => ({ ...prev, isStarred: !prev.isStarred }));
    }
  };

  const handleOpenEmail = (email) => {
    setSelectedEmail(email);
    // Mark as read
    if (email.isUnread) {
      setEmails(emails.map(e => e.id === email.id ? { ...e, isUnread: false } : e));
    }
  };

  const handleSendCompose = (e) => {
    e.preventDefault();
    if (!composeTo.trim() || !composeSubject.trim()) return;

    const newMail = {
      id: Date.now(),
      sender: user?.name || 'Rahul Bariki',
      senderEmail: user?.email || 'rahul.bariki@intelliattend.com',
      senderInitial: 'RB',
      isSystem: false,
      subject: composeSubject.trim(),
      snippet: composeBody.trim() || composeSubject.trim(),
      body: composeBody.trim(),
      folder: 'sent',
      isUnread: false,
      isStarred: false,
      hasAttachment: false,
      time: 'Just now',
      date: 'Today',
      label: 'Work',
    };

    setEmails([newMail, ...emails]);
    setIsComposeOpen(false);
    setComposeTo('');
    setComposeSubject('');
    setComposeBody('');
  };

  const handleDeleteSelected = () => {
    setEmails(emails.filter(e => !selectedIds.includes(e.id)));
    setSelectedIds([]);
    if (selectedEmail && selectedIds.includes(selectedEmail.id)) {
      setSelectedEmail(null);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden select-none">
      {/* Top Application Header matching Screenshot 4 */}
      <header className="h-16 px-4 border-b border-slate-200 bg-white flex items-center justify-between gap-4 z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/employee/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
            <span>Back to Main</span>
          </Link>

          <div className="flex items-center gap-2 pl-2">
            <img src="/logo.png" alt="Logo" className="h-6 w-auto object-contain" />
            <span className="font-display font-bold text-xs sm:text-sm text-slate-900 tracking-tight uppercase">
              IntelliAttend
            </span>
            <span className="px-2 py-0.5 rounded-md bg-teal-500 text-white font-bold text-[10px]">
              Mail
            </span>
          </div>
        </div>

        {/* Center Search in Mail */}
        <div className="flex-1 max-w-md mx-2 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in mail"
              className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900 placeholder:text-slate-400"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              title="Search filter"
            >
              <Filter className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right presence & user profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Presence Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setPresenceOpen(!presenceOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{presence}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            {presenceOpen && (
              <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 text-xs">
                {['Active', 'Away', 'Do not disturb', 'Invisible'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => {
                      setPresence(status);
                      setPresenceOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 font-medium"
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <button
            type="button"
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* Enable chat notifications button */}
          <button
            type="button"
            className="hidden lg:inline-flex items-center px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-teal-300 font-bold text-xs transition cursor-pointer shadow-2xs border border-teal-500/20"
          >
            Enable chat notifications
          </button>

          {/* User profile */}
          <div className="flex items-center gap-2 pl-1">
            <img
              src="/avatar_rahul.png"
              alt="Rahul Bariki"
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
            />
            <div className="hidden sm:block text-left">
              <p className="font-bold text-xs text-slate-800 leading-tight">Rahul Bariki</p>
              <p className="text-[10px] text-slate-400 leading-tight">Employee</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Mail App Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Leftmost Navigation Rail (Mail / Chat switcher) */}
        <div className="w-16 bg-slate-50 border-r border-slate-200 flex flex-col items-center py-4 gap-4 flex-shrink-0">
          <Link
            to="/employee/mail"
            className="w-10 h-10 rounded-xl bg-slate-900 text-teal-300 flex flex-col items-center justify-center font-bold text-[10px] transition shadow-xs border border-teal-500/20"
            title="Mail"
          >
            <MailIcon className="w-4 h-4 mb-0.5 text-teal-400" />
            <span>Mail</span>
          </Link>
          <Link
            to="/employee/chat"
            className="w-10 h-10 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex flex-col items-center justify-center font-medium text-[10px] transition"
            title="Chat"
          >
            <MessageSquare className="w-4 h-4 mb-0.5" />
            <span>Chat</span>
          </Link>
        </div>

        {/* Sub-sidebar (Folders, Compose button, Labels) */}
        <div className="w-56 border-r border-slate-200 bg-white flex flex-col py-4 px-3 flex-shrink-0">
          {/* + Compose Button */}
          <button
            type="button"
            onClick={() => setIsComposeOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 hover:border-teal-400 bg-white hover:bg-teal-50/50 text-slate-800 font-bold text-xs shadow-xs transition cursor-pointer mb-4"
          >
            <PenSquare className="w-4 h-4 text-teal-600" />
            <span>Compose</span>
          </button>

          {/* Folders List */}
          <nav className="space-y-1">
            {[
              { id: 'inbox', label: 'Inbox', icon: Inbox, count: emails.filter(e => e.folder === 'inbox' && e.isUnread).length },
              { id: 'starred', label: 'Starred', icon: Star, count: emails.filter(e => e.isStarred).length },
              { id: 'snoozed', label: 'Snoozed', icon: Clock, count: 0 },
              { id: 'sent', label: 'Sent', icon: Send, count: emails.filter(e => e.folder === 'sent').length },
              { id: 'drafts', label: 'Drafts', icon: FileText, count: 0 },
              { id: 'trash', label: 'Trash', icon: Trash2, count: 0 },
              { id: 'settings', label: 'Settings', icon: Settings, count: null },
            ].map((folder) => {
              const Icon = folder.icon;
              const isActive = activeFolder === folder.id;
              return (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => {
                    setActiveFolder(folder.id);
                    setSelectedEmail(null);
                  }}
                  className={clsx(
                    'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer',
                    isActive
                      ? 'bg-teal-50 text-teal-900 font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={clsx('w-4 h-4', isActive ? 'text-teal-600' : 'text-slate-400')} />
                    <span>{folder.label}</span>
                  </div>
                  {folder.count !== null && folder.count > 0 && (
                    <span className={clsx('text-[11px] font-bold px-1.5 py-0.2 rounded-full', isActive ? 'bg-teal-200 text-teal-900' : 'text-slate-400')}>
                      {folder.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Labels Section */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                LABELS
              </span>
              <button type="button" className="text-slate-400 hover:text-slate-600 text-xs font-bold" title="Add Label">
                +
              </button>
            </div>
            <div className="space-y-1 text-xs">
              {['HR & Leaves', 'Tasks', 'Announcements', 'Finance'].map((label) => (
                <div key={label} className="flex items-center gap-2 px-3 py-1.5 text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area (Email List or Open Email View) */}
        <div className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
          {selectedEmail ? (
            /* Open Email View */
            <div className="flex-1 flex flex-col overflow-y-auto">
              {/* Header toolbar */}
              <div className="h-12 border-b border-slate-200 px-4 flex items-center justify-between flex-shrink-0 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedEmail(null)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition"
                    title="Back to inbox"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => toggleStar(selectedEmail.id, e)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition"
                    title="Star"
                  >
                    <Star className={clsx('w-4 h-4', selectedEmail.isStarred ? 'fill-amber-400 text-amber-400' : 'text-slate-400')} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmails(emails.filter(e => e.id !== selectedEmail.id));
                      setSelectedEmail(null);
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
                <div className="text-xs text-slate-400">
                  {selectedEmail.date} ({selectedEmail.time})
                </div>
              </div>

              {/* Email Content Body */}
              <div className="p-6 space-y-6 max-w-4xl">
                <div>
                  <h2 className="font-display font-bold text-xl text-slate-900 leading-snug">
                    {selectedEmail.subject}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                      {selectedEmail.label || 'Inbox'}
                    </span>
                  </div>
                </div>

                {/* Sender details */}
                <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-teal-300 font-bold flex items-center justify-center text-sm shadow-xs border border-teal-500/20">
                      {selectedEmail.senderInitial}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900">{selectedEmail.sender}</p>
                      <p className="text-[11px] text-slate-500">{selectedEmail.senderEmail}</p>
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-slate-400">
                    <p>{selectedEmail.time}</p>
                    <p className="text-[10px]">to me</p>
                  </div>
                </div>

                {/* Body Message */}
                <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line p-2">
                  {selectedEmail.body}
                </div>

                {/* Quick Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setComposeTo(selectedEmail.senderEmail);
                      setComposeSubject(`Re: ${selectedEmail.subject}`);
                      setIsComposeOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-xs text-slate-700 transition cursor-pointer"
                  >
                    <Reply className="w-4 h-4" />
                    <span>Reply</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setComposeSubject(`Fwd: ${selectedEmail.subject}`);
                      setComposeBody(`---------- Forwarded message ---------\n${selectedEmail.body}`);
                      setIsComposeOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-xs text-slate-700 transition cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Forward</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Email List View matching Screenshot 4 */
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Inbox action toolbar */}
              <div className="h-12 border-b border-slate-200 px-4 flex items-center justify-between flex-shrink-0 bg-white">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-slate-900 capitalize">{activeFolder}</span>

                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-slate-500 hover:text-slate-800 transition"
                    title="Select all"
                  >
                    {selectedIds.length > 0 && selectedIds.length === filteredEmails.length ? (
                      <CheckSquare className="w-4 h-4 text-teal-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedIds([])}
                    className="p-1 rounded text-slate-400 hover:text-slate-600"
                    title="Refresh"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>

                  {/* Filter pills: Unread, Attachments */}
                  <div className="flex items-center gap-1.5 ml-2">
                    <button
                      type="button"
                      onClick={() => setUnreadOnly(!unreadOnly)}
                      className={clsx(
                        'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition cursor-pointer',
                        unreadOnly
                          ? 'bg-slate-900 text-teal-300 border-slate-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                      <span>Unread</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttachmentsOnly(!attachmentsOnly)}
                      className={clsx(
                        'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition cursor-pointer',
                        attachmentsOnly
                          ? 'bg-slate-900 text-teal-300 border-slate-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      <Paperclip className="w-3 h-3 text-teal-400" />
                      <span>Attachments</span>
                    </button>
                  </div>

                  {selectedIds.length > 0 && (
                    <button
                      type="button"
                      onClick={handleDeleteSelected}
                      className="ml-2 text-xs font-bold text-rose-600 hover:text-rose-700"
                    >
                      Delete ({selectedIds.length})
                    </button>
                  )}
                </div>

                {/* Pagination */}
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>1–{filteredEmails.length} of {filteredEmails.length}</span>
                  <div className="flex items-center">
                    <button type="button" className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-40" disabled>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button type="button" className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-40" disabled>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Emails List Rows matching Screenshot 4 */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {filteredEmails.length > 0 ? (
                  filteredEmails.map((email) => {
                    const isSelected = selectedIds.includes(email.id);

                    return (
                      <div
                        key={email.id}
                        onClick={() => handleOpenEmail(email)}
                        className={clsx(
                          'flex items-center px-4 py-3 gap-3.5 hover:bg-slate-50 transition cursor-pointer select-none group',
                          email.isUnread ? 'bg-white font-bold' : 'bg-slate-50/30 font-normal',
                          isSelected && 'bg-teal-50/50'
                        )}
                      >
                        {/* Checkbox */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectId(email.id);
                          }}
                          className="text-slate-400 hover:text-slate-700"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-teal-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />
                          )}
                        </div>

                        {/* Star */}
                        <div onClick={(e) => toggleStar(email.id, e)} className="text-slate-300 hover:text-amber-400">
                          <Star className={clsx('w-4 h-4', email.isStarred ? 'fill-amber-400 text-amber-400' : 'text-slate-300')} />
                        </div>

                        {/* Sender Avatar */}
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs flex-shrink-0 border border-slate-200">
                          {email.senderInitial}
                        </div>

                        {/* Sender Name */}
                        <div className="w-28 flex-shrink-0 truncate text-xs text-slate-900">
                          {email.sender}
                        </div>

                        {/* Subject & Snippet */}
                        <div className="flex-1 min-w-0 text-xs truncate">
                          <span className={clsx('text-slate-900', email.isUnread ? 'font-bold' : 'font-semibold')}>
                            {email.subject}
                          </span>
                          <span className="text-slate-400 font-normal"> - {email.snippet}</span>
                        </div>

                        {/* Attachment Icon */}
                        {email.hasAttachment && (
                          <Paperclip className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        )}

                        {/* Time / Date */}
                        <div className="text-[11px] text-slate-500 flex-shrink-0 whitespace-nowrap pl-2">
                          {email.time}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-16 text-slate-400 text-xs">
                    No emails in this view.
                  </div>
                )}
              </div>

              {/* Bottom pagination info bar */}
              <div className="h-9 border-t border-slate-100 px-4 flex items-center justify-between text-[11px] text-slate-400 bg-slate-50/50">
                <span>Showing 1–{filteredEmails.length} of {filteredEmails.length}</span>
                <div className="flex items-center gap-3">
                  <span className="hover:text-slate-600 cursor-pointer">Newer</span>
                  <span className="hover:text-slate-600 cursor-pointer">Older</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compose Email Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in-0 zoom-in-95 flex flex-col">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <span className="font-bold text-sm">New Message</span>
              <button
                type="button"
                onClick={() => setIsComposeOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendCompose} className="p-5 space-y-3 text-xs flex-1 flex flex-col">
              <div>
                <input
                  type="email"
                  required
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  placeholder="To (recipients)"
                  className="w-full px-3 py-2 border-b border-slate-200 focus:outline-none focus:border-slate-900 font-medium text-xs"
                />
              </div>
              <div>
                <input
                  type="text"
                  required
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="Subject"
                  className="w-full px-3 py-2 border-b border-slate-200 focus:outline-none focus:border-slate-900 font-bold text-xs"
                />
              </div>
              <div className="flex-1 min-h-[160px]">
                <textarea
                  rows={8}
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Write your email here..."
                  className="w-full h-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900 resize-none text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button type="button" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500" title="Attach file">
                    <Paperclip className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsComposeOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition"
                  >
                    Send
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
