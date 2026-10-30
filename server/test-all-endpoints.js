import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const API_BASE_URL = (process.env.API_BASE_URL || 'http://localhost:5001').replace(/\/+$/, '');
const JWT_SECRET = process.env.JWT_SECRET || 'intelliattend-jwt-secret-key-2026';

const superadminToken = jwt.sign(
  { id: 'IA-SA-001', email: 'rahulbariki.intelliattend@gmail.com', role: 'superadmin', name: 'Rahul Bariki' },
  JWT_SECRET,
  { expiresIn: '1d' }
);

const clientToken = jwt.sign(
  { id: 'IA-CA-001', email: 'clientadmin.intelliattend@gmail.com', role: 'client', name: 'Alex Rivera' },
  JWT_SECRET,
  { expiresIn: '1d' }
);

const managerToken = jwt.sign(
  { id: 'IA-MG-001', email: 'manager.intelliattend@gmail.com', role: 'manager', name: 'David Chen' },
  JWT_SECRET,
  { expiresIn: '1d' }
);

const payrollToken = jwt.sign(
  { id: 'IA-PA-001', email: 'payrolladmin.intelliattend@gmail.com', role: 'payroll_admin', name: 'James Wilson' },
  JWT_SECRET,
  { expiresIn: '1d' }
);

const employeeToken = jwt.sign(
  { id: 'IA-EM-001', email: 'employee.intelliattend@gmail.com', role: 'employee', name: 'Sarah Miller' },
  JWT_SECRET,
  { expiresIn: '1d' }
);

const endpointsToTest = [
  // SuperAdmin endpoints
  { method: 'GET', url: '/api/superadmin/dashboard/stats', token: superadminToken },
  { method: 'GET', url: '/api/superadmin/audit-logs', token: superadminToken },
  { method: 'GET', url: '/api/superadmin/subdomain-requests', token: superadminToken },
  { method: 'GET', url: '/api/companies', token: superadminToken },
  { method: 'GET', url: '/api/plans', token: superadminToken },
  { method: 'GET', url: '/api/transactions', token: superadminToken },

  // Client endpoints
  { method: 'GET', url: '/api/client/dashboard-stats', token: clientToken },
  { method: 'GET', url: '/api/billing/overview?email=clientadmin.intelliattend@gmail.com', token: clientToken },
  { method: 'GET', url: '/api/billing/invoices?email=clientadmin.intelliattend@gmail.com', token: clientToken },

  // Manager endpoints
  { method: 'GET', url: '/api/manager/dashboard-stats', token: managerToken },
  { method: 'GET', url: '/api/manager/employees', token: managerToken },
  { method: 'GET', url: '/api/manager/departments', token: managerToken },
  { method: 'GET', url: '/api/manager/designations', token: managerToken },
  { method: 'GET', url: '/api/manager/income-records', token: managerToken },
  { method: 'GET', url: '/api/manager/income-types', token: managerToken },
  { method: 'GET', url: '/api/manager/internal-expenses', token: managerToken },
  { method: 'GET', url: '/api/manager/employee-salaries', token: managerToken },
  { method: 'GET', url: '/api/manager/payroll-admins', token: managerToken },
  { method: 'GET', url: '/api/manager/letters', token: managerToken },
  { method: 'GET', url: '/api/manager/letters/templates', token: managerToken },
  { method: 'GET', url: '/api/attendance/team', token: managerToken },
  { method: 'GET', url: '/api/leaves/team', token: managerToken },
  { method: 'GET', url: '/api/expenses/team', token: managerToken },
  { method: 'GET', url: '/api/salary/team', token: managerToken },

  // Payroll Admin endpoints
  { method: 'GET', url: '/api/payroll-admin/dashboard', token: payrollToken },
  { method: 'GET', url: '/api/payroll-admin/invoices', token: payrollToken },

  // Employee endpoints
  { method: 'GET', url: '/api/employee/attendance/summary?userId=IA-EM-001', token: employeeToken },
  { method: 'GET', url: '/api/attendance/today?userId=IA-EM-001', token: employeeToken },
  { method: 'GET', url: '/api/attendance/logs?userId=IA-EM-001', token: employeeToken },
  { method: 'GET', url: '/api/leaves/balances?userId=IA-EM-001', token: employeeToken },
  { method: 'GET', url: '/api/leaves/my-requests?userId=IA-EM-001', token: employeeToken },
  { method: 'GET', url: '/api/employee/leaves/balance', token: employeeToken },
  { method: 'GET', url: '/api/employee/letters?userId=IA-EM-001', token: employeeToken },
  { method: 'GET', url: '/api/tasks', token: employeeToken },
  { method: 'GET', url: '/api/expenses/my?userId=IA-EM-001', token: employeeToken },
  { method: 'GET', url: '/api/salary/structure?userId=IA-EM-001', token: employeeToken },
  { method: 'GET', url: '/api/salary/payslips?userId=IA-EM-001', token: employeeToken },
  { method: 'GET', url: '/api/regularizations?userId=IA-EM-001', token: employeeToken },
  { method: 'GET', url: '/api/offboarding/status?userId=IA-EM-001', token: employeeToken },

  // Universal features: Chat, Mail, News, Policies, Documents, Holidays, Notifications
  { method: 'GET', url: '/api/chat/conversations', token: employeeToken },
  { method: 'GET', url: '/api/mail/emails', token: employeeToken },
  { method: 'GET', url: '/api/announcements', token: employeeToken },
  { method: 'GET', url: '/api/policies', token: employeeToken },
  { method: 'GET', url: '/api/documents', token: employeeToken },
  { method: 'GET', url: '/api/holidays', token: employeeToken },
  { method: 'GET', url: '/api/notifications?page=1', token: employeeToken },
  { method: 'GET', url: '/api/users/directory', token: employeeToken },
  { method: 'GET', url: '/api/tickets?userEmail=employee.intelliattend@gmail.com', token: employeeToken },
];

async function runTests() {
  console.log(`Testing all endpoints against live server ${API_BASE_URL}...\n`);
  const results = { passed: 0, failed: 0, errors: [] };

  for (const ep of endpointsToTest) {
    try {
      const res = await fetch(`${API_BASE_URL}${ep.url}`, {
        method: ep.method,
        headers: {
          'Authorization': `Bearer ${ep.token}`,
          'Content-Type': 'application/json'
        }
      });

      const status = res.status;
      let body;
      try {
        body = await res.json();
      } catch {
        body = await res.text();
      }

      if (status >= 200 && status < 300) {
        results.passed++;
        console.log(`✓ [${status}] ${ep.method} ${ep.url}`);
      } else {
        results.failed++;
        console.error(`✗ [${status}] ${ep.method} ${ep.url} ->`, typeof body === 'object' ? JSON.stringify(body) : body);
        results.errors.push({ url: ep.url, status, error: body });
      }
    } catch (err) {
      results.failed++;
      console.error(`✗ [FAIL] ${ep.method} ${ep.url} -> ${err.message}`);
      results.errors.push({ url: ep.url, error: err.message });
    }
  }

  console.log(`\n========================================`);
  console.log(`Tests Completed: ${results.passed} Passed, ${results.failed} Failed`);
  console.log(`========================================`);

  if (results.failed > 0) {
    process.exitCode = 1;
  }
}

runTests();

