import { useState } from 'react';
import {
  Newspaper, Search, Calendar, Tag, Sparkles,
  Megaphone, ExternalLink, ArrowRight, X, Clock, Users
} from 'lucide-react';
import clsx from 'clsx';

const ANNOUNCEMENTS = [
  {
    id: 1,
    title: 'Q4 2026 Global Townhall & Strategy Alignment',
    category: 'Townhall',
    date: 'Oct 28, 2026',
    readTime: '3 min read',
    author: 'Executive Leadership',
    pinned: true,
    summary: 'Join leadership for the upcoming quarterly townhall addressing company milestones, international expansion, and FY27 roadmap.',
    content: `
      <p>Dear Team,</p>
      <p>We are excited to invite all team members across departments to our upcoming <strong>Q4 2026 Global Townhall</strong>. Leadership will present high-level updates on organizational velocity, customer adoption metrics, and key initiatives for the upcoming fiscal cycle.</p>
      <br/>
      <h4>Agenda Overview:</h4>
      <ul>
        <li>• Performance and milestone highlights across engineering and product.</li>
        <li>• Infrastructure and compliance certifications update (ISO 27001 & SOC2 Type II).</li>
        <li>• Open Q&A session with executive leadership and team recognition awards.</li>
      </ul>
      <br/>
      <p>Attendance is encouraged for all personnel. A recorded session will be published to the knowledge base afterwards.</p>
    `
  },
  {
    id: 2,
    title: 'Annual Festival Holiday Schedule & Workplace Protocols',
    category: 'HR Updates',
    date: 'Oct 24, 2026',
    readTime: '2 min read',
    author: 'People & Culture',
    pinned: false,
    summary: 'Official notification regarding the upcoming gazetted holidays, shift roster adjustments, and emergency operational support.',
    content: `
      <p>Dear Employees,</p>
      <p>In accordance with the 2026 statutory holiday calendar, corporate offices will observe mandatory gazetted holidays as published under the Holidays tab.</p>
      <br/>
      <p>For departments supporting round-the-clock enterprise infrastructure, emergency on-call rosters have been published by respective engineering managers. Compensatory off balances will be credited automatically for on-call personnel.</p>
    `
  },
  {
    id: 3,
    title: 'Enhanced Group Health Insurance & Wellness Coverage 2026-27',
    category: 'Benefits',
    date: 'Oct 15, 2026',
    readTime: '4 min read',
    author: 'Finance & Benefits Treasury',
    pinned: false,
    summary: 'Rollout of enhanced cashless hospitalization limits, dental OPD coverage, and digital mental health counseling benefits.',
    content: `
      <p>Team,</p>
      <p>We are delighted to announce that our annual Group Medical Cover (GMC) policy has been refreshed with enhanced family floater coverage up to ₹7,50,000 per annum, with cashless network access across 8,500+ accredited hospitals nationwide.</p>
      <br/>
      <p>Digital e-cards are accessible under your Documents & Benefits tab, and dependants can be updated during the annual open enrollment window.</p>
    `
  },
  {
    id: 4,
    title: 'ISO 27001 & SOC2 Type II Security Recertification Achieved',
    category: 'Milestones',
    date: 'Oct 05, 2026',
    readTime: '2 min read',
    author: 'SecOps & Compliance',
    pinned: false,
    summary: 'IntelliAttend successfully concludes annual external compliance audit with zero non-conformity findings.',
    content: `
      <p>Congratulations to the engineering, operations, and IT security teams for successfully completing our rigorous external audit cycle.</p>
      <br/>
      <p>This achievement reinforces our steadfast dedication to enterprise-grade confidentiality, data sovereignty, and infrastructure security for all clients.</p>
    `
  }
];

export default function EmployeeNews() {
  const [news, setNews] = useState(ANNOUNCEMENTS);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeArticle, setActiveArticle] = useState(null);

  const categories = ['All', 'Townhall', 'HR Updates', 'Benefits', 'Milestones'];

  const filteredNews = news.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.summary.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">Company News & Announcements</h1>
          <p className="text-sm text-slate-500 mt-1">
            Stay updated with organization milestones, corporate townhalls, and HR policy notices
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search announcements..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={clsx(
                'px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer',
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNews.map((item) => (
          <div
            key={item.id}
            className={clsx(
              'bg-white rounded-2xl border p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between',
              item.pinned ? 'border-teal-400/80 ring-1 ring-teal-500/20' : 'border-slate-200'
            )}
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200/60">
                  {item.category}
                </span>
                {item.pinned && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    <Megaphone className="w-3 h-3" /> Pinned
                  </span>
                )}
              </div>

              <h3 className="font-bold text-slate-900 text-base mt-3 line-clamp-2">{item.title}</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-3">{item.summary}</p>

              <div className="flex items-center gap-3 text-xs text-slate-400 mt-5 pt-3 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{item.date}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{item.readTime}</span>
                </span>
                <span>•</span>
                <span className="text-slate-600 font-semibold">{item.author}</span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setActiveArticle(item)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 cursor-pointer"
              >
                <span>Read Full Notice</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Article Detail Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                  {activeArticle.category} • {activeArticle.date}
                </span>
                <h3 className="font-bold text-slate-900 text-lg mt-1">{activeArticle.title}</h3>
              </div>
              <button onClick={() => setActiveArticle(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: activeArticle.content }} />
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Published by {activeArticle.author}</span>
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer"
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