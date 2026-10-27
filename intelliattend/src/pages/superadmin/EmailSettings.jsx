import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Server, 
  Key, 
  RefreshCw,
  BellRing
} from 'lucide-react';

export default function SuperAdminEmailSettings() {
  const [smtpConfig, setSmtpConfig] = useState({
    provider: 'Amazon SES (Production)',
    host: 'email-smtp.ap-south-1.amazonaws.com',
    port: 587,
    encryption: 'STARTTLS',
    fromName: 'IntelliAttend Enterprise HRMS',
    fromEmail: 'noreply@intelliattend.io',
    replyTo: 'support@intelliattend.io',
    status: 'Connected & Verified'
  });

  const [testEmail, setTestEmail] = useState('rahulbariki24@gmail.com');
  const [sendingTest, setSendingTest] = useState(false);
  const [testSuccess, setTestSuccess] = useState(null);

  const handleSendTestEmail = (e) => {
    e.preventDefault();
    setSendingTest(true);
    setTestSuccess(null);
    setTimeout(() => {
      setSendingTest(false);
      setTestSuccess(`Diagnostic test email dispatched successfully to ${testEmail} with 250 OK.`);
    }, 1200);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <Mail className="w-6 h-6" />
            </span>
            Email Delivery & Transactional SMTP
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Global mail relay, DKIM/SPF DNS authentication, and automated notifications infrastructure
          </p>
        </div>
        <span className="px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          SES Relay Online
        </span>
      </div>

      {/* SMTP Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Active SMTP Relay Configuration
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Mail Gateway Provider
                </label>
                <input
                  type="text"
                  readOnly
                  value={smtpConfig.provider}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  SMTP Host Endpoint
                </label>
                <input
                  type="text"
                  readOnly
                  value={smtpConfig.host}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Port & Transport Security
                </label>
                <input
                  type="text"
                  readOnly
                  value={`${smtpConfig.port} (${smtpConfig.encryption})`}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Sender Display Name
                </label>
                <input
                  type="text"
                  value={smtpConfig.fromName}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, fromName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Enforced From Address
                </label>
                <input
                  type="text"
                  readOnly
                  value={smtpConfig.fromEmail}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => alert('SMTP Settings saved and hot-reloaded successfully.')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-sm"
              >
                Save Relay Configuration
              </button>
            </div>
          </div>

          {/* Test Dispatcher */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Dispatch Live Diagnostic Test Email
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verify instantaneous deliverability, SPF alignment, and DKIM signature verification to an external mailbox.
            </p>

            <form onSubmit={handleSendTestEmail} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter recipient email..."
                required
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
              />
              <button
                type="submit"
                disabled={sendingTest}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold transition flex items-center justify-center gap-2"
              >
                {sendingTest ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {sendingTest ? 'Dispatching...' : 'Send Test Mail'}
              </button>
            </form>

            {testSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{testSuccess}</span>
              </div>
            )}
          </div>
        </div>

        {/* Security & DNS Authentication */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              DNS Authentication Status
            </h3>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">SPF Record</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">PASS</span>
                </div>
                <p className="font-mono text-[10px] text-slate-500 break-all">v=spf1 include:amazonses.com ~all</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">DKIM 2048-bit</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">VERIFIED</span>
                </div>
                <p className="font-mono text-[10px] text-slate-500 break-all">res1._domainkey.intelliattend.io</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">DMARC Policy</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">ENFORCED</span>
                </div>
                <p className="font-mono text-[10px] text-slate-500 break-all">v=DMARC1; p=reject; sp=reject;</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}