import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Search, Filter, Bell, MessageSquare, Mail as MailIcon,
  Plus, Home, AtSign, Star, Archive, ChevronDown, Send,
  Paperclip, Smile, Phone, Video, Info, MoreVertical, X,
  CheckCheck
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext';

const INITIAL_CONVERSATIONS = [
  {
    id: 'space-sec',
    type: 'space',
    name: 'Team SEC Nandyal',
    initials: 'TS',
    avatar: null,
    isOnline: true,
    lastTime: '6:30 pm',
    lastMessage: 'Today I worked on the tenant management mod...',
    unreadCount: 2,
    messages: [
      {
        id: 1,
        sender: 'Aditya Dhiman',
        time: '6:15 pm',
        content: 'Team, please post your daily EOD updates and commit references before logging off.',
        isMe: false,
      },
      {
        id: 2,
        sender: 'Rahul Bariki',
        time: '6:30 pm',
        content: 'Today I worked on the tenant management module, regularizations flow, and tested the biometric attendance components.',
        isMe: true,
      },
    ],
  },
  {
    id: 'dm-aditya',
    type: 'dm',
    name: 'Aditya Dhiman',
    designation: 'Lead Engineering Manager',
    initials: 'AD',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    isOnline: true,
    lastTime: '11:55 am',
    lastMessage: 'Ok Sir got it. Thank you Sir.',
    unreadCount: 0,
    messages: [
      {
        id: 1,
        sender: 'Aditya Dhiman',
        time: '11:45 am',
        content: 'Rahul, please verify the Org Chart branches and make sure pan/zoom works smoothly on high DPI displays.',
        isMe: false,
      },
      {
        id: 2,
        sender: 'Rahul Bariki',
        time: '11:55 am',
        content: 'Ok Sir got it. Thank you Sir. Working on it now.',
        isMe: true,
      },
    ],
  },
  {
    id: 'dm-subhashree',
    type: 'dm',
    name: 'SUBHASHREE A',
    designation: 'Software Engineer',
    initials: 'SA',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    isOnline: false,
    lastTime: '16 Oct',
    lastMessage: 'Ok',
    unreadCount: 0,
    messages: [
      {
        id: 1,
        sender: 'Rahul Bariki',
        time: '16 Oct, 03:20 pm',
        content: 'Shared the Figma design tokens for the task status badges.',
        isMe: true,
      },
      {
        id: 2,
        sender: 'SUBHASHREE A',
        time: '16 Oct, 03:22 pm',
        content: 'Ok, pulling them now.',
        isMe: false,
      },
    ],
  },
  {
    id: 'dm-jeevan',
    type: 'dm',
    name: 'Jeevanandhan Senthil',
    designation: 'Software Engineer',
    initials: 'JS',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    isOnline: true,
    lastTime: '15 Oct',
    lastMessage: 'Started a chat',
    unreadCount: 0,
    messages: [
      {
        id: 1,
        sender: 'Jeevanandhan Senthil',
        time: '15 Oct, 10:00 am',
        content: 'Hey Rahul, let me know if you need help with the attendance webhook endpoints.',
        isMe: false,
      },
    ],
  },
  {
    id: 'dm-test',
    type: 'dm',
    name: 'test employee',
    designation: 'QA Tester',
    initials: 'te',
    avatar: null,
    isOnline: false,
    lastTime: '12 Oct',
    lastMessage: 'Started a chat',
    unreadCount: 0,
    messages: [],
  },
  {
    id: 'dm-shubham',
    type: 'dm',
    name: 'Shubham Thakur',
    designation: 'Frontend Engineer',
    initials: 'ST',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    isOnline: true,
    lastTime: '10 Oct',
    lastMessage: 'Started a chat',
    unreadCount: 0,
    messages: [],
  },
  {
    id: 'dm-nishant',
    type: 'dm',
    name: 'NISHANT .',
    designation: 'Intern',
    initials: 'N',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    isOnline: false,
    lastTime: '08 Oct',
    lastMessage: 'Started a chat',
    unreadCount: 0,
    messages: [],
  },
  {
    id: 'dm-aamir',
    type: 'dm',
    name: 'Aamir Rashid',
    designation: 'Intern',
    initials: 'AR',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    isOnline: false,
    lastTime: '06 Oct',
    lastMessage: 'Started a chat',
    unreadCount: 0,
    messages: [],
  },
  {
    id: 'dm-aryan',
    type: 'dm',
    name: 'Aryan Maurya',
    designation: 'Intern',
    initials: 'AM',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    isOnline: false,
    lastTime: '04 Oct',
    lastMessage: 'Started a chat',
    unreadCount: 0,
    messages: [],
  },
  {
    id: 'dm-ansu',
    type: 'dm',
    name: 'Ansu Shekhar',
    designation: 'Intern',
    initials: 'AS',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    isOnline: false,
    lastTime: '02 Oct',
    lastMessage: 'Started a chat',
    unreadCount: 0,
    messages: [],
  },
];

