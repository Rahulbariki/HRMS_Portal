import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import SuperAdminDashboard from './pages/superadmin/Dashboard';
import SuperAdminCompanies from './pages/superadmin/Companies';
import SuperAdminPlanManagement from './pages/superadmin/PlanManagement';
import SuperAdminTransactions from './pages/superadmin/Transactions';
import SuperAdminInvoices from './pages/superadmin/Invoices';
import SuperAdminAdminManagement from './pages/superadmin/AdminManagement';
import SuperAdminClients from './pages/superadmin/Clients';
import SuperAdminSubdomainRequests from './pages/superadmin/SubdomainRequests';
import SuperAdminContactQueries from './pages/superadmin/ContactQueries';
import SuperAdminSupportTickets from './pages/superadmin/SupportTickets';
import SuperAdminPaymentGateways from './pages/superadmin/PaymentGateways';
import SuperAdminWebsiteSettings from './pages/superadmin/WebsiteSettings';
import SuperAdminEmailSettings from './pages/superadmin/EmailSettings';
import SuperAdminAuditLogs from './pages/superadmin/AuditLogs';
import SuperAdminSettings from './pages/superadmin/Settings';
import SuperAdminProfile from './pages/superadmin/Profile';
import ClientDashboard from './pages/client/Dashboard';
import ClientManagers from './pages/client/Managers';
import ClientPolicies from './pages/client/Policies';
import ClientBillings from './pages/client/Billings';
import ClientSupport from './pages/client/Support';
import ClientSettings from './pages/client/Settings';
import ClientProfile from './pages/client/Profile';
import ManagerDashboard from './pages/manager/Dashboard';
import ManagerLeaves from './pages/manager/Leaves';
import ManagerTasks from './pages/manager/Tasks';
import ManagerPolicies from './pages/manager/Policies';
import ManagerDocuments from './pages/manager/Documents';
import ManagerNews from './pages/manager/News';
import ManagerHolidays from './pages/manager/Holidays';
import ManagerAttendance from './pages/manager/Attendance';
import ManagerExpenses from './pages/manager/Expenses';
import ManagerSalary from './pages/manager/Salary';
import ManagerOffboarding from './pages/manager/Offboarding';
import ManagerLetters from './pages/manager/Letters';
import ManagerQueries from './pages/manager/Queries';
import ManagerSettings from './pages/manager/Settings';
import ManagerProfile from './pages/manager/Profile';
import ManagerEmployees from './pages/manager/Employees';
import ManagerDepartmentDesignations from './pages/manager/DepartmentDesignations';
import ManagerAllocateLeaves from './pages/manager/AllocateLeaves';
import ManagerInternalExpenses from './pages/manager/InternalExpenses';
import ManagerIncome from './pages/manager/Income';
import ManagerEmployeeSalaries from './pages/manager/EmployeeSalaries';
import ManagerPayrollAdmins from './pages/manager/PayrollAdmins';
import PayrollAdminDashboard from './pages/payroll-admin/Dashboard';
import PayrollAdminEmployees from './pages/payroll-admin/Employees';
import PayrollAdminInvoices from './pages/payroll-admin/Invoices';
import PayrollAdminSettings from './pages/payroll-admin/Settings';
import EmployeeDashboard from './pages/employee/Dashboard';
import EmployeeLeaves from './pages/employee/Leaves';
import EmployeeTasks from './pages/employee/Tasks';
import EmployeePolicies from './pages/employee/Policies';
import EmployeeDocuments from './pages/employee/Documents';
import EmployeeNews from './pages/employee/News';
import EmployeeHolidays from './pages/employee/Holidays';
import EmployeeAttendance from './pages/employee/Attendance';
import EmployeeExpenses from './pages/employee/Expenses';
import EmployeeSalary from './pages/employee/Salary';
import EmployeeOffboarding from './pages/employee/Offboarding';
import EmployeeLetters from './pages/employee/Letters';
import EmployeeSupportQuery from './pages/employee/SupportQuery';
import EmployeeSettings from './pages/employee/Settings';
import EmployeeProfile from './pages/employee/Profile';
import EmployeeOrgChart from './pages/employee/OrgChart';
import EmployeeMail from './pages/employee/Mail';
import EmployeeChat from './pages/employee/Chat';
import EmployeeRegularization from './pages/employee/Regularization';
import VerifyEmployee from './pages/VerifyEmployee';
import CompanyLoginPage from './pages/CompanyLoginPage';
import SuperAdminLoginPage from './pages/SuperAdminLoginPage';
import ErrorBoundary from './components/ErrorBoundary';

