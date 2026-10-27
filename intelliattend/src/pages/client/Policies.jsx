import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search, ChevronDown, ChevronUp, Download, Eye } from 'lucide-react';

const policies = [
  {
    id: 1,
    title: 'Code of Conduct & Ethics',
    category: 'Conduct',
    version: 'v2.3',
    lastUpdated: '2025-11-15',
    status: 'active',
    description: 'Standards of professional behavior, ethical guidelines, and compliance requirements for all employees.',
    content: `
      <h3>1. Purpose</h3>
      <p>This Code of Conduct establishes the standards of professional behavior expected from all employees, contractors, and representatives of our enterprise organization.</p>
      
      <h3>2. Core Values</h3>
      <ul>
        <li><strong>Integrity:</strong> We act honestly and ethically in all interactions.</li>
        <li><strong>Respect:</strong> We treat everyone with dignity and respect.</li>
        <li><strong>Excellence:</strong> We strive for quality in everything we do.</li>
        <li><strong>Innovation:</strong> We embrace change and continuous improvement.</li>
        <li><strong>Accountability:</strong> We take ownership of our actions and decisions.</li>
      </ul>
      
      <h3>3. Professional Conduct</h3>
      <p>All employees must:</p>
      <ul>
        <li>Comply with all applicable laws and regulations</li>
        <li>Avoid conflicts of interest</li>
        <li>Protect confidential information</li>
        <li>Use company resources responsibly</li>
        <li>Maintain a harassment-free workplace</li>
      </ul>
      
      <h3>4. Compliance & Reporting</h3>
      <p>Violations should be reported through the Ethics Hotline or to HR. Retaliation against good-faith reporters is strictly prohibited.</p>
    `,
  },
  {
    id: 2,
    title: 'Data Privacy & Protection Policy',
    category: 'Security',
    version: 'v3.1',
    lastUpdated: '2025-10-01',
    status: 'active',
    description: 'Guidelines for handling personal data, GDPR/FERPA compliance, and data subject rights.',
    content: `
      <h3>1. Scope</h3>
      <p>This policy applies to all personal data and employment records processed by the HRMS Portal.</p>
      
      <h3>2. Data Principles</h3>
      <ul>
        <li>Lawfulness, fairness, and transparency</li>
        <li>Purpose limitation</li>
        <li>Data minimization</li>
        <li>Accuracy</li>
        <li>Storage limitation</li>
        <li>Integrity and confidentiality</li>
      </ul>
      
      <h3>3. Data Subject Rights</h3>
      <p>Individuals have the right to access, rectify, erase, restrict processing, data portability, and object to processing.</p>
      
      <h3>4. Security Measures</h3>
      <ul>
        <li>AES-256 encryption at rest</li>
        <li>TLS 1.3 for data in transit</li>
        <li>Role-based access control</li>
        <li>Regular security audits</li>
        <li>Incident response procedures</li>
      </ul>
    `,
  },
  {
    id: 3,
    title: 'Attendance & Leave Policy',
    category: 'HR',
    version: 'v1.8',
    lastUpdated: '2025-09-20',
    status: 'active',
    description: 'Rules for attendance tracking, leave entitlements, approval workflows, and absence management.',
    content: `
      <h3>1. Attendance Requirements</h3>
      <p>All employees must record attendance daily via the HRMS Portal terminal or verified check-in.</p>
      
      <h3>2. Leave Entitlements (Annual)</h3>
      <ul>
        <li><strong>Annual Leave:</strong> 20 days (pro-rated for part-time)</li>
        <li><strong>Sick Leave:</strong> 10 days</li>
        <li><strong>Casual Leave:</strong> 5 days</li>
        <li><strong>Parental Leave:</strong> As per local law</li>
        <li><strong>Bereavement Leave:</strong> 3 days</li>
      </ul>
      
      <h3>3. Approval Workflow</h3>
      <ol>
        <li>Employee submits request via portal</li>
        <li>Manager reviews within 2 business days</li>
        <li>HR validates balance and approves</li>
        <li>Confirmation sent to employee</li>
      </ol>
      
      <h3>4. Unauthorized Absence</h3>
      <p>Three consecutive unauthorized absences may result in disciplinary action.</p>
    `,
  },
  {
    id: 4,
    title: 'Information Security Policy',
    category: 'Security',
    version: 'v4.0',
    lastUpdated: '2025-11-01',
    status: 'active',
    description: 'Comprehensive security framework covering access control, incident response, and compliance standards.',
    content: `
      <h3>1. Access Control</h3>
      <ul>
        <li>Principle of least privilege</li>
        <li>Multi-factor authentication required</li>
        <li>Quarterly access reviews</li>
        <li>Automated provisioning/deprovisioning</li>
      </ul>
      
      <h3>2. Network Security</h3>
      <ul>
        <li>Zero-trust architecture</li>
        <li>Encrypted communications (TLS 1.3)</li>
        <li>Intrusion detection systems</li>
        <li>Regular penetration testing</li>
      </ul>
      
      <h3>3. Incident Response</h3>
      <p>24/7 SOC monitoring with defined escalation procedures. Maximum 4-hour response for critical incidents.</p>
      
      <h3>4. Compliance</h3>
      <p>SOC 2 Type II, ISO 27001, GDPR, FERPA, CCPA compliant.</p>
    `,
  },
  {
    id: 5,
    title: 'Remote Work Policy',
    category: 'Operations',
    version: 'v1.2',
    lastUpdated: '2025-08-15',
    status: 'active',
    description: 'Guidelines for hybrid and remote work arrangements, eligibility, and expectations.',
    content: `
      <h3>1. Eligibility</h3>
      <p>Employees with 6+ months tenure and satisfactory performance may request remote work up to 3 days/week.</p>
      
      <h3>2. Requirements</h3>
      <ul>
        <li>Dedicated workspace meeting ergonomic standards</li>
        <li>Reliable internet (min 25 Mbps)</li>
        <li>Availability during core hours (10 AM - 3 PM local)</li>
        <li>Use of company-approved devices only</li>
      </ul>
      
      <h3>3. Security</h3>
      <p>VPN required for all remote connections. No public WiFi for sensitive work.</p>
    `,
  },
  {
    id: 6,
    title: 'Expense Reimbursement Policy',
    category: 'Finance',
    version: 'v2.1',
    lastUpdated: '2025-07-10',
    status: 'active',
    description: 'Rules for business expense claims, approval limits, documentation requirements, and reimbursement timelines.',
    content: `
      <h3>1. Reimbursable Expenses</h3>
      <ul>
        <li>Travel (transport, accommodation, meals)</li>
        <li>Client entertainment (with prior approval)</li>
        <li>Professional development</li>
        <li>Office supplies for remote work</li>
      </ul>
      
      <h3>2. Approval Limits</h3>
      <ul>
        <li>Up to ₹100: Manager approval</li>
        <li>₹100 - ₹500: Director approval</li>
        <li>₹500 - ₹2,000: VP approval</li>
        <li>Over ₹2,000: CFO approval</li>
      </ul>
      
      <h3>3. Documentation</h3>
      <p>Original receipts required for all expenses over ₹25. Digital copies accepted via mobile app.</p>
      
      <h3>4. Reimbursement Timeline</h3>
      <p>Approved expenses reimbursed within 5 business days via payroll.</p>
    `,
  },
];

