import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ExternalLink, 
  ShieldCheck, 
  Search, 
  RefreshCw,
  Server,
  Lock,
  ArrowUpRight
} from 'lucide-react';
import api from '../../services/api';

export default function SuperAdminSubdomainRequests() {
  const [subdomains, setSubdomains] = useState([
    {
      id: 1,
      tenant: 'TechCorp Solutions India',
      subdomain: 'techcorp.intelliattend.io',
      customDomain: 'hrms.techcorp.in',
      sslStatus: 'Active (Let\'s Encrypt Wildcard)',
      cnameRecord: 'cname.intelliattend.io',
      status: 'Active',
      provisionedAt: '2026-01-10',
      routedCluster: 'ap-south-1 (Mumbai)'
    },
    {
      id: 2,
      tenant: 'Alpha Logistics Tech',
      subdomain: 'alphalogistics.intelliattend.io',
      customDomain: 'portal.alphalogistics.com',
      sslStatus: 'Active (Auto-Renewing)',
      cnameRecord: 'cname.intelliattend.io',
      status: 'Active',
      provisionedAt: '2026-02-14',
      routedCluster: 'ap-south-1 (Mumbai)'
    },
    {
      id: 3,
      tenant: 'Zenith Global Systems',
      subdomain: 'zenith.intelliattend.io',
      customDomain: 'hr.zenithglobal.co',
      sslStatus: 'Active',
      cnameRecord: 'cname.intelliattend.io',
      status: 'Active',
      provisionedAt: '2026-03-01',
      routedCluster: 'ap-south-1 (Mumbai)'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Globe className="w-6 h-6" />
            </span>
            Tenant Subdomain & Domain Routing
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Enterprise multi-tenant DNS routing, automated SSL certificate issuance, and custom domain CNAME mappings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Cloudflare Wildcard Ingress Active
          </span>
        </div>
      </div>

      {/* Cluster Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Subdomains</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{subdomains.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">SSL Coverage</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">100%</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Edge Latency (p99)</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">&lt; 14 ms</p>
          </div>
        </div>
      </div>

      {/* Routing Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Provisioned Tenant Hostnames
          </h2>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tenant or host..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-5">Tenant Organization</th>
                <th className="py-3.5 px-5">IntelliAttend Subdomain</th>
                <th className="py-3.5 px-5">Custom Domain Mapping</th>
                <th className="py-3.5 px-5">Edge Cluster</th>
                <th className="py-3.5 px-5">SSL Health</th>
                <th className="py-3.5 px-5">Routing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {subdomains
                .filter(s => s.tenant.toLowerCase().includes(searchTerm.toLowerCase()) || s.subdomain.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-4 px-5">
                      <p className="font-semibold text-slate-900 dark:text-white">{sub.tenant}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Created: {sub.provisionedAt}</p>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1.5 font-mono text-xs text-blue-600 dark:text-blue-400 font-medium">
                        {sub.subdomain}
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="font-mono text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                        {sub.customDomain}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-xs text-slate-600 dark:text-slate-400">
                      {sub.routedCluster}
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 w-fit">
                        <Lock className="w-3 h-3" />
                        {sub.sslStatus}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                        {sub.status}
                      </span>
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