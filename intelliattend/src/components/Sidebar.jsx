import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Building2, CreditCard, FileText, Settings,
  Calendar, ClipboardList, DollarSign, Shield, Mail,
  FolderOpen, Newspaper, LogOut, ChevronLeft, ChevronRight,
  Building, UserCheck, HelpCircle, FileCheck, Award, Zap
} from 'lucide-react';
import clsx from 'clsx';

const menuItems = {
  superadmin: [
    { label: 'Dashboard', path: '/superadmin/dashboard', icon: LayoutDashboard },
    { label: 'Companies', path: '/superadmin/companies', icon: Building2 },
    { label: 'Plan Management', path: '/superadmin/plan-management', icon: CreditCard },
    { label: 'Transactions', path: '/superadmin/transactions', icon: DollarSign },
    { label: 'Invoices', path: '/superadmin/invoices', icon: FileText },
    { label: 'Admin Management', path: '/superadmin/admin-management', icon: Users },
    { label: 'Clients', path: '/superadmin/clients', icon: Building },
    { label: 'Subdomain Requests', path: '/superadmin/subdomain-requests', icon: Globe },
    { label: 'Contact Queries', path: '/superadmin/contact-queries', icon: Mail },
    { label: 'Support Tickets', path: '/superadmin/support-tickets', icon: HelpCircle },
    { label: 'Payment Gateways', path: '/superadmin/payment-gateways', icon: CreditCard },
    { label: 'Website Settings', path: '/superadmin/website-settings', icon: Settings },
    { label: 'Email Settings', path: '/superadmin/email-settings', icon: Mail },
    { label: 'Audit Logs', path: '/superadmin/audit-logs', icon: Shield },
    { label: 'Settings', path: '/superadmin/settings', icon: Settings },
    { label: 'Profile', path: '/superadmin/profile', icon: UserCheck },
  ],
  client: [
    { label: 'Dashboard', path: '/client/dashboard', icon: LayoutDashboard },
    { label: 'Managers', path: '/client/managers', icon: Users },
    { label: 'Policies', path: '/client/policies', icon: FileCheck },
    { label: 'Billings', path: '/client/billings', icon: DollarSign },
    { label: 'Support', path: '/client/support', icon: HelpCircle },
    { label: 'Settings', path: '/client/settings', icon: Settings },
    { label: 'Profile', path: '/client/profile', icon: UserCheck },
  ],
  manager: [
    { label: 'Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
    { label: 'Leaves', path: '/manager/leaves', icon: Calendar },
    { label: 'Tasks', path: '/manager/tasks', icon: ClipboardList },
    { label: 'Policies', path: '/manager/policies', icon: FileCheck },
    { label: 'Documents', path: '/manager/documents', icon: FolderOpen },
    { label: 'News', path: '/manager/news', icon: Newspaper },
    { label: 'Holidays', path: '/manager/holidays', icon: Calendar },
    { label: 'Attendance', path: '/manager/attendance', icon: UserCheck },
    { label: 'Expenses', path: '/manager/expenses', icon: DollarSign },
    { label: 'Salary', path: '/manager/salary', icon: Award },
    { label: 'Offboarding', path: '/manager/offboarding', icon: LogOut },
    { label: 'Letters', path: '/manager/letters', icon: FileText },
    { label: 'Support Queries', path: '/manager/queries', icon: HelpCircle },
    { label: 'Settings', path: '/manager/settings', icon: Settings },
    { label: 'Profile', path: '/manager/profile', icon: UserCheck },
  ],
  employee: [
    { label: 'Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
    { label: 'Leaves', path: '/employee/leaves', icon: Calendar },
    { label: 'Tasks', path: '/employee/tasks', icon: ClipboardList },
    { label: 'Policies', path: '/employee/policies', icon: FileCheck },
    { label: 'Documents', path: '/employee/documents', icon: FolderOpen },
    { label: 'News', path: '/employee/news', icon: Newspaper },
    { label: 'Holidays', path: '/employee/holidays', icon: Calendar },
    { label: 'Attendance', path: '/employee/attendance', icon: UserCheck },
    { label: 'Expenses', path: '/employee/expenses', icon: DollarSign },
    { label: 'Salary', path: '/employee/salary', icon: Award },
    { label: 'Offboarding', path: '/employee/offboarding', icon: LogOut },
    { label: 'Letters', path: '/employee/letters', icon: FileText },
    { label: 'Support Query', path: '/employee/support-query', icon: HelpCircle },
    { label: 'Settings', path: '/employee/settings', icon: Settings },
    { label: 'Profile', path: '/employee/profile', icon: UserCheck },
  ],
};

function Globe({ className }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
  );
}

export default function Sidebar({ user, mobileOpen: controlledMobileOpen, setMobileOpen: controlledSetMobileOpen }) {
  const [collapsed, setCollapsed] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);

  const mobileOpen = controlledMobileOpen !== undefined ? controlledMobileOpen : internalMobileOpen;
  const setMobileOpen = controlledSetMobileOpen || setInternalMobileOpen;

  const items = menuItems[user?.role] || [];

  return (
    <>
      {window.innerWidth < 768 && mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={clsx(
          'fixed lg:relative z-30 lg:z-auto h-full bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out flex-shrink-0 overflow-hidden',
          collapsed ? 'w-16' : 'w-64',
          window.innerWidth < 768 && !mobileOpen ? '-translate-x-full' : 'translate-x-0'
        )}
      >
        <div className="h-16 flex items-center px-4 border-b border-slate-200">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="IntelliAttend" className="h-8 w-auto rounded-lg object-contain" />
              <div>
                <p className="font-display text-sm font-bold text-slate-900 leading-tight">IntelliAttend</p>
                <p className="font-body text-xs text-slate-400 leading-tight">HRMS Workspace</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="flex justify-center w-full">
              <img src="/favicon.png" alt="IntelliAttend" className="h-7 w-7 rounded-lg object-contain" />
            </div>
          )}
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {items.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => clsx(
                    'font-display flex items-center gap-3 px-3 py-2.5 mx-1 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary-light text-primary'
                      : 'text-muted hover:bg-slate-50 hover:text-primary',
                    collapsed && 'justify-center px-2'
                  )}
                  title={collapsed ? item.label : undefined}
                  aria-label={collapsed ? item.label : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-3 border-t border-slate-200">
          {!collapsed ? (
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50">
              <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-xs text-primary truncate">HRMS Enterprise</p>
                <p className="text-[11px] text-muted truncate">People & Workspace</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
                <Zap className="h-4 w-4 text-primary" />
              </div>
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className={clsx(
              'mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-muted hover:bg-slate-100 transition-colors',
              collapsed && 'justify-center'
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            {!collapsed && <span className="font-body text-xs">Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}