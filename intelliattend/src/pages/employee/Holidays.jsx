import { useState, useMemo, useEffect } from 'react';
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight,
  Search, Info, Sparkles, X, MapPin, Clock, Loader2
} from 'lucide-react';
import clsx from 'clsx';
import api from '../../services/api';


// Comprehensive 2026 Holiday Schedule
const HOLIDAYS_DATA = [
  {
    id: 1,
    name: "New Year's Day",
    date: '2026-01-01',
    day: 'Thursday',
    month: 0, // Jan
    year: 2026,
    type: 'National Holiday',
    description: 'First day of the Gregorian calendar year.',
    isPaid: true,
  },
  {
    id: 2,
    name: 'Republic Day',
    date: '2026-01-26',
    day: 'Monday',
    month: 0, // Jan
    year: 2026,
    type: 'National Holiday',
    description: 'Commemorates the enactment of the Constitution of India.',
    isPaid: true,
  },
  {
    id: 3,
    name: 'Maha Shivaratri',
    date: '2026-02-15',
    day: 'Sunday',
    month: 1, // Feb
    year: 2026,
    type: 'Gazetted Holiday',
    description: 'Celebration of Lord Shiva.',
    isPaid: true,
  },
  {
    id: 4,
    name: 'Holi',
    date: '2026-03-04',
    day: 'Wednesday',
    month: 2, // Mar
    year: 2026,
    type: 'Gazetted Holiday',
    description: 'Festival of colors and arrival of spring.',
    isPaid: true,
  },
  {
    id: 5,
    name: 'Eid-ul-Fitr',
    date: '2026-03-21',
    day: 'Saturday',
    month: 2, // Mar
    year: 2026,
    type: 'Gazetted Holiday',
    description: 'Culmination of the holy month of Ramadan.',
    isPaid: true,
  },
  {
    id: 6,
    name: 'Good Friday',
    date: '2026-04-03',
    day: 'Friday',
    month: 3, // Apr
    year: 2026,
    type: 'Gazetted Holiday',
    description: 'Commemorating the crucifixion of Jesus Christ.',
    isPaid: true,
  },
  {
    id: 7,
    name: 'Independence Day',
    date: '2026-08-15',
    day: 'Saturday',
    month: 7, // Aug
    year: 2026,
    type: 'National Holiday',
    description: 'Celebration of India’s national independence.',
    isPaid: true,
  },
  {
    id: 8,
    name: 'Janmashtami',
    date: '2026-09-04',
    day: 'Friday',
    month: 8, // Sep
    year: 2026,
    type: 'Gazetted Holiday',
    description: 'Birth anniversary of Lord Krishna.',
    isPaid: true,
  },
  {
    id: 9,
    name: "Mahatma Gandhi's Birthday",
    shortName: 'Mahatma G...',
    date: '2026-10-02',
    day: 'Friday',
    month: 9, // Oct
    year: 2026,
    type: 'National Holiday',
    description: 'National observance of Mahatma Gandhi’s philosophy of non-violence and peace.',
    isPaid: true,
  },
  {
    id: 10,
    name: 'Dussehra',
    shortName: 'Dussehra',
    date: '2026-10-20',
    day: 'Tuesday',
    month: 9, // Oct
    year: 2026,
    type: 'Gazetted Holiday',
    description: 'Celebration of the victory of Lord Rama over Ravana and good over evil.',
    isPaid: true,
  },
  {
    id: 11,
    name: 'Diwali (Deepavali)',
    shortName: 'Diwali',
    date: '2026-11-08',
    day: 'Sunday',
    month: 10, // Nov
    year: 2026,
    type: 'Gazetted Holiday',
    description: 'Festival of lights commemorating joy, prosperity, and victory of light over dark.',
    isPaid: true,
  },
  {
    id: 12,
    name: 'Guru Nanak Jayanti',
    shortName: 'Guru Nanak',
    date: '2026-11-24',
    day: 'Tuesday',
    month: 10, // Nov
    year: 2026,
    type: 'Gazetted Holiday',
    description: 'Celebration of the birth of the first Sikh Guru.',
    isPaid: true,
  },
  {
    id: 13,
    name: 'Christmas Day',
    shortName: 'Christmas',
    date: '2026-12-25',
    day: 'Friday',
    month: 11, // Dec
    year: 2026,
    type: 'Gazetted Holiday',
    description: 'Commemoration of the birth of Jesus Christ.',
    isPaid: true,
  },
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function EmployeeHolidays() {
  const [holidays, setHolidays] = useState(HOLIDAYS_DATA);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'table'
  // Default to October 2026 matching reference screenshot
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(9); // 9 = October
  const [selectedDate, setSelectedDate] = useState('2026-10-26');
  const [modalHoliday, setModalHoliday] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  // Today reference is 2026-10-26 matching screenshots
  const todayStr = '2026-10-26';

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        setLoading(true);
        const res = await api.get('/holidays');
        if (res.data?.success && Array.isArray(res.data?.data) && res.data.data.length > 0) {
          const formatted = res.data.data.map(h => ({
            ...h,
            date: typeof h.date === 'string' ? h.date.slice(0, 10) : h.date
          }));
          setHolidays(formatted);
        }
      } catch (err) {
        console.error('Failed to load holidays from server:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHolidays();
  }, []);

  // Holidays in current view month
  const monthHolidays = useMemo(() => {
    return holidays.filter(
      h => h.year === currentYear && h.month === currentMonth
    );
  }, [holidays, currentYear, currentMonth]);

  // Selected date holiday details (if any)
  const selectedHoliday = useMemo(() => {
    return holidays.find(h => h.date === selectedDate);
  }, [holidays, selectedDate]);

  // Generate calendar days matrix
  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const cells = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevM = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevY = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      cells.push({
        dayNum,
        dateStr,
        isCurrentMonth: false,
        holiday: holidays.find(h => h.date === dateStr),
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        dayNum: day,
        dateStr,
        isCurrentMonth: true,
        holiday: holidays.find(h => h.date === dateStr),
      });
    }

    // Next month padding to fill grid
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let day = 1; day <= remaining; day++) {
      const nextM = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextY = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        dayNum: day,
        dateStr,
        isCurrentMonth: false,
        holiday: holidays.find(h => h.date === dateStr),
      });
    }

    return cells;
  }, [holidays, currentYear, currentMonth]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(9); // October
    setSelectedDate('2026-10-26');
  };

  // Filtered list for Table List View
  const filteredTableHolidays = useMemo(() => {
    return holidays.filter(h => {
      const matchSearch =
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (h.description && h.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        h.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = typeFilter === 'All' || h.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [holidays, searchQuery, typeFilter]);

  return (
    <div className="space-y-4">
      {/* Page Title & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Company Holidays
          </h1>
          <p className="font-body mt-1 text-xs text-slate-500">
            View marked company holiday dates on the interactive calendar
          </p>
        </div>

        {/* View Switcher Toggle */}
        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50/80 p-1 shadow-2xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('calendar')}
            className={clsx(
              'flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer',
              viewMode === 'calendar'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Calendar View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={clsx(
              'flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer',
              viewMode === 'table'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span>Table List View</span>
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        /* Calendar 2-Column View matching Screenshot 2 */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Calendar Grid */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            {/* Calendar Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <h2 className="font-display text-lg font-bold text-slate-900">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                  {monthHolidays.length} Holidays
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToday}
                  className="px-3 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition cursor-pointer"
                >
                  Today
                </button>
                <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-1.5 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
                    title="Previous Month"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="w-px h-4 bg-slate-200" />
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1.5 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
                    title="Next Month"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Weekdays Labels Header */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] tracking-wider py-2 border-b border-slate-100">
              <span className="text-teal-600">SUN</span>
              <span className="text-slate-600">MON</span>
              <span className="text-slate-600">TUE</span>
              <span className="text-slate-600">WED</span>
              <span className="text-slate-600">THU</span>
              <span className="text-slate-600">FRI</span>
              <span className="text-teal-600">SAT</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarCells.map((cell) => {
                const isToday = cell.dateStr === todayStr;
                const isSelected = cell.dateStr === selectedDate;
                const hasHoliday = Boolean(cell.holiday);

                return (
                  <div
                    key={cell.dateStr}
                    onClick={() => setSelectedDate(cell.dateStr)}
                    className={clsx(
                      'min-h-[76px] sm:min-h-[88px] p-2 rounded-xl border transition-all duration-150 flex flex-col justify-between cursor-pointer select-none relative',
                      cell.isCurrentMonth ? 'bg-white' : 'bg-slate-50/50 text-slate-300',
                      isSelected
                        ? 'border-teal-500 bg-teal-50/30 ring-2 ring-teal-500/20'
                        : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50/50'
                    )}
                  >
                    {/* Date Number Header */}
                    <div className="flex items-center justify-between">
                      <span
                        className={clsx(
                          'text-xs font-semibold',
                          cell.isCurrentMonth ? 'text-slate-700' : 'text-slate-300',
                          isToday &&
                            'w-6 h-6 rounded-full bg-slate-900 text-teal-300 flex items-center justify-center font-bold shadow-xs'
                        )}
                      >
                        {cell.dayNum}
                      </span>

                      {/* Small holiday dot indicator */}
                      {hasHoliday && (
                        <span className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0 animate-pulse" />
                      )}
                    </div>

                    {/* Holiday Card Snippet inside cell */}
                    {hasHoliday && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDate(cell.dateStr);
                          setModalHoliday(cell.holiday);
                        }}
                        className="mt-1 p-1 sm:p-1.5 rounded-lg bg-teal-50/90 border border-teal-200/90 hover:bg-teal-100 transition shadow-2xs group"
                        title={cell.holiday.name}
                      >
                        <p className="text-[10px] sm:text-[11px] font-semibold text-teal-900 truncate">
                          {cell.holiday.shortName || cell.holiday.name}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Info & Month Holidays List */}
          <div className="lg:col-span-4 space-y-4">
            {/* Top Card: Click a Marked Holiday Date */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              {selectedHoliday ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600">
                      {selectedHoliday.type}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-900 leading-snug">
                      {selectedHoliday.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedHoliday.day}, {selectedHoliday.date}
                    </p>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {selectedHoliday.description}
                  </p>
                  <div className="flex items-center justify-between text-xs pt-1 text-slate-600">
                    <span>Compensatory Status:</span>
                    <span className="font-semibold text-emerald-600">Paid Company Holiday</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalHoliday(selectedHoliday)}
                    className="w-full mt-2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer shadow-xs"
                  >
                    View Complete Details
                  </button>
                </div>
              ) : (
                <div className="text-center py-6 px-4">
                  <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold text-sm text-slate-800">
                    Click a Marked Holiday Date
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Select any highlighted date on the calendar to view full holiday details.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Card: Holidays in October */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-display font-bold text-sm text-slate-900">
                  Holidays in {MONTH_NAMES[currentMonth]}
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  {monthHolidays.length} Events
                </span>
              </div>

              {monthHolidays.length > 0 ? (
                <div className="space-y-2.5">
                  {monthHolidays.map((holiday) => (
                    <div
                      key={holiday.id}
                      className="p-3.5 rounded-xl border border-teal-200/80 bg-teal-50/40 hover:bg-teal-50 transition flex items-center justify-between group"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-semibold text-xs text-slate-900 truncate">
                          {holiday.name}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {holiday.day.slice(0, 3)} {new Date(holiday.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setModalHoliday(holiday)}
                        className="text-xs font-bold text-teal-600 hover:text-teal-700 px-2.5 py-1 rounded-lg hover:bg-teal-100 transition cursor-pointer flex-shrink-0"
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">
                  No company holidays scheduled for {MONTH_NAMES[currentMonth]}.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Table List View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
          {/* Table Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="relative flex-1 w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search holidays..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="All">All Holiday Types</option>
                <option value="National Holiday">National Holidays</option>
                <option value="Gazetted Holiday">Gazetted Holidays</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="text-[11px] uppercase font-bold text-slate-400 bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Holiday Name</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Day</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTableHolidays.map((holiday, idx) => (
                  <tr key={holiday.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-400">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{holiday.name}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{holiday.date}</td>
                    <td className="py-3.5 px-4 text-slate-600">{holiday.day}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={clsx(
                          'px-2.5 py-0.5 rounded-full text-[10px] font-semibold border',
                          holiday.type === 'National Holiday'
                            ? 'bg-teal-50 text-teal-800 border-teal-200'
                            : 'bg-slate-100 text-slate-800 border-slate-200'
                        )}
                      >
                        {holiday.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-500">
                      {holiday.description}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setModalHoliday(holiday)}
                        className="text-xs font-bold text-teal-600 hover:text-teal-700 px-2 py-1 rounded hover:bg-teal-50 transition cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Holiday Details Modal */}
      {modalHoliday && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in-0 zoom-in-95">
            <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] p-6 text-white relative">
              <button
                type="button"
                onClick={() => setModalHoliday(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white rounded-full p-1 hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs">
                  {modalHoliday.type}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/80 text-[10px] font-bold uppercase tracking-wider">
                  Mandatory Paid
                </span>
              </div>
              <h3 className="font-display font-bold text-2xl leading-tight">
                {modalHoliday.name}
              </h3>
              <p className="text-slate-300 text-xs mt-1">
                {modalHoliday.day}, {modalHoliday.date}
              </p>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700">
              <div>
                <p className="font-bold text-slate-900 mb-1">About This Holiday</p>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  {modalHoliday.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <div>
                    <p className="text-[10px] text-slate-400">Duration</p>
                    <p className="font-bold text-slate-800">Full Day Off</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  <div>
                    <p className="text-[10px] text-slate-400">Applicable To</p>
                    <p className="font-bold text-slate-800">All Offices</p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-200 text-teal-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Employees working on official holidays are eligible for compensatory off (comp-off) or overtime compensation per HR policy.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setModalHoliday(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}