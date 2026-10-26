import PlaceholderPage from '../PlaceholderPage';
import { User } from 'lucide-react';

export default function ClientProfile() {
  return <PlaceholderPage title="Profile" description="Manage your profile" icon={User} href="/client/dashboard" />;
}