export default function EmployeeChat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [selectedChatId, setSelectedChatId] = useState(null); // default null to match Screenshot 5 "No conversation selected"
  const [activeShortcut, setActiveShortcut] = useState('home');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

  const [presence, setPresence] = useState('Active');
  const [presenceOpen, setPresenceOpen] = useState(false);

  const messagesEndRef = useRef(null);

  const activeChat = useMemo(() => {
    return conversations.find(c => c.id === selectedChatId);
  }, [conversations, selectedChatId]);

  // Scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages]);

  const filteredConversations = useMemo(() => {
    return conversations.filter(c => {
      if (unreadOnly && c.unreadCount === 0) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q);
      }
      return true;
    });
  }, [conversations, unreadOnly, searchQuery]);

  const directMessages = useMemo(() => {
    return filteredConversations.filter(c => c.type === 'dm');
  }, [filteredConversations]);

  const spaces = useMemo(() => {
    return filteredConversations.filter(c => c.type === 'space');
  }, [filteredConversations]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChat) return;

    const newMsg = {
      id: Date.now(),
      sender: user?.name || 'Rahul Bariki',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: messageInput.trim(),
      isMe: true,
    };

    const updated = {
      ...activeChat,
      lastMessage: messageInput.trim(),
      lastTime: 'Just now',
      unreadCount: 0,
      messages: [...(activeChat.messages || []), newMsg],
    };

    setConversations(conversations.map(c => (c.id === updated.id ? updated : c)));
    setMessageInput('');
  };

  const handleSelectChat = (chatId) => {
    setSelectedChatId(chatId);
    // Mark as read
    setConversations(conversations.map(c =>
      c.id === chatId ? { ...c, unreadCount: 0 } : c
    ));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden select-none">
      {/* Top Application Header matching Screenshot 5 */}
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
              SHNOOR INTERNATIONAL LLC
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white font-bold text-[10px]">
              Chat
            </span>
          </div>
        </div>

        {/* Center Search in Chat */}
        <div className="flex-1 max-w-md mx-2 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chat"
              className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder:text-slate-400"
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
            className="hidden lg:inline-flex items-center px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition cursor-pointer shadow-2xs"
          >
            Enable chat notifications
          </button>

          {/* User profile */}
          <div className="flex items-center gap-2 pl-1">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
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

      {/* Main Chat Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Leftmost Navigation Rail (Mail / Chat switcher) */}
        <div className="w-16 bg-slate-50 border-r border-slate-200 flex flex-col items-center py-4 gap-4 flex-shrink-0">
          <Link
            to="/employee/mail"
            className="w-10 h-10 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex flex-col items-center justify-center font-medium text-[10px] transition"
            title="Mail"
          >
            <MailIcon className="w-4 h-4 mb-0.5" />
            <span>Mail</span>
          </Link>
          <Link
            to="/employee/chat"
            className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex flex-col items-center justify-center font-bold text-[10px] transition shadow-xs"
            title="Chat"
          >
            <MessageSquare className="w-4 h-4 mb-0.5" />
            <span>Chat</span>
          </Link>
        </div>

        {/* Conversations Column matching Screenshot 5 */}
        <div className="w-72 lg:w-80 border-r border-slate-200 bg-white flex flex-col overflow-hidden flex-shrink-0">
          {/* Subheader: Home, Unread toggle */}
          <div className="p-4 pb-2 flex items-center justify-between border-b border-slate-100">
            <h2 className="font-display font-bold text-sm text-slate-900">Home</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Unread</span>
              <button
                type="button"
                onClick={() => setUnreadOnly(!unreadOnly)}
                className={clsx(
                  'w-8 h-4 rounded-full transition-colors relative cursor-pointer',
                  unreadOnly ? 'bg-amber-500' : 'bg-slate-300'
                )}
              >
                <span
                  className={clsx(
                    'w-3.5 h-3.5 rounded-full bg-white absolute top-0.25 transition-transform shadow-xs',
                    unreadOnly ? 'translate-x-4' : 'translate-x-0.5'
                  )}
                />
              </button>
            </div>
          </div>

          <div className="p-3 border-b border-slate-100 space-y-2">
            {/* Search chat or people */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chat or people..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder:text-slate-400"
              />
            </div>

            {/* + New chat button */}
            <button
              type="button"
              onClick={() => setIsNewChatModalOpen(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 hover:border-amber-400 bg-white hover:bg-amber-50/50 text-slate-800 font-bold text-xs shadow-xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-600" />
              <span>New chat</span>
            </button>
          </div>

          {/* Scrollable list of Shortcuts, Direct Messages, Spaces */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {/* SHORTCUTS */}
            <div className="p-2 space-y-0.5">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                SHORTCUTS
              </div>
              {[
                { id: 'home', label: 'Home', icon: Home },
                { id: 'mentions', label: 'Mentions', icon: AtSign },
                { id: 'starred', label: 'Starred', icon: Star },
                { id: 'archived', label: 'Archived', icon: Archive },
              ].map((sc) => {
                const Icon = sc.icon;
                const isActive = activeShortcut === sc.id;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => setActiveShortcut(sc.id)}
                    className={clsx(
                      'w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer',
                      isActive
                        ? 'bg-amber-50/80 text-amber-900 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    )}
                  >
                    <Icon className={clsx('w-3.5 h-3.5', isActive ? 'text-amber-600' : 'text-slate-400')} />
                    <span>{sc.label}</span>
                  </button>
                );
              })}
            </div>

            {/* DIRECT MESSAGES 125 */}
            <div className="p-2 space-y-1">
              <div className="flex items-center justify-between px-3 py-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  DIRECT MESSAGES 125
                </span>
                <button
                  type="button"
                  onClick={() => setIsNewChatModalOpen(true)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                  title="New message"
                >
                  +
                </button>
              </div>

              <div className="space-y-0.5">
                {directMessages.map((dm) => {
                  const isSelected = selectedChatId === dm.id;
                  return (
                    <div
                      key={dm.id}
                      onClick={() => handleSelectChat(dm.id)}
                      className={clsx(
                        'flex items-center gap-2.5 p-2 rounded-xl transition cursor-pointer select-none group',
                        isSelected
                          ? 'bg-amber-50/90 text-amber-950 font-semibold'
                          : 'hover:bg-slate-50 text-slate-700'
                      )}
                    >
                      {/* Avatar with online dot */}
                      <div className="relative flex-shrink-0">
                        {dm.avatar ? (
                          <img
                            src={dm.avatar}
                            alt={dm.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-[11px]">
                            {dm.initials}
                          </div>
                        )}
                        {dm.isOnline && (
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white absolute -bottom-0.5 -right-0.5" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-xs text-slate-900 truncate">
                            {dm.name}
                          </p>
                          <span className="text-[10px] text-slate-400 ml-1 flex-shrink-0">
                            {dm.lastTime}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {dm.lastMessage}
                        </p>
                      </div>

                      {dm.unreadCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                          {dm.unreadCount}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Show all (125) link */}
              <div className="px-3 py-1">
                <button
                  type="button"
                  className="text-xs font-semibold text-amber-600 hover:text-amber-700 cursor-pointer"
                >
                  Show all (125)
                </button>
              </div>
            </div>

            {/* SPACES 1 */}
            <div className="p-2 space-y-1">
              <div className="flex items-center justify-between px-3 py-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  SPACES 1
                </span>
              </div>

              <div className="space-y-0.5">
                {spaces.map((sp) => {
                  const isSelected = selectedChatId === sp.id;
                  return (
                    <div
                      key={sp.id}
                      onClick={() => handleSelectChat(sp.id)}
                      className={clsx(
                        'flex items-center gap-2.5 p-2 rounded-xl transition cursor-pointer select-none group',
                        isSelected
                          ? 'bg-amber-50/90 text-amber-950 font-semibold'
                          : 'hover:bg-slate-50 text-slate-700'
                      )}
                    >
                      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs flex-shrink-0 border border-amber-200">
                        {sp.initials}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-xs text-slate-900 truncate">
                            {sp.name}
                          </p>
                          <span className="text-[10px] text-slate-400 ml-1 flex-shrink-0">
                            {sp.lastTime}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {sp.lastMessage}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Main Pane (Placeholder or Active Conversation) */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {activeChat ? (
            /* Active Conversation View */
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Conversation Header */}
              <div className="h-16 border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0 bg-white">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {activeChat.avatar ? (
                      <img
                        src={activeChat.avatar}
                        alt={activeChat.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                        {activeChat.initials}
                      </div>
                    )}
                    {activeChat.isOnline && (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white absolute -bottom-0.5 -right-0.5" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm text-slate-900">
                      {activeChat.name}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {activeChat.isOnline ? 'Online now' : 'Last active recently'}
                    </p>
                  </div>
                </div>

                {/* Right call & info buttons */}
                <div className="flex items-center gap-1">
                  <button type="button" className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition" title="Start voice call">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button type="button" className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition" title="Start video call">
                    <Video className="w-4 h-4" />
                  </button>
                  <button type="button" className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition" title="Conversation info">
                    <Info className="w-4 h-4" />
                  </button>
                  <button type="button" className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition" title="Options">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Message Stream */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/40">
                {activeChat.messages && activeChat.messages.length > 0 ? (
                  activeChat.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={clsx('flex flex-col', msg.isMe ? 'items-end' : 'items-start')}
                    >
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-[11px] font-bold text-slate-700">
                          {msg.isMe ? 'You' : msg.sender}
                        </span>
                        <span className="text-[10px] text-slate-400">{msg.time}</span>
                      </div>
                      <div
                        className={clsx(
                          'max-w-md px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs',
                          msg.isMe
                            ? 'bg-amber-500 text-white rounded-tr-xs'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                        )}
                      >
                        {msg.content}
                      </div>
                      {msg.isMe && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                          <span>Delivered</span>
                          <CheckCheck className="w-3 h-3 text-amber-600" />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    Start a conversation with {activeChat.name}.
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                <button type="button" className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition" title="Add attachment">
                  <Paperclip className="w-4 h-4" />
                </button>
                <button type="button" className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition" title="Emoji">
                  <Smile className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`Message ${activeChat.name}...`}
                  className="flex-1 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="p-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            /* No conversation selected View matching Screenshot 5 exactly */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
              {/* Cute illustration matching Screenshot 5 */}
              <div className="w-32 h-32 mb-6 relative flex items-center justify-center">
                <svg
                  className="w-28 h-28 text-slate-800"
                  viewBox="0 0 120 120"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Chat bubble 1 */}
                  <rect
                    x="24"
                    y="20"
                    width="60"
                    height="42"
                    rx="8"
                    stroke="#1e293b"
                    strokeWidth="2.5"
                    fill="white"
                  />
                  <line x1="34" y1="32" x2="68" y2="32" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="34" y1="42" x2="56" y2="42" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M40 62 L32 72 L48 62 Z" fill="white" stroke="#1e293b" strokeWidth="2.5" />

                  {/* Chat bubble 2 (yellow) */}
                  <circle cx="36" cy="68" r="14" fill="#fbbf24" stroke="#1e293b" strokeWidth="2.5" />
                  <line x1="30" y1="66" x2="42" y2="66" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
                  <line x1="30" y1="71" x2="42" y2="71" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />

                  {/* Hand pointing */}
                  <path
                    d="M62 76 C62 72 65 68 68 68 C71 68 74 72 74 76 L74 62 C74 58 78 56 80 58 C82 60 82 64 82 68 L82 82 C82 92 76 100 66 100 L56 100 C50 100 48 94 52 88 L58 80 Z"
                    fill="#b45309"
                    stroke="#1e293b"
                    strokeWidth="2.5"
                  />
                </svg>
              </div>

              {/* Title & Subtitle matching Screenshot 5 */}
              <h2 className="font-display font-bold text-lg text-slate-900 mb-1">
                No conversation selected
              </h2>
              <p className="font-body text-xs text-slate-500 max-w-sm leading-relaxed">
                Use the toggle to switch between single and split pane modes, or pick a conversation from the list to start messaging.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in-0 zoom-in-95">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <span className="font-bold text-sm">Start a Conversation</span>
              <button
                type="button"
                onClick={() => setIsNewChatModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <p className="text-slate-500">Select an employee from your workspace directory:</p>
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {directMessages.map((dm) => (
                  <div
                    key={dm.id}
                    onClick={() => {
                      handleSelectChat(dm.id);
                      setIsNewChatModalOpen(false);
                    }}
                    className="flex items-center gap-3 py-2.5 px-2 hover:bg-slate-50 rounded-xl cursor-pointer"
                  >
                    {dm.avatar ? (
                      <img src={dm.avatar} alt={dm.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs">
                        {dm.initials}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-slate-900">{dm.name}</p>
                      <p className="text-[10px] text-slate-400">{dm.designation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
