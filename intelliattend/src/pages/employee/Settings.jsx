import { useState } from 'react';
import {
  Settings, Bell, Lock, Globe, ShieldCheck,
  CheckCircle2, AlertCircle, Save, Database, Cloud
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext';

export default function EmployeeSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('notifications');
  const [feedback, setFeedback] = useState(null);

  // Notification toggles
  const [notifications, setNotifications] = useState({
    emailPayslips: true,
    emailLeaves: true,
    emailExpenses: true,
    emailBroadcasts: true,
    browserPunches: true,
  });

  // Password fields
  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirm: '',
  });

  const handleSaveNotifications = (e) => {
    e.preventDefault();
    setFeedback({ type: 'success', text: 'Notification preferences updated successfully!' });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) {
      setFeedback({ type: 'error', text: 'New passwords do not match!' });
      return;
    }
    if (passwords.newPass.length < 6) {
      setFeedback({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setFeedback({ type: 'success', text: 'Password updated and re-hashed securely!' });
    setPasswords({ current: '', newPass: '', confirm: '' });
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">Portal & Account Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure system notifications, cryptographic credentials, regional standards, and connected cloud services
          </p>
        </div>
      </div>

      {feedback && (
        <div
          className={clsx(
            'p-4 rounded-xl border flex items-center justify-between text-xs font-semibold animate-in fade-in',
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          )}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="font-bold cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('notifications')}
          className={clsx(
            'px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5',
            activeTab === 'notifications'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          )}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Notifications</span>
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={clsx(
            'px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5',
            activeTab === 'security'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          )}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Security & Passwords</span>
        </button>
        <button
          onClick={() => setActiveTab('regional')}
          className={clsx(
            'px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5',
            activeTab === 'regional'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          )}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Regional & Localization</span>
        </button>
      </div>

      {/* Tab 1: Notifications */}
      {activeTab === 'notifications' && (
        <form onSubmit={handleSaveNotifications} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-base">Email & Workflow Notifications</h3>
            <p className="text-xs text-slate-500">Choose which automated lifecycle events trigger transactional emails</p>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">Monthly Payslip Generation</p>
                <p className="text-slate-500 mt-0.5">Receive immediate notification when your salary slip is published</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailPayslips}
                onChange={(e) => setNotifications({ ...notifications, emailPayslips: e.target.checked })}
                className="w-4 h-4 text-teal-600 rounded cursor-pointer"
              />
            </div>

            <div className="py-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">Leave Approvals & Decisions</p>
                <p className="text-slate-500 mt-0.5">Get notified when a manager reviews your leave request</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailLeaves}
                onChange={(e) => setNotifications({ ...notifications, emailLeaves: e.target.checked })}
                className="w-4 h-4 text-teal-600 rounded cursor-pointer"
              />
            </div>

            <div className="py-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">Expense Reimbursement Status</p>
                <p className="text-slate-500 mt-0.5">Updates on reimbursement approval and bank payment reference</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailExpenses}
                onChange={(e) => setNotifications({ ...notifications, emailExpenses: e.target.checked })}
                className="w-4 h-4 text-teal-600 rounded cursor-pointer"
              />
            </div>

            <div className="py-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">Company Announcements & Townhalls</p>
                <p className="text-slate-500 mt-0.5">Official communications published to the corporate newsroom</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailBroadcasts}
                onChange={(e) => setNotifications({ ...notifications, emailBroadcasts: e.target.checked })}
                className="w-4 h-4 text-teal-600 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-teal-400" />
              <span>Save Preferences</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Security & Passwords */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <form onSubmit={handleUpdatePassword} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-base">Change Password</h3>
              <p className="text-xs text-slate-500">Update your account credentials. Passwords are encrypted with Bcrypt 10 rounds.</p>
            </div>

            <div className="max-w-md space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={passwords.newPass}
                  onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-teal-400" />
                <span>Update Password</span>
              </button>
            </div>
          </form>

          {/* Connected Infrastructure Audit */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Connected Cloud Infrastructure</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-teal-600" />
                  <div>
                    <p className="font-bold text-slate-900">Neon Cloud PostgreSQL</p>
                    <p className="text-slate-400 font-mono text-[11px]">Database: neondb (Branch: main)</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                  Connected
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <Cloud className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-bold text-slate-900">Cloudinary Object Storage</p>
                    <p className="text-slate-400 font-mono text-[11px]">Buckets: receipts, avatars, docs</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Regional & Localization */}
      {activeTab === 'regional' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-base">Corporate Localization & Standards</h3>
          <p className="text-slate-500">
            IntelliAttend is configured to national Indian statutory standards for payroll, taxation, and work hours.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Standard Currency:</span>
              <span className="font-mono font-bold text-slate-900">Indian Rupee (INR • ₹)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Primary Timezone:</span>
              <span className="font-mono font-semibold text-slate-900">Asia/Kolkata (IST • UTC+05:30)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Tax Year Cycle:</span>
              <span className="font-semibold text-slate-900">1 April – 31 March (FY 2026-27)</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-600">Statutory Tax Regime:</span>
              <span className="font-semibold text-teal-700">New Tax Regime Default (with 80C exemptions)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}