function ProtectedRoute({ children, allowedRoles }) {
  const { isLoggedIn, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isLoggedIn || !user || !user.role) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const roleRoutes = {
      superadmin: '/superadmin/dashboard',
      client: '/client/dashboard',
      manager: '/manager/dashboard',
      payroll_admin: '/payroll-admin/dashboard',
      employee: '/employee/dashboard',
    };
    return <Navigate to={roleRoutes[user.role] || '/login'} replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { isLoggedIn, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (isLoggedIn && user?.role) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function RoleDashboardRedirect() {
  const { user } = useAuth();
  if (!user || !user.role) {
    return <Navigate to="/login" replace />;
  }
  const roleRoutes = {
    superadmin: '/superadmin/dashboard',
    client: '/client/dashboard',
    manager: '/manager/dashboard',
    payroll_admin: '/payroll-admin/dashboard',
    employee: '/employee/dashboard',
  };
  return <Navigate to={roleRoutes[user.role] || '/employee/dashboard'} replace />;
}

function RootRoute() {
  const { isLoggedIn, user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  if (isLoggedIn && user?.role) {
    return <RoleDashboardRedirect />;
  }
  return <LoginPage />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <RoleDashboardRedirect />
          </ProtectedRoute>
        }
      />
      <Route path="/company/:slug" element={<CompanyLoginPage />} />
      <Route path="/verify-employee" element={<VerifyEmployee />} />
      <Route path="/company-login" element={<CompanyLoginPage />} />
      <Route path="/superadmin/login" element={<SuperAdminLoginPage />} />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        }
      />

      <Route element={<MainLayout />}>
        <Route
          path="/superadmin/*"
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <Routes>
                <Route path="dashboard" element={<SuperAdminDashboard />} />
                <Route path="companies" element={<SuperAdminCompanies />} />
                <Route path="plan-management" element={<SuperAdminPlanManagement />} />
                <Route path="transactions" element={<SuperAdminTransactions />} />
                <Route path="invoices" element={<SuperAdminInvoices />} />
                <Route path="admin-management" element={<SuperAdminAdminManagement />} />
                <Route path="clients" element={<SuperAdminClients />} />
                <Route path="subdomain-requests" element={<SuperAdminSubdomainRequests />} />
                <Route path="contact-queries" element={<SuperAdminContactQueries />} />
                <Route path="support-tickets" element={<SuperAdminSupportTickets />} />
                <Route path="payment-gateways" element={<SuperAdminPaymentGateways />} />
                <Route path="website-settings" element={<SuperAdminWebsiteSettings />} />
                <Route path="email-settings" element={<SuperAdminEmailSettings />} />
                <Route path="audit-logs" element={<SuperAdminAuditLogs />} />
                <Route path="settings" element={<SuperAdminSettings />} />
                <Route path="profile" element={<SuperAdminProfile />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </ProtectedRoute>
          }
        />

        <Route
          path="/client/*"
          element={
            <ProtectedRoute allowedRoles={['client']}>
              <Routes>
                <Route path="dashboard" element={<ClientDashboard />} />
                <Route path="managers" element={<ClientManagers />} />
                <Route path="policies" element={<ClientPolicies />} />
                <Route path="billings" element={<ClientBillings />} />
                <Route path="support" element={<ClientSupport />} />
                <Route path="settings" element={<ClientSettings />} />
                <Route path="profile" element={<ClientProfile />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </ProtectedRoute>
          }
        />

        <Route
          path="/manager/*"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <Routes>
                <Route path="dashboard" element={<ManagerDashboard />} />
                <Route path="leaves" element={<ManagerLeaves />} />
                <Route path="tasks" element={<ManagerTasks />} />
                <Route path="chat" element={<EmployeeChat />} />
                <Route path="mail" element={<EmployeeMail />} />
                <Route path="policies" element={<ManagerPolicies />} />
                <Route path="documents" element={<ManagerDocuments />} />
                <Route path="news" element={<ManagerNews />} />
                <Route path="holidays" element={<ManagerHolidays />} />
                <Route path="attendance" element={<ManagerAttendance />} />
                <Route path="regularization" element={<EmployeeRegularization />} />
                <Route path="expenses" element={<ManagerExpenses />} />
                <Route path="salary" element={<ManagerSalary />} />
                <Route path="offboarding" element={<ManagerOffboarding />} />
                <Route path="letters" element={<ManagerLetters />} />
                <Route path="org-chart" element={<EmployeeOrgChart />} />
                <Route path="queries" element={<ManagerQueries />} />
                <Route path="settings" element={<ManagerSettings />} />
                <Route path="profile" element={<ManagerProfile />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee/*"
          element={
            <ProtectedRoute allowedRoles={['employee']}>
              <Routes>
                <Route path="dashboard" element={<EmployeeDashboard />} />
                <Route path="chat" element={<EmployeeChat />} />
                <Route path="mail" element={<EmployeeMail />} />
                <Route path="leaves" element={<EmployeeLeaves />} />
                <Route path="tasks" element={<EmployeeTasks />} />
                <Route path="news" element={<EmployeeNews />} />
                <Route path="documents" element={<EmployeeDocuments />} />
                <Route path="holidays" element={<EmployeeHolidays />} />
                <Route path="attendance" element={<EmployeeAttendance />} />
                <Route path="regularization" element={<EmployeeRegularization />} />
                <Route path="expenses" element={<EmployeeExpenses />} />
                <Route path="salary" element={<EmployeeSalary />} />
                <Route path="letters" element={<EmployeeLetters />} />
                <Route path="offboarding" element={<EmployeeOffboarding />} />
                <Route path="policies" element={<EmployeePolicies />} />
                <Route path="org-chart" element={<EmployeeOrgChart />} />
                <Route path="support-query" element={<EmployeeSupportQuery />} />
                <Route path="settings" element={<EmployeeSettings />} />
                <Route path="profile" element={<EmployeeProfile />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}