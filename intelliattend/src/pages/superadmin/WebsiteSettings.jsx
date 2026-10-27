import React, { useState } from 'react';
import { 
  Settings, 
  Palette, 
  Globe, 
  ShieldAlert, 
  Upload, 
  CheckCircle2, 
  Image, 
  Sliders, 
  Save, 
  Layers
} from 'lucide-react';

export default function SuperAdminWebsiteSettings() {
  const [siteConfig, setSiteConfig] = useState({
    portalName: 'IntelliAttend Cloud HRMS',
    tagline: 'Enterprise Autonomous Workforce & Attendance Engine',
    supportPhone: '+91 80 4920 1800',
    supportEmail: 'support@intelliattend.io',
    copyrightText: '© 2026 IntelliAttend Technologies India Private Limited. All Rights Reserved.',
    defaultTheme: 'system',
    maintenanceMode: false,
    sessionTimeoutMinutes: 60,
    enableSelfRegistration: false
  });

  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);
    setTimeout(() => {
      setSaving(false);
      setStatusMsg('Global portal configuration updated and pushed to edge CDN.');
    }, 800);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400">
              <Settings className="w-6 h-6" />
            </span>
            Portal Appearance & Global Branding
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Global metadata, white-label UI theming, session security policies, and maintenance gateways
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Identity */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            Identity & Corporate Branding
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Portal Brand Name
              </label>
              <input
                type="text"
                value={siteConfig.portalName}
                onChange={(e) => setSiteConfig({ ...siteConfig, portalName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Portal Tagline
              </label>
              <input
                type="text"
                value={siteConfig.tagline}
                onChange={(e) => setSiteConfig({ ...siteConfig, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Primary Support Email
              </label>
              <input
                type="email"
                value={siteConfig.supportEmail}
                onChange={(e) => setSiteConfig({ ...siteConfig, supportEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Support Helpline (India)
              </label>
              <input
                type="text"
                value={siteConfig.supportPhone}
                onChange={(e) => setSiteConfig({ ...siteConfig, supportPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Footer Copyright Text
              </label>
              <input
                type="text"
                value={siteConfig.copyrightText}
                onChange={(e) => setSiteConfig({ ...siteConfig, copyrightText: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
              />
            </div>
          </div>
        </div>

        {/* Security & Access Policies */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            Session & Security Controls
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Maintenance Mode Gateway</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Locks employee/manager logins during system upgrades</p>
              </div>
              <input
                type="checkbox"
                checked={siteConfig.maintenanceMode}
                onChange={(e) => setSiteConfig({ ...siteConfig, maintenanceMode: e.target.checked })}
                className="w-5 h-5 text-violet-600 rounded focus:ring-violet-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Public Tenant Self-Signup</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Enables external organizations to request demo tenant</p>
              </div>
              <input
                type="checkbox"
                checked={siteConfig.enableSelfRegistration}
                onChange={(e) => setSiteConfig({ ...siteConfig, enableSelfRegistration: e.target.checked })}
                className="w-5 h-5 text-violet-600 rounded focus:ring-violet-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {statusMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs shadow-md transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Deploy Global Website Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
}