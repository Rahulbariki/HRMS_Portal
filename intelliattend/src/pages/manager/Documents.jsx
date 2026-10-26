import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search, Download, Eye, FolderOpen, Paperclip } from 'lucide-react';

const documents = [
  {
    id: 1,
    title: 'Employee Handbook 2025',
    category: 'Handbooks',
    type: 'PDF',
    size: '2.4 MB',
    version: 'v5.0',
    lastUpdated: '2025-11-15',
    status: 'published',
    tags: ['onboarding', 'policies', 'benefits'],
    description: 'Complete guide to company policies, benefits, and workplace expectations.',
  },
  {
    id: 2,
    title: 'Code of Conduct & Ethics',
    category: 'Policies',
    type: 'PDF',
    size: '1.8 MB',
    version: 'v2.3',
    lastUpdated: '2025-11-10',
    status: 'published',
    tags: ['compliance', 'ethics', 'conduct'],
    description: 'Standards of professional behavior and ethical guidelines.',
  },
  {
    id: 3,
    title: 'Data Privacy Policy',
    category: 'Policies',
    type: 'PDF',
    size: '2.1 MB',
    version: 'v3.1',
    lastUpdated: '2025-10-01',
    status: 'published',
    tags: ['gdpr', 'ferpa', 'privacy', 'security'],
    description: 'GDPR/FERPA compliant data handling and privacy procedures.',
  },
  {
    id: 4,
    title: 'Information Security Policy',
    category: 'Security',
    type: 'PDF',
    size: '3.2 MB',
    version: 'v4.0',
    lastUpdated: '2025-11-01',
    status: 'published',
    tags: ['soc2', 'iso27001', 'security', 'access-control'],
    description: 'Comprehensive security framework and compliance standards.',
  },
  {
    id: 5,
    title: 'Remote Work Guidelines',
    category: 'Operations',
    type: 'PDF',
    size: '1.2 MB',
    version: 'v1.2',
    lastUpdated: '2025-08-15',
    status: 'published',
    tags: ['hybrid', 'remote', 'workspace'],
    description: 'Guidelines for hybrid and remote work arrangements.',
  },
  {
    id: 6,
    title: 'Expense Reimbursement Policy',
    category: 'Finance',
    type: 'PDF',
    size: '1.5 MB',
    version: 'v2.1',
    lastUpdated: '2025-07-10',
    status: 'published',
    tags: ['expenses', 'reimbursement', 'travel'],
    description: 'Business expense claims, approval limits, and documentation.',
  },
  {
    id: 7,
    title: 'Onboarding Checklist Template',
    category: 'Templates',
    type: 'DOCX',
    size: '0.5 MB',
    version: 'v1.0',
    lastUpdated: '2025-09-01',
    status: 'published',
    tags: ['hr', 'onboarding', 'template'],
    description: 'Standardized new hire onboarding checklist for managers.',
  },
  {
    id: 8,
    title: 'Performance Review Form',
    category: 'Templates',
    type: 'DOCX',
    size: '0.8 MB',
    version: 'v2.0',
    lastUpdated: '2025-06-15',
    status: 'published',
    tags: ['performance', 'review', 'hr'],
    description: 'Annual performance evaluation template and guidelines.',
  },
  {
    id: 9,
    title: 'Incident Response Playbook',
    category: 'Security',
    type: 'PDF',
    size: '4.1 MB',
    version: 'v3.0',
    lastUpdated: '2025-10-20',
    status: 'published',
    tags: ['incident', 'security', 'response', 'soc'],
    description: 'Step-by-step security incident response procedures.',
  },
  {
    id: 10,
    title: 'API Documentation v2',
    category: 'Technical',
    type: 'HTML',
    size: '5.6 MB',
    version: 'v2.4',
    lastUpdated: '2025-11-01',
    status: 'published',
    tags: ['api', 'developers', 'integration'],
    description: 'Complete REST API reference with examples and SDKs.',
  },
];

