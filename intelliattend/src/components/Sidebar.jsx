import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Building2, CreditCard, FileText, Settings,
  Calendar, ClipboardList, IndianRupee, Shield, Mail,
  FolderOpen, Newspaper, LogOut, ChevronLeft, ChevronRight,
  Building, UserCheck, HelpCircle, FileCheck, Award, Zap,
  MessageSquare, CalendarDays, Clock, RefreshCw, Network, Globe,
  TrendingUp, Receipt
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import clsx from 'clsx';

const menuItems = {
  superadmin: [
    { label: 'Dashboard', path: '/superadmin/dashboard', icon: LayoutDashboard },
    { label: 'Companies', path: '/superadmin/companies', icon: Building2 },
    { label: 'Plan Management', path: '/superadmin/plan-management', icon: CreditCard },
    { label: 'Transactions', path: '/superadmin/transactions', icon: IndianRupee },
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
    { label: 'Billings', path: '/client/billings', icon: IndianRupee },
    { label: 'Support', path: '/client/support', icon: HelpCircle },
    { label: 'Settings', path: '/client/settings', icon: Settings },
    { label: 'Profile', path: '/client/profile', icon: UserCheck },
  ],
  manager: [
    { label: 'Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
    { label: 'Employees', path: '/manager/employees', icon: Users },
    { label: 'Departments & Roles', path: '/manager/departments-designations', icon: Building2 },
    { label: 'Chat', path: '/manager/chat', icon: MessageSquare },
    { label: 'Emails', path: '/manager/mail', icon: Mail },
    { label: 'My Tasks', path: '/manager/tasks', icon: ClipboardList },
    { label: 'News', path: '/manager/news', icon: Newspaper },
    { label: 'Documents', path: '/manager/documents', icon: FolderOpen },
    { label: 'Leaves', path: '/manager/leaves', icon: Calendar },
    { label: 'Allocate Leaves', path: '/manager/allocate-leaves', icon: CalendarDays },
    { label: 'Holidays', path: '/manager/holidays', icon: CalendarDays },
    { label: 'Attendance', path: '/manager/attendance', icon: Clock },
    { label: 'Regularization', path: '/manager/regularization', icon: RefreshCw },
    { label: 'Expenses', path: '/manager/expenses', icon: IndianRupee },
    { label: 'Internal Expenses', path: '/manager/internal-expenses', icon: Receipt },
    { label: 'Income', path: '/manager/income', icon: TrendingUp },
    { label: 'Employee Salaries', path: '/manager/employee-salaries', icon: Award },
    { label: 'Payroll & Disbursal', path: '/manager/salary', icon: CreditCard },
    { label: 'Payroll Admins', path: '/manager/payroll-admins', icon: Shield },
    { label: 'Letters', path: '/manager/letters', icon: FileText },
    { label: 'Offboarding', path: '/manager/offboarding', icon: LogOut },
    { label: 'Company Policies', path: '/manager/policies', icon: FileCheck },
    { label: 'Organisation Chart', path: '/manager/org-chart', icon: Network },
    { label: 'Support Queries', path: '/manager/queries', icon: HelpCircle },
    { label: 'Settings', path: '/manager/settings', icon: Settings },
    { label: 'Profile', path: '/manager/profile', icon: UserCheck },
  ],
  payroll_admin: [
    { label: 'Dashboard', path: '/payroll-admin/dashboard', icon: LayoutDashboard },
    { label: 'Employees', path: '/payroll-admin/employees', icon: Users },
    { label: 'Invoices', path: '/payroll-admin/invoices', icon: FileText },
    { label: 'Settings', path: '/payroll-admin/settings', icon: Settings },
    { label: 'Profile', path: '/payroll-admin/profile', icon: UserCheck },
  ],
  employee: [
    { label: 'Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
    { label: 'Chat', path: '/employee/chat', icon: MessageSquare },
    { label: 'Emails', path: '/employee/mail', icon: Mail },
    { label: 'My Tasks', path: '/employee/tasks', icon: ClipboardList },
    { label: 'News', path: '/employee/news', icon: Newspaper },
    { label: 'Documents', path: '/employee/documents', icon: FolderOpen },
    { label: 'Leaves', path: '/employee/leaves', icon: Calendar },
    { label: 'Holidays', path: '/employee/holidays', icon: CalendarDays },
    { label: 'Attendance', path: '/employee/attendance', icon: Clock },
    { label: 'Regularization', path: '/employee/regularization', icon: RefreshCw },
    { label: 'Expenses', path: '/employee/expenses', icon: IndianRupee },
    { label: 'Salary', path: '/employee/salary', icon: Award },
    { label: 'Letters', path: '/employee/letters', icon: FileText },
    { label: 'Offboarding', path: '/employee/offboarding', icon: LogOut },
    { label: 'Company Policies', path: '/employee/policies', icon: FileCheck },
    { label: 'Organisation Chart', path: '/employee/org-chart', icon: Network },
    { label: 'Support Query', path: '/employee/support-query', icon: HelpCircle },
    { label: 'Settings', path: '/employee/settings', icon: Settings },
    { label: 'Profile', path: '/employee/profile', icon: UserCheck },
  ],
};

export default function Sidebar({ user, mobileOpen: controlledMobileOpen, setMobileOpen: controlledSetMobileOpen }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const mobileOpen = controlledMobileOpen !== undefined ? controlledMobileOpen : internalMobileOpen;
  const setMobileOpen = controlledSetMobileOpen || setInternalMobileOpen;

  const items = menuItems[user?.role] || [];

  return (
    <>
      {window.innerWidth < 768 && mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={clsx(
          'fixed lg:relative z-50 lg:z-auto h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out flex-shrink-0 overflow-hidden',
          collapsed ? 'w-16' : 'w-64',
          window.innerWidth < 768 && !mobileOpen ? '-translate-x-full' : 'translate-x-0'
        )}
      >
        <div className="h-16 flex items-center px-4 border-b border-slate-200 dark:border-slate-800">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="IntelliAttend" className="h-8 w-auto rounded-lg object-contain" />
              <div>
                <p className="font-display text-sm font-bold text-slate-900 dark:text-white leading-tight">IntelliAttend</p>
                <p className="font-body text-xs text-slate-400 dark:text-slate-500 leading-tight">HRMS Workspace</p>
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
                    'group font-display flex items-center gap-3 px-3 py-2.5 mx-1 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-slate-900 dark:bg-teal-600 text-white shadow-sm font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white',
                    collapsed && 'justify-center px-2'
                  )}
                  title={collapsed ? item.label : undefined}
                  aria-label={collapsed ? item.label : undefined}
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={clsx(
                        "h-5 w-5 flex-shrink-0 transition-colors", 
                        isActive ? "text-teal-400 dark:text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-200"
                      )} aria-hidden="true" />
                      {!collapsed && <span>{item.label}</span>}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          {!collapsed ? (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white shadow-sm border border-slate-800 dark:border-slate-700">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center flex-shrink-0">
                <Zap className="h-4 w-4 text-teal-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-xs text-white truncate">HRMS Enterprise</p>
                <p className="text-[11px] text-teal-300/80 truncate">People & Workspace</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-800 border border-teal-500/30 flex items-center justify-center">
                <Zap className="h-4 w-4 text-teal-400" />
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className={clsx(
              'mt-2 w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors font-bold text-xs cursor-pointer',
              collapsed && 'justify-center'
            )}
            title="Logout"
          >
            <LogOut className="h-4 w-4 flex-shrink-0 text-rose-600 dark:text-rose-400" />
            {!collapsed && <span className="font-display text-xs">Logout</span>}
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className={clsx(
              'mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer',
              collapsed && 'justify-center'
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!collapsed && <span className="font-body text-xs">Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}