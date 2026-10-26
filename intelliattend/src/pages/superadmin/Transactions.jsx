import PlaceholderPage from '../PlaceholderPage';
import { DollarSign } from 'lucide-react';

export default function SuperAdminTransactions() {
  return <PlaceholderPage title="Transactions" description="View and manage all transactions" icon={DollarSign} href="/superadmin/dashboard" />;
}