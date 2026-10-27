import { Link } from 'react-router-dom';
import { Users, FileCheck, IndianRupee, HelpCircle, Settings, User } from 'lucide-react';

const pages = [
  { label: 'Managers', path: '/client/managers', icon: Users, desc: 'Manage company managers' },
  { label: 'Policies', path: '/client/policies', icon: FileCheck, desc: 'View and manage policies' },
  { label: 'Billings', path: '/client/billings', icon: IndianRupee, desc: 'Billing and subscription info' },
  { label: 'Support', path: '/client/support', icon: HelpCircle, desc: 'Contact support team' },
  { label: 'Settings', path: '/client/settings', icon: Settings, desc: 'Company settings' },
  { label: 'Profile', path: '/client/profile', icon: User, desc: 'Manage your profile' },
];

export default function ClientDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-primary">Client Dashboard</h1>
        <p className="text-muted mt-1">Manage your company account</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map((page, index) => (
          <Link
            key={index}
            to={page.path}
            className="card-elevated p-6 hover:shadow-xl transition-shadow group"
          >
            <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
              <page.icon className="h-6 w-6 text-primary group-hover:text-white transition-colors" />
            </div>
            <h3 className="font-display text-lg font-semibold text-primary mb-1">{page.label}</h3>
            <p className="text-sm text-muted">{page.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}