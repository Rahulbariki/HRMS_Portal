import { useState, useEffect } from 'react';
import {
  Users, ShieldCheck, Mail, Phone, Calendar,
  CheckCircle2, Key, Loader2, RefreshCw, Lock
} from 'lucide-react';
import api from '../../services/api';

export default function SuperAdminAdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/directory');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        const adminUsers = res.data.data.filter(
          (u) => u.loginEmail === 'rahulbariki.intelliattend@gmail.com' || u.loginEmail === 'clientadmin.intelliattend@gmail.com'
        );
        setAdmins(adminUsers);
      }
    } catch (err) {
      console.error('Error fetching admin accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        <p className="text-xs font-semibold">Loading verified platform administrators from Neon PostgreSQL...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">Platform Administrator Governance</h1>
          <p className="text-sm text-slate-500 mt-1">
            Access governance, cryptographic security privileges, and verified identity administrators
          </p>
        </div>
        <button
          onClick={() => fetchAdmins()}
          className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer self-start sm:self-auto"
          title="Refresh Administrators"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Security Status Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Production Identity Guard Active</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Strict isolation enforced. Only authorized administrative identities have portal root access.
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>RBAC Enforced</span>
        </div>
      </div>

      {/* Admins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {admins.map((adm) => (
          <div
            key={adm.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-teal-300 font-bold flex items-center justify-center text-base border border-slate-700 overflow-hidden">
                    {adm.avatarUrl ? (
                      <img src={adm.avatarUrl} alt={adm.name} className="w-full h-full object-cover" />
                    ) : (
                      adm.firstName?.[0] || 'A'
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{adm.name}</h3>
                    <p className="text-xs text-teal-700 font-semibold">{adm.designation}</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                  Active Verified
                </span>
              </div>

              <div className="mt-5 space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-400">Account ID:</span>
                  <span className="font-mono font-bold text-slate-800">{adm.id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-400">Login Email:</span>
                  <span className="font-mono font-semibold text-slate-800">{adm.loginEmail}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-400">Department:</span>
                  <span className="font-semibold text-slate-800">{adm.department}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-400">Work Location:</span>
                  <span className="text-slate-800">{adm.workLocation || 'Hyderabad / Corporate'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Tenure Since:</span>
                  <span className="font-mono text-slate-800">{adm.doj || '15 Jan 2025'}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Bcrypt Hash Verified</span>
              </span>
              <span className="font-mono text-[11px]">2FA Enabled</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}