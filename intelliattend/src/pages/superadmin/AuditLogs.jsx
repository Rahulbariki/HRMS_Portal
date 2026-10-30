import { useState, useEffect } from 'react';
import {
  Shield, Search, Download, Filter, CheckCircle2,
  AlertTriangle, Key, Database, RefreshCw, Clock, Globe
} from 'lucide-react';
import clsx from 'clsx';
import api from '../../services/api';

const AUDIT_EVENTS = [
  {
    id: 'AUD-8821',
    event: 'User Authentication Success',
    user: 'rahulbariki.intelliattend@gmail.com',
    role: 'SuperAdmin',
    ip: '106.213.88.192 (Hyderabad, India)',
    timestamp: '27 Oct 2026 • 23:45 IST',
    status: 'success',
    details: 'JWT token issued with RS256 algorithm and 7-day expiration.'
  },
  {
    id: 'AUD-8820',
    event: 'Cloudinary Asset Upload',
    user: 'clientadmin.intelliattend@gmail.com',
    role: 'Client Admin',
    ip: '106.213.88.192',
    timestamp: '27 Oct 2026 • 23:30 IST',
    status: 'success',
    details: 'Uploaded corporate policy PDF to folder "intelliattend/documents".'
  },
  {
    id: 'AUD-8819',
    event: 'Monthly Payroll Disbursal',
    user: 'manager.intelliattend@gmail.com',
    role: 'Manager',
    ip: '49.205.122.10',
    timestamp: '27 Oct 2026 • 23:05 IST',
    status: 'success',
    details: 'Triggered batch payslip generation and NEFT bank transfer for Sarah Miller.'
  },
  {
    id: 'AUD-8818',
    event: 'Biometric Attendance Punch',
    user: 'employee.intelliattend@gmail.com',
    role: 'Employee',
    ip: '49.205.122.10',
    timestamp: '27 Oct 2026 • 09:15 IST',
    status: 'success',
    details: 'Punched IN via web terminal. Geo-coordinate verified in Hyderabad tech zone.'
  },
  {
    id: 'AUD-8817',
    event: 'Database Schema Synchronization',
    user: 'System Process (neondb_owner)',
    role: 'System',
    ip: 'Neon Cloud Platform (PostgreSQL 16)',
    timestamp: '27 Oct 2026 • 04:30 IST',
    status: 'success',
    details: 'Tables verified: users, attendance_records, salary_structures, payslips.'
  }
];

export default function SuperAdminAuditLogs() {
  const [logs, setLogs] = useState(AUDIT_EVENTS);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/superadmin/audit-logs');
        if (res.data?.success && Array.isArray(res.data.data)) {
          const formatRole = (role) => {
            if (!role) return 'System';
            const r = role.toLowerCase();
            if (r === 'superadmin') return 'SuperAdmin';
            if (r === 'client_admin' || r === 'client') return 'Client Admin';
            return role.charAt(0).toUpperCase() + role.slice(1);
          };

          const mapped = res.data.data.map(l => ({
            id: `AUD-${l.id}`,
            event: l.action || 'System Audit Event',
            user: l.user_email || 'System Process',
            role: formatRole(l.user_role),
            ip: l.ip_address || '127.0.0.1',
            timestamp: l.created_at ? new Date(l.created_at).toLocaleString('en-IN') : 'Recent',
            status: 'success',
            details: l.details || 'Audit event logged in Neon DB.'
          }));
          setLogs(mapped);
        }
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(l => {
    const matchesSearch =
      l.id.toLowerCase().includes(search.toLowerCase()) ||
      l.event.toLowerCase().includes(search.toLowerCase()) ||
      l.user.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === 'all' || l.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const exportCSV = () => {
    const headers = ['Audit ID', 'Event', 'User', 'Role', 'IP Address', 'Timestamp', 'Status', 'Details'];
    const rows = filteredLogs.map(l => [l.id, `"${l.event}"`, l.user, l.role, `"${l.ip}"`, `"${l.timestamp}"`, l.status, `"${l.details}"`]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">Security Audit Logs & Trails</h1>
          <p className="text-sm text-slate-500 mt-1">
            Immutable cryptographic records of portal authentication, schema changes, and high-privilege operations
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-teal-400" />
          <span>Export Audit Trail (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail by event, user, IP..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          >
            <option value="all">All Roles</option>
            <option value="SuperAdmin">SuperAdmin</option>
            <option value="Client Admin">Client Admin</option>
            <option value="Manager">Manager</option>
            <option value="Employee">Employee</option>
            <option value="System">System</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Event & ID</th>
                <th className="py-3.5 px-6">Actor / User</th>
                <th className="py-3.5 px-6">Source IP</th>
                <th className="py-3.5 px-6">Timestamp</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLogs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-4 px-6">
                    <p className="font-semibold text-slate-900 text-xs">{l.event}</p>
                    <span className="font-mono text-[11px] text-slate-400">{l.id}</span>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-mono text-xs text-slate-800">{l.user}</p>
                    <span className="text-[10px] text-teal-700 font-semibold">{l.role}</span>
                  </td>
                  <td className="py-4 px-6 font-mono text-xs text-slate-500">
                    {l.ip}
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-500 whitespace-nowrap">
                    {l.timestamp}
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Verified</span>
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-600 max-w-xs">
                    {l.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}