export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const categories = ['all', 'Handbooks', 'Policies', 'Security', 'Operations', 'Finance', 'Templates', 'Technical'];
  const types = ['all', 'PDF', 'DOCX', 'HTML', 'XLSX', 'PPTX'];

  const filteredDocs = documents.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || d.category === selectedCategory;
    const matchesType = selectedType === 'all' || d.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'PDF': return <FileText className="h-5 w-5 text-red-500" />;
      case 'DOCX': return <FileText className="h-5 w-5 text-blue-500" />;
      case 'HTML': return <FileText className="h-5 w-5 text-orange-500" />;
      case 'XLSX': return <FileText className="h-5 w-5 text-green-500" />;
      case 'PPTX': return <FileText className="h-5 w-5 text-orange-500" />;
      default: return <FileText className="h-5 w-5 text-muted" />;
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      Handbooks: 'badge-primary',
      Policies: 'badge-accent',
      Security: 'badge-primary',
      Operations: 'badge-warning',
      Finance: 'badge-success',
      Templates: 'badge-info',
      Technical: 'badge-gray',
    };
    return colors[category] || 'badge-gray';
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Documents & Resources</h1>
          <p className="text-muted mt-1">Access company documents, templates, and technical resources</p>
        </div>
        <div className="flex gap-3">
          <Link to="/documents/upload" className="btn-primary w-auto sm:w-auto">
            <Paperclip className="h-4 w-4 mr-2" />
            Upload Document
          </Link>
        </div>
      </div>

      <div className="card-elevated p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
            <input
              type="text"
              placeholder="Search documents, tags, descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
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
            <label className="text-sm text-muted">Type:</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="input-field w-auto"
            >
              {types.map(type => (
                <option key={type} value={type}>{type === 'all' ? 'All Types' : type}</option>
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDocs.map((doc) => (
              <article key={doc.id} className="card-elevated p-6 hover:shadow-xl transition-shadow group">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                    {getTypeIcon(doc.type)}
                  </div>
                  <span className={`badge ${getCategoryColor(doc.category)} flex-shrink-0`}>
                    {doc.category}
                  </span>
                </div>
                <h3 className="font-display text-lg font-semibold text-primary mb-2 line-clamp-1">{doc.title}</h3>
                <p className="text-sm text-muted mb-4 line-clamp-2">{doc.description}</p>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {doc.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="badge badge-gray text-xs">{tag}</span>
                  ))}
                  {doc.tags.length > 3 && (
                    <span className="badge badge-gray text-xs">+{doc.tags.length - 3}</span>
                  )}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span>{doc.type}</span>
                    <span>•</span>
                    <span>{doc.size}</span>
                    <span>•</span>
                    <span>{doc.version}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-2 rounded-lg hover:bg-slate-100 text-muted transition-colors" aria-label="View">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-slate-100 text-muted transition-colors" aria-label="Download">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-primary">Document</th>
                  <th className="text-left py-3 px-4 font-semibold text-primary hidden md:table-cell">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-primary hidden lg:table-cell">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-primary hidden lg:table-cell">Size</th>
                  <th className="text-left py-3 px-4 font-semibold text-primary hidden xl:table-cell">Version</th>
                  <th className="text-left py-3 px-4 font-semibold text-primary hidden xl:table-cell">Updated</th>
                  <th className="text-right py-3 px-4 font-semibold text-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center">
                          {getTypeIcon(doc.type)}
                        </div>
                        <div>
                          <h4 className="font-medium text-primary">{doc.title}</h4>
                          <p className="text-sm text-muted line-clamp-1">{doc.description}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {doc.tags.slice(0, 2).map((tag) => (
                              <span key={tag} className="badge badge-gray text-[10px]">{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 hidden md:table-cell">
                      <span className={`badge ${getCategoryColor(doc.category)}`}>
                        {doc.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 hidden lg:table-cell text-sm text-muted">{doc.type}</td>
                    <td className="py-4 px-4 hidden lg:table-cell text-sm text-muted">{doc.size}</td>
                    <td className="py-4 px-4 hidden xl:table-cell text-sm text-muted">{doc.version}</td>
                    <td className="py-4 px-4 hidden xl:table-cell text-sm text-muted">{new Date(doc.lastUpdated).toLocaleDateString()}</td>
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

        {filteredDocs.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="h-16 w-16 mx-auto text-muted/30 mb-4" />
            <p className="text-muted">No documents found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}