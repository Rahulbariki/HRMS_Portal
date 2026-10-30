import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search, MessageSquare, Plus, Send, X, ArrowLeft,
  Users, Hash, CheckCheck, Smile, Paperclip, Phone, Video,
  PhoneOff, Mic, MicOff, VideoOff, Download, Reply, MoreVertical,
  Check, Bell, Sparkles, FileText, Image as ImageIcon
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const QUICK_PROMPTS = [
  'Can we jump on a quick call? 📞',
  'Reviewing the updates now 👍',
  'Approved for release 🚀',
  'Please share the document 📄',
  'Thanks for the quick sync! 🙏'
];

const POPULAR_EMOJIS = ['👍', '❤️', '🔥', '🚀', '🎉', '😊', '👏', '✅', '👀', '💯'];

export default function EmployeeChat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'space' | 'dm'
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [directoryUsers, setDirectoryUsers] = useState([]);

  // Modals & Popovers
  const [isActionModalOpen, setIsActionModalOpen] = useState(false); // New DM or New Channel
  const [modalTab, setModalTab] = useState('dm'); // 'dm' | 'channel'
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDesc, setNewChannelDesc] = useState('');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [searchInThread, setSearchInThread] = useState(false);
  const [threadSearchQuery, setThreadSearchQuery] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  // File Attachment State
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef(null);

  // Call / Video Modal State
  const [activeCall, setActiveCall] = useState(null); // { type: 'audio' | 'video', status: 'connected' | 'ringing', timer: 0 }
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const callTimerRef = useRef(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch all conversations from backend
  const fetchConversations = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const myId = user?.id || '';
      const myEmail = user?.email || '';
      const res = await api.get(`/chat/conversations?userId=${encodeURIComponent(myId)}&userEmail=${encodeURIComponent(myEmail)}`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setConversations(res.data.data);
        if (!selectedChatId && window.innerWidth >= 768 && res.data.data.length > 0) {
          const defaultChat = res.data.data.find(c => c.id === 'space-general') || res.data.data[0];
          setSelectedChatId(defaultChat.id);
        }
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Fetch messages for active chat
  const fetchActiveMessages = async (chatId, silent = false) => {
    if (!chatId) return;
    try {
      const res = await api.get(`/chat/conversations/${chatId}/messages`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        const currentEmail = (user?.email || '').toLowerCase().trim();
        const currentName = (user?.name || '').toLowerCase().trim();
        const currentId = (user?.id || '').toLowerCase().trim();

        const mapped = res.data.data.map(m => {
          const senderEmail = (m.sender_email || '').toLowerCase().trim();
          const senderName = (m.sender_name || '').toLowerCase().trim();
          const senderId = (m.sender_id || '').toLowerCase().trim();

          const isMe = (currentEmail && senderEmail === currentEmail) || 
                       (currentId && senderId === currentId) ||
                       (currentName && senderName === currentName);
          return {
            id: m.id,
            sender: m.sender_name,
            senderEmail: m.sender_email,
            time: m.time || 'Now',
            content: m.content,
            isMe,
            attachmentUrl: m.attachment_url,
            attachmentName: m.attachment_name,
            attachmentType: m.attachment_type,
            reactions: m.reactions || []
          };
        });
        setMessages(mapped);
      }
    } catch (err) {
      console.error('Failed to load messages for conversation:', err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchConversations();
    api.get('/users/directory')
      .then(res => {
        if (res.data?.success && Array.isArray(res.data.data)) {
          const filtered = res.data.data.filter(u => u.email !== user?.email);
          setDirectoryUsers(filtered);
        }
      })
      .catch(() => {});
  }, [user?.id, user?.email]);

  // When selected chat changes, load its messages
  useEffect(() => {
    if (selectedChatId) {
      fetchActiveMessages(selectedChatId);
      setThreadSearchQuery('');
      setSearchInThread(false);
    } else {
      setMessages([]);
    }
  }, [selectedChatId]);

  // Live polling every 3 seconds for active conversation
  useEffect(() => {
    const timer = setInterval(() => {
      if (selectedChatId) {
        fetchActiveMessages(selectedChatId, true);
      }
      fetchConversations(true);
    }, 3000);
    return () => clearInterval(timer);
  }, [selectedChatId, user?.id, user?.email]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Call timer effect
  useEffect(() => {
    if (activeCall) {
      callTimerRef.current = setInterval(() => {
        setActiveCall(prev => prev ? { ...prev, timer: prev.timer + 1 } : null);
      }, 1000);
    } else {
      clearInterval(callTimerRef.current);
    }
    return () => clearInterval(callTimerRef.current);
  }, [activeCall?.status]);

  const activeChat = useMemo(() => {
    return conversations.find(c => c.id === selectedChatId) || null;
  }, [conversations, selectedChatId]);

  // Filtered conversations in sidebar
  const filteredConversations = useMemo(() => {
    return conversations.filter(c => {
      if (c.type === 'dm' && c.email && user?.email && c.email.toLowerCase().trim() === user.email.toLowerCase().trim()) {
        return false;
      }
      if (filterType === 'space' && c.type !== 'space') return false;
      if (filterType === 'dm' && c.type !== 'dm') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (c.name && c.name.toLowerCase().includes(q)) ||
               (c.last_message && c.last_message.toLowerCase().includes(q)) ||
               (c.designation && c.designation.toLowerCase().includes(q));
      }
      return true;
    });
  }, [conversations, filterType, searchQuery, user?.email]);

  // Filtered messages in active thread
  const displayedMessages = useMemo(() => {
    if (!threadSearchQuery.trim()) return messages;
    const q = threadSearchQuery.toLowerCase();
    return messages.filter(m => 
      m.content.toLowerCase().includes(q) || 
      (m.sender && m.sender.toLowerCase().includes(q))
    );
  }, [messages, threadSearchQuery]);

  // Send Message
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (isSending || (!messageInput.trim() && !selectedFile) || !activeChat) return;

    setIsSending(true);
    let text = messageInput.trim();
    if (replyingTo) {
      text = `> [Reply to ${replyingTo.sender}]: ${replyingTo.content.slice(0, 80)}\n${text}`;
    }

    let filePayload = {};
    if (selectedFile) {
      let attachmentUrl = '';
      if (selectedFile.file) {
        try {
          const formData = new FormData();
          formData.append('file', selectedFile.file);
          formData.append('title', selectedFile.name);
          formData.append('category', 'Chat');
          formData.append('uploadedBy', user?.name || 'Employee');
          const uploadRes = await api.post('/upload/document', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          attachmentUrl = uploadRes.data?.data?.file_url || '';
          if (!attachmentUrl) {
            throw new Error('Upload succeeded but no file URL returned');
          }
        } catch (uploadErr) {
          console.error('File upload failed:', uploadErr);
          alert('Failed to upload file attachment. Please try again.');
          setIsSending(false);
          return;
        }
      }
      if (selectedFile.preview) {
        URL.revokeObjectURL(selectedFile.preview);
      }
      filePayload = {
        attachmentUrl: attachmentUrl || '',
        attachmentName: selectedFile.name,
        attachmentType: selectedFile.type
      };
    }

    setMessageInput('');
    setSelectedFile(null);
    setReplyingTo(null);
    setIsEmojiPickerOpen(false);

    const optimisticMsg = {
      id: Date.now(),
      sender: user?.name || 'Me',
      senderEmail: user?.email || '',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: text || (filePayload.attachmentName ? `📎 ${filePayload.attachmentName}` : ''),
      isMe: true,
      ...filePayload
    };

    setMessages(prev => [...prev, optimisticMsg]);

    try {
      await api.post('/chat/messages', {
        conversationId: activeChat.id,
        content: text,
        senderName: user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Corporate Staff',
        senderEmail: user?.email || 'user@intelliattend.com',
        senderId: user?.id || null,
        ...filePayload
      });
      fetchActiveMessages(activeChat.id, true);
      fetchConversations(true);
    } catch (err) {
      console.error('Failed to post message:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Keyboard shortcut: Enter to send, Shift+Enter for new line
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Start direct message from modal
  const handleStartDmWithUser = (u) => {
    const myId = (user?.id || '').toLowerCase();
    const otherId = (u.id || '').toLowerCase();
    const canonicalId = myId && otherId ? `dm_${[myId, otherId].sort().join('_')}` : `dm-${otherId}`;

    const existing = conversations.find(c => c.id === canonicalId || (c.email && c.email.toLowerCase() === u.email.toLowerCase()));
    if (existing) {
      setSelectedChatId(existing.id);
    } else {
      const newDmConv = {
        id: canonicalId,
        type: 'dm',
        name: u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim(),
        initials: `${u.first_name?.[0] || u.name?.[0] || 'U'}${u.last_name?.[0] || ''}`.toUpperCase(),
        designation: u.designation || u.role || 'Colleague',
        email: u.email,
        avatar: u.avatar_url || null,
        is_online: true,
        last_time: 'Just now',
        last_message: 'Start a conversation',
        unread_count: 0
      };
      setConversations(prev => [newDmConv, ...prev]);
      setSelectedChatId(canonicalId);
    }
    setIsActionModalOpen(false);
  };

  // Create Channel
  const handleCreateChannel = async (e) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    try {
      const res = await api.post('/chat/conversations', {
        type: 'space',
        name: newChannelName.trim(),
        designation: newChannelDesc.trim() || 'Team Collaboration Channel',
      });

      if (res.data?.success && res.data.data) {
        setConversations(prev => [res.data.data, ...prev]);
        setSelectedChatId(res.data.data.id);
        setNewChannelName('');
        setNewChannelDesc('');
        setIsActionModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to create channel:', err);
    }
  };

  // File Picker Handler
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (selectedFile?.preview) {
        URL.revokeObjectURL(selectedFile.preview);
      }
      const isImg = file.type.startsWith('image/');
      setSelectedFile({
        file,
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        type: file.type,
        preview: isImg ? URL.createObjectURL(file) : null
      });
    }
  };

  const handleClearSelectedFile = () => {
    if (selectedFile?.preview) {
      URL.revokeObjectURL(selectedFile.preview);
    }
    setSelectedFile(null);
  };

  // Start Call
  const handleStartCall = (type) => {
    setActiveCall({
      type,
      status: 'connected',
      timer: 0,
      partner: activeChat?.name || 'Colleague'
    });
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="h-full min-h-[550px] flex-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex overflow-hidden">
      {/* 1. LEFT PANE: Conversations list */}
      <div className={clsx(
        'w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/40 dark:bg-slate-950/40',
        selectedChatId ? 'hidden md:flex' : 'flex'
      )}>
        {/* Left Pane Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white leading-none">
                Workspace Chat
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Real-time enterprise channels</p>
            </div>
          </div>
          <button
            onClick={() => {
              setModalTab('dm');
              setIsActionModalOpen(true);
            }}
            className="p-2 rounded-xl bg-slate-900 dark:bg-teal-600 text-white hover:bg-slate-800 dark:hover:bg-teal-500 transition cursor-pointer shadow-xs flex items-center gap-1.5 text-xs font-semibold"
            title="Start conversation or channel"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New</span>
          </button>
        </div>

        {/* Search & Filter bar */}
        <div className="p-3 border-b border-slate-200/60 dark:border-slate-800/60 space-y-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search channels or colleagues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {[
              { id: 'all', label: 'All' },
              { id: 'space', label: 'Channels #' },
              { id: 'dm', label: 'Direct Messages @' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={clsx(
                  'px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer',
                  filterType === f.id
                    ? 'bg-slate-900 dark:bg-teal-600 text-white shadow-2xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation List Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading channels...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No conversations found.</div>
          ) : (
            filteredConversations.map((c) => {
              const isSelected = selectedChatId === c.id;
              const isSpace = c.type === 'space';
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedChatId(c.id)}
                  className={clsx(
                    'p-3.5 flex items-start gap-3 cursor-pointer transition relative',
                    isSelected
                      ? 'bg-white dark:bg-slate-800/80 shadow-xs'
                      : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                  )}
                >
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 rounded-r-md" />
                  )}

                  {/* Avatar / Channel Icon */}
                  <div className="relative shrink-0">
                    {isSpace ? (
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                        <Hash className="w-4 h-4" />
                      </div>
                    ) : c.avatar ? (
                      <img src={c.avatar} alt={c.name} className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700" />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-slate-800 dark:bg-teal-700 text-white font-bold flex items-center justify-center text-xs">
                        {c.initials || 'DM'}
                      </div>
                    )}
                    {c.is_online && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className={clsx(
                        'text-xs truncate font-semibold',
                        isSelected ? 'text-teal-950 dark:text-teal-300 font-bold' : 'text-slate-900 dark:text-white'
                      )}>
                        {c.name}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                        {c.last_time || ''}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {c.last_message || 'Start conversation...'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. RIGHT PANE: Chat thread */}
      <div className={clsx(
        'flex-1 flex flex-col bg-white dark:bg-slate-900 min-w-0',
        selectedChatId ? 'flex' : 'hidden md:flex'
      )}>
        {activeChat ? (
          <>
            {/* Active Chat Header */}
            <div className="h-16 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-white dark:bg-slate-900 z-10 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setSelectedChatId(null)}
                  className="md:hidden p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 cursor-pointer"
                  title="Back to conversations"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="relative shrink-0">
                  {activeChat.type === 'space' ? (
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                      <Hash className="w-4 h-4" />
                    </div>
                  ) : activeChat.avatar ? (
                    <img src={activeChat.avatar} alt={activeChat.name} className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700" />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-slate-800 dark:bg-teal-700 text-white font-bold flex items-center justify-center text-xs">
                      {activeChat.initials || 'DM'}
                    </div>
                  )}
                  {activeChat.is_online && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate flex items-center gap-2">
                    {activeChat.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                    <span>{activeChat.designation || (activeChat.type === 'space' ? 'Company Channel' : 'Active Colleague')}</span>
                  </p>
                </div>
              </div>

              {/* Action buttons in Chat Header */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setSearchInThread(!searchInThread)}
                  className={clsx(
                    'p-2 rounded-xl transition cursor-pointer',
                    searchInThread
                      ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                  title="Search inside this thread"
                >
                  <Search className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleStartCall('audio')}
                  className="p-2 rounded-xl text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Start Voice Call"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleStartCall('video')}
                  className="p-2 rounded-xl text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Start Video Meeting"
                >
                  <Video className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* In-Thread Search Bar Banner */}
            {searchInThread && (
              <div className="p-2.5 px-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter messages in this conversation..."
                  value={threadSearchQuery}
                  onChange={(e) => setThreadSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                  autoFocus
                />
                {threadSearchQuery && (
                  <button
                    onClick={() => setThreadSearchQuery('')}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Messages Thread Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/40">
              <div className="flex justify-center my-2">
                <span className="px-3 py-1 rounded-full bg-slate-200/60 dark:bg-slate-800 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-teal-500" />
                  Live End-to-End Synced Thread
                </span>
              </div>

              {displayedMessages.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {threadSearchQuery ? 'No matching messages found' : 'No messages yet'}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {threadSearchQuery ? 'Try another keyword' : 'Send a message below to start this live chat'}
                  </p>
                </div>
              ) : (
                displayedMessages.map((m) => (
                  <div
                    key={m.id}
                    className={clsx(
                      'flex flex-col group relative',
                      m.isMe ? 'items-end' : 'items-start'
                    )}
                  >
                    {!m.isMe && (
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 ml-1 flex items-center gap-1.5">
                        <span>{m.sender}</span>
                      </span>
                    )}

                    <div className="relative max-w-md">
                      {/* Message Bubble */}
                      <div
                        className={clsx(
                          'px-4 py-2.5 rounded-2xl text-xs break-words shadow-2xs',
                          m.isMe
                            ? 'bg-slate-900 dark:bg-teal-600 text-white rounded-br-xs'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-bl-xs'
                        )}
                      >
                        {/* If quoted reply */}
                        {m.content.startsWith('> [Reply to') ? (
                          <div className="mb-2 pb-2 border-b border-white/20 dark:border-slate-700 text-[11px] opacity-80 italic">
                            {m.content.split('\n')[0]}
                          </div>
                        ) : null}

                        <p className="leading-relaxed whitespace-pre-wrap">
                          {m.content.startsWith('> [Reply to') 
                            ? m.content.split('\n').slice(1).join('\n') 
                            : m.content}
                        </p>

                        {/* File Attachment Card */}
                        {m.attachmentUrl && (
                          <div className="mt-2.5 p-2 rounded-xl bg-black/10 dark:bg-black/30 border border-white/10 flex items-center gap-2.5">
                            {m.attachmentType?.startsWith('image/') ? (
                              <img src={m.attachmentUrl} alt="Attachment" className="w-12 h-12 object-cover rounded-lg" />
                            ) : (
                              <div className="p-2 rounded-lg bg-teal-500/20 text-teal-300">
                                <FileText className="w-5 h-5" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-semibold truncate">{m.attachmentName || 'Attachment'}</p>
                              <a
                                href={m.attachmentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-teal-300 dark:text-teal-200 hover:underline flex items-center gap-1 mt-0.5"
                              >
                                <Download className="w-3 h-3" /> Download / View
                              </a>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Hover Action Bar (Reply & Quick Reactions) */}
                      <div className={clsx(
                        'absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-2 py-0.5 shadow-md z-10',
                        m.isMe ? '-left-24' : '-right-24'
                      )}>
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingTo(m);
                            inputRef.current?.focus();
                          }}
                          className="p-1 hover:text-teal-600 dark:hover:text-teal-400 text-slate-400 transition"
                          title="Reply"
                        >
                          <Reply className="w-3.5 h-3.5" />
                        </button>
                        {['👍', '❤️', '🚀'].map(emoji => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => {
                              setMessageInput(prev => `${prev} ${emoji}`);
                              inputRef.current?.focus();
                            }}
                            className="text-xs hover:scale-125 transition-transform"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 dark:text-slate-500 px-1">
                      <span>{m.time}</span>
                      {m.isMe && <CheckCheck className="w-3 h-3 text-teal-500" />}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Bar */}
            <div className="px-4 py-1.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/60 flex items-center gap-1.5 overflow-x-auto text-nowrap scrollbar-none">
              <span className="text-[10px] text-slate-400 font-medium shrink-0">Quick reply:</span>
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setMessageInput(prompt);
                    inputRef.current?.focus();
                  }}
                  className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-400 transition shrink-0 cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Replying banner */}
            {replyingTo && (
              <div className="px-4 py-2 bg-teal-50/80 dark:bg-teal-950/40 border-t border-teal-200 dark:border-teal-800/60 flex items-center justify-between text-xs text-teal-800 dark:text-teal-300">
                <div className="flex items-center gap-2 truncate">
                  <Reply className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Replying to <strong>{replyingTo.sender}</strong>: &quot;{replyingTo.content.slice(0, 60)}&quot;</span>
                </div>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="text-teal-600 dark:text-teal-400 hover:text-teal-800 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Attachment preview banner */}
            {selectedFile && (
              <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedFile.name}</span>
                  <span className="text-[10px] text-slate-400">({selectedFile.size})</span>
                </div>
                <button
                  onClick={handleClearSelectedFile}
                  className="text-slate-400 hover:text-rose-500 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Bottom Message Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 relative">
              {/* File Attachment Button */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Attach file or photo"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Emoji Picker Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>

                {/* Emoji Popover */}
                {isEmojiPickerOpen && (
                  <div className="absolute bottom-full left-0 mb-2 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-30 grid grid-cols-5 gap-1.5 w-44">
                    {POPULAR_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setMessageInput(prev => `${prev}${emoji}`);
                          setIsEmojiPickerOpen(false);
                          inputRef.current?.focus();
                        }}
                        className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-base transition cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Text Input */}
              <input
                ref={inputRef}
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Type a message in ${activeChat.name}... (Press Enter to send)`}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />

              <button
                type="submit"
                disabled={isSending || (!messageInput.trim() && !selectedFile)}
                className="p-2.5 rounded-xl bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 text-white transition disabled:opacity-40 cursor-pointer shadow-sm shrink-0"
              >
                <Send className="w-4 h-4 text-teal-400 dark:text-white" />
              </button>
            </form>
          </>
        ) : (
          /* Empty selection state */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/20 dark:bg-slate-950/20">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4 shadow-sm">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">
              No Conversation Selected
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed mb-4">
              Select a team space or direct message from the left list, or start a new conversation.
            </p>
            <button
              onClick={() => {
                setModalTab('dm');
                setIsActionModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-teal-600 text-white text-xs font-semibold hover:bg-slate-800 dark:hover:bg-teal-500 transition cursor-pointer shadow-sm"
            >
              Start New Message
            </button>
          </div>
        )}
      </div>

      {/* 3. CALL / VIDEO MEETING MODAL */}
      {activeCall && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-800 w-full max-w-md overflow-hidden flex flex-col items-center p-8 animate-in fade-in-0 zoom-in-95">
            <div className="relative mb-5">
              <div className="w-24 h-24 rounded-full bg-teal-500/20 border-2 border-teal-500/40 flex items-center justify-center animate-pulse">
                <div className="w-16 h-16 rounded-full bg-teal-500 flex items-center justify-center text-white text-xl font-bold">
                  {activeCall.partner.slice(0, 2).toUpperCase()}
                </div>
              </div>
              <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900" />
            </div>

            <h3 className="text-lg font-bold mb-1">{activeCall.partner}</h3>
            <p className="text-xs text-teal-400 font-medium mb-2">
              {activeCall.type === 'video' ? 'IntelliAttend HD Video Meeting' : 'Encrypted Voice Call'}
            </p>
            <div className="px-3 py-1 rounded-full bg-slate-800 font-mono text-xs text-slate-300 mb-8">
              {formatTimer(activeCall.timer)}
            </div>

            {/* Video View Placeholder if video call */}
            {activeCall.type === 'video' && !isVideoOff && (
              <div className="w-full h-36 rounded-2xl bg-slate-800 mb-6 flex items-center justify-center text-slate-500 text-xs border border-slate-700">
                <Video className="w-6 h-6 mr-2 text-teal-400" /> Camera Feed Connected
              </div>
            )}

            {/* Call Controls */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className={clsx(
                  'w-12 h-12 rounded-full flex items-center justify-center transition cursor-pointer',
                  isMuted ? 'bg-rose-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                )}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {activeCall.type === 'video' && (
                <button
                  type="button"
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  className={clsx(
                    'w-12 h-12 rounded-full flex items-center justify-center transition cursor-pointer',
                    isVideoOff ? 'bg-rose-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  )}
                  title={isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
                >
                  {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveCall(null)}
                className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center transition shadow-lg shadow-rose-600/30 cursor-pointer"
                title="End Call"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. NEW MESSAGE OR NEW CHANNEL MODAL */}
      {isActionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in-0 zoom-in-95 flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {modalTab === 'dm' ? (
                  <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                ) : (
                  <Hash className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                )}
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {modalTab === 'dm' ? 'Start Direct Message' : 'Create Team Channel'}
                </h3>
              </div>
              <button
                onClick={() => setIsActionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 pt-2">
              <button
                type="button"
                onClick={() => setModalTab('dm')}
                className={clsx(
                  'px-4 py-2 text-xs font-bold border-b-2 transition cursor-pointer',
                  modalTab === 'dm'
                    ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                Direct Message (@)
              </button>
              <button
                type="button"
                onClick={() => setModalTab('channel')}
                className={clsx(
                  'px-4 py-2 text-xs font-bold border-b-2 transition cursor-pointer',
                  modalTab === 'channel'
                    ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                New Channel (#)
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4">
              {modalTab === 'dm' ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Select any colleague from your workspace directory:</p>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
                    {directoryUsers.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => handleStartDmWithUser(u)}
                        className="p-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition"
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-800 dark:bg-teal-700 text-white font-bold flex items-center justify-center text-xs">
                          {`${u.first_name?.[0] || ''}${u.last_name?.[0] || ''}`.toUpperCase() || 'EM'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {u.name || `${u.first_name} ${u.last_name}`}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">{u.designation || u.role} • {u.department || 'Corporate'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateChannel} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Channel Name
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">#</span>
                      <input
                        type="text"
                        required
                        placeholder="e.g. product-release, security-audit"
                        value={newChannelName}
                        onChange={(e) => setNewChannelName(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Topic or Description (Optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="What is this channel about?"
                      value={newChannelDesc}
                      onChange={(e) => setNewChannelDesc(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsActionModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newChannelName.trim()}
                      className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 text-white font-bold disabled:opacity-50 transition cursor-pointer"
                    >
                      Create Channel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