export default function CompanyPoliciesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedPolicy, setExpandedPolicy] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  const categories = ['all', 'Conduct', 'Security', 'HR', 'Operations', 'Finance'];

  const filteredPolicies = policies.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status) => {
    const styles = {
      active: 'badge-success',
      draft: 'badge-warning',
      archived: 'badge-gray',
    };
    return styles[status] || 'badge-gray';
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Company Policies</h1>
          <p className="text-muted mt-1">Browse, search, and manage organizational policies</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary w-auto sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </button>
          <Link to="/policies/new" className="btn-primary w-auto sm:w-auto">
            <FileText className="h-4 w-4 mr-2" />
            New Policy
          </Link>
        </div>
      </div>

      <div className="card-elevated p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
            <input
              type="text"
              placeholder="Search policies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted">Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field w-auto"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
              ))}
            </select>
            <div className="flex items-center gap-1 border-l border-slate-200 pl-4 ml-4">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary-light text-primary' : 'text-muted hover:bg-slate-100'}`}
                aria-label="Grid view"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary-light text-primary' : 'text-muted hover:bg-slate-100'}`}
                aria-label="List view"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPolicies.map((policy) => (
              <article
                key={policy.id}
                className={`card-elevated p-6 transition-all ${expandedPolicy === policy.id ? 'ring-2 ring-primary' : ''}`}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <span className={`badge ${policy.category === 'Security' ? 'badge-primary' : policy.category === 'HR' ? 'badge-accent' : policy.category === 'Finance' ? 'badge-success' : policy.category === 'Operations' ? 'badge-warning' : 'badge-info'} mb-2 inline-block`}>
                      {policy.category}
                    </span>
                    <h3 className="font-display text-lg font-semibold text-primary mb-1">{policy.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted">
                      <span>{policy.version}</span>
                      <span>•</span>
                      <span>Updated {new Date(policy.lastUpdated).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className={`badge ${getStatusBadge(policy.status)} flex-shrink-0`}>
                    {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-muted mb-4 line-clamp-3">{policy.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setExpandedPolicy(expandedPolicy === policy.id ? null : policy.id)}
                    className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
                  >
                    {expandedPolicy === policy.id ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Collapse
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        Read More
                      </>
                    )}
                  </button>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-slate-100 text-muted transition-colors" aria-label="View">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-slate-100 text-muted transition-colors" aria-label="Download">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {expandedPolicy === policy.id && (
                  <div className="mt-4 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2">
                    <div className="prose prose-sm max-w-none text-muted">{policy.content}</div>
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-primary">Policy</th>
                  <th className="text-left py-3 px-4 font-semibold text-primary hidden md:table-cell">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-primary hidden lg:table-cell">Version</th>
                  <th className="text-left py-3 px-4 font-semibold text-primary hidden lg:table-cell">Updated</th>
                  <th className="text-left py-3 px-4 font-semibold text-primary">Status</th>
                  <th className="text-right py-3 px-4 font-semibold text-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPolicies.map((policy) => (
                  <tr key={policy.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-4">
                      <div>
                        <h4 className="font-medium text-primary">{policy.title}</h4>
                        <p className="text-sm text-muted line-clamp-1">{policy.description}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 hidden md:table-cell">
                      <span className={`badge ${policy.category === 'Security' ? 'badge-primary' : policy.category === 'HR' ? 'badge-accent' : policy.category === 'Finance' ? 'badge-success' : policy.category === 'Operations' ? 'badge-warning' : 'badge-info'}`}>
                        {policy.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 hidden lg:table-cell text-sm text-muted">{policy.version}</td>
                    <td className="py-4 px-4 hidden lg:table-cell text-sm text-muted">{new Date(policy.lastUpdated).toLocaleDateString()}</td>
                    <td className="py-4 px-4">
                      <span className={`badge ${getStatusBadge(policy.status)}`}>
                        {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 rounded-lg hover:bg-slate-100 text-muted transition-colors" aria-label="View">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-slate-100 text-muted transition-colors" aria-label="Download">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredPolicies.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto text-muted/30 mb-4" />
            <p className="text-muted">No policies found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}