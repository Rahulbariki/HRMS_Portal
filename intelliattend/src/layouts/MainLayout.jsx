import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

export default function MainLayout() {
  const { user, isLoggedIn, loading } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Outlet />;
  }

  const roleRoutes = {
    superadmin: '/superadmin/dashboard',
    client: '/client/dashboard',
    manager: '/manager/dashboard',
    employee: '/employee/dashboard',
  };

  const dashboardRoute = roleRoutes[user?.role] || '/login';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        user={user}
        dashboardRoute={dashboardRoute}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          user={user}
          onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}