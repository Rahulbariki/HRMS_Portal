import PlaceholderPage from '../PlaceholderPage';
import { DollarSign } from 'lucide-react';

export default function ManagerExpenses() {
  return <PlaceholderPage title="Expenses" description="Expense approvals" icon={DollarSign} href="/manager/dashboard" />;
}