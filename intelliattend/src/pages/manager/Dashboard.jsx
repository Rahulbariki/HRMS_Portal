import { Link } from 'react-router-dom';
import {
  Calendar, ClipboardList, FileCheck, FolderOpen, Newspaper,
  DollarSign, Award, LogOut, FileText, HelpCircle, Settings, User
} from 'lucide-react';

const pages = [
  { label: 'Leaves', path: '/manager/leaves', icon: Calendar, desc: 'Manage team leave requests' },
  { label: 'Tasks', path: '/manager/tasks', icon: ClipboardList, desc: 'Assign and track tasks' },
  { label: 'Policies', path: '/manager/policies', icon: FileCheck, desc: 'Team policies and compliance' },
  { label: 'Documents', path: '/manager/documents', icon: FolderOpen, desc: 'Shared documents' },
  { label: 'News', path: '/manager/news', icon: Newspaper, desc: 'Company announcements' },
  { label: 'Holidays', path: '/manager/holidays', icon: Calendar, desc: 'Holiday calendar' },
  { label: 'Attendance', path: '/manager/attendance', icon: User, desc: 'Team attendance tracking' },
  { label: 'Expenses', path: '/manager/expenses', icon: DollarSign, desc: 'Expense approvals' },
  { label: 'Salary', path: '/manager/salary', icon: Award, desc: 'Salary management' },
  { label: 'Offboarding', path: '/manager/offboarding', icon: LogOut, desc: 'Exit management' },
  { label: 'Letters', path: '/manager/letters', icon: FileText, desc: 'Generate letters' },
  { label: 'Queries', path: '/manager/queries', icon: HelpCircle, desc: 'Support queries' },
  { label: 'Settings', path: '/manager/settings', icon: Settings, desc: 'Preferences' },
  { label: 'Profile', path: '/manager/profile', icon: User, desc: 'Your profile' },
];

export default function ManagerDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-primary">Manager Dashboard</h1>
        <p className="text-muted mt-1">Team management and oversight</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map((page, index) => (
          <Link
            key={index}
            to={page.path}
            className="card-elevated p-6 hover:shadow-xl transition-shadow group"
          >
            <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
              <page.icon className="h-6 w-6 text-primary group-hover:text-white transition-colors" />
            </div>
            <h3 className="font-display text-lg font-semibold text-primary mb-1">{page.label}</h3>
            <p className="text-sm text-muted">{page.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}