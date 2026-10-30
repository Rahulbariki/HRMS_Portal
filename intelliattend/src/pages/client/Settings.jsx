import { useState } from 'react';
import {
  Settings, Camera, MapPin, Globe, Shield, CheckCircle2,
  Building2, Save
} from 'lucide-react';

export default function ClientSettings() {
  const [feedback, setFeedback] = useState('');
  const [config, setConfig] = useState({
    attendanceSelfie: true,
    geoFencing: true,
    geoRadiusMeters: 250,
    subdomain: 'intelliattend.hrms.portal',
    customDomain: 'people.intelliattend.com',
    companyDisplayName: 'IntelliAttend Technologies Pvt Ltd',
    autoClockOutHours: 10
  });

  const handleSave = (e) => {
    e.preventDefault();
    setFeedback('Enterprise settings and attendance security rules saved successfully!');
    setTimeout(() => setFeedback(''), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Client Enterprise Governance Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure workforce biometric facial verification rules, attendance geo-fencing, and tenant subdomain routing.
        </p>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback('')} className="text-teal-500 hover:text-teal-700">&times;</button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Attendance Verification Rules */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Camera className="h-5 w-5 text-teal-500" />
            Attendance Punch Verification & Anti-Spoofing
          </h2>

          <div className="space-y-3 pt-2">
            <label className="flex items-start justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Mandatory Facial Selfie Capture</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Require employees to take a real-time web camera selfie upon Clock-In and Clock-Out.
                </p>
              </div>
              <input
                type="checkbox"
                checked={config.attendanceSelfie}
                onChange={(e) => setConfig({ ...config, attendanceSelfie: e.target.checked })}
                className="h-4 w-4 rounded text-teal-600 focus:ring-teal-500 mt-1"
              />
            </label>

            <label className="flex items-start justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">GPS Geo-Fencing Enforcement</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Verify mobile/desktop browser coordinates against corporate office coordinates.
                </p>
              </div>
              <input
                type="checkbox"
                checked={config.geoFencing}
                onChange={(e) => setConfig({ ...config, geoFencing: e.target.checked })}
                className="h-4 w-4 rounded text-teal-600 focus:ring-teal-500 mt-1"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Authorized Geo-Fence Radius (Meters)
              </label>
              <input
                type="number"
                value={config.geoRadiusMeters}
                onChange={(e) => setConfig({ ...config, geoRadiusMeters: Number(e.target.value) })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Auto Clock-Out Threshold (Hours)
              </label>
              <input
                type="number"
                value={config.autoClockOutHours}
                onChange={(e) => setConfig({ ...config, autoClockOutHours: Number(e.target.value) })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>
          </div>
        </div>

        {/* Multi-Tenant Subdomain Routing */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="h-5 w-5 text-teal-500" />
            Corporate Subdomain & Domain Branding
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Assigned Tenant Subdomain</label>
              <input
                type="text"
                readOnly
                value={config.subdomain}
                className="w-full px-3.5 py-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-600 dark:text-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Custom CNAME Domain</label>
              <input
                type="text"
                value={config.customDomain}
                onChange={(e) => setConfig({ ...config, customDomain: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl font-semibold bg-slate-900 dark:bg-teal-600 text-white hover:bg-slate-800 transition shadow-sm"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
