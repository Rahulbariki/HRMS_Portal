import bcrypt from 'bcryptjs';

export function setupEnhancedRoutes(app, { sql, authenticateToken, upload, formatUserResponse }) {
  console.log('✓ Registering Enhanced Architecture API routes...');

  // ----------------------------------------------------
  // 1. DEPARTMENTS & DESIGNATIONS
  // ----------------------------------------------------
  app.get(['/api/manager/departments', '/api/client/departments'], async (req, res) => {
    try {
      const rows = await sql`
        SELECT d.*, 
          COALESCE((SELECT COUNT(*)::int FROM users u WHERE u.department = d.name AND (u.is_active = true OR u.status = 'active')), 0) AS employee_count
        FROM departments d
        ORDER BY d.id ASC
      `;
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error('Error fetching departments:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch departments' });
    }
  });

  app.post('/api/manager/departments', async (req, res) => {
    try {
      const { name, code, head_name, description, status = 'active' } = req.body;
      if (!name) return res.status(400).json({ success: false, message: 'Department name required' });

      const [dept] = await sql`
        INSERT INTO departments (name, code, head_name, description, status)
        VALUES (${name}, ${code || name.substring(0, 3).toUpperCase()}, ${head_name || 'Unassigned'}, ${description || ''}, ${status})
        RETURNING *
      `;
      res.status(201).json({ success: true, data: dept, message: 'Department created successfully' });
    } catch (err) {
      console.error('Error creating department:', err);
      res.status(500).json({ success: false, message: 'Failed to create department' });
    }
  });

  app.put('/api/manager/departments/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, code, head_name, description, status } = req.body;
      const [dept] = await sql`
        UPDATE departments SET
          name = COALESCE(${name}, name),
          code = COALESCE(${code}, code),
          head_name = COALESCE(${head_name}, head_name),
          description = COALESCE(${description}, description),
          status = COALESCE(${status}, status)
        WHERE id = ${id}
        RETURNING *
      `;
      if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
      res.json({ success: true, data: dept, message: 'Department updated successfully' });
    } catch (err) {
      console.error('Error updating department:', err);
      res.status(500).json({ success: false, message: 'Failed to update department' });
    }
  });

  app.put('/api/manager/departments/:id/toggle', async (req, res) => {
    try {
      const { id } = req.params;
      const [dept] = await sql`
        UPDATE departments 
        SET status = CASE WHEN status = 'active' THEN 'inactive' ELSE 'active' END
        WHERE id = ${id}
        RETURNING *
      `;
      res.json({ success: true, data: dept, message: 'Department status toggled' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to toggle status' });
    }
  });

  app.delete('/api/manager/departments/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await sql`DELETE FROM departments WHERE id = ${id}`;
      res.json({ success: true, message: 'Department deleted successfully' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to delete department' });
    }
  });

  // DESIGNATIONS
  app.get(['/api/manager/designations', '/api/client/designations'], async (req, res) => {
    try {
      const rows = await sql`
        SELECT des.*,
          COALESCE((SELECT COUNT(*)::int FROM users u WHERE u.designation = des.title AND (u.is_active = true OR u.status = 'active')), 0) AS employee_count
        FROM designations des
        ORDER BY des.id ASC
      `;
      res.json({ success: true, data: rows });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch designations' });
    }
  });

  app.post('/api/manager/designations', async (req, res) => {
    try {
      const { title, department, level = 'Mid-Level', description, status = 'active' } = req.body;
      if (!title) return res.status(400).json({ success: false, message: 'Designation title required' });

      const [des] = await sql`
        INSERT INTO designations (title, department, level, description, status)
        VALUES (${title}, ${department || 'General'}, ${level}, ${description || ''}, ${status})
        RETURNING *
      `;
      res.status(201).json({ success: true, data: des, message: 'Designation created successfully' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to create designation' });
    }
  });

  app.put('/api/manager/designations/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { title, department, level, description, status } = req.body;
      const [des] = await sql`
        UPDATE designations SET
          title = COALESCE(${title}, title),
          department = COALESCE(${department}, department),
          level = COALESCE(${level}, level),
          description = COALESCE(${description}, description),
          status = COALESCE(${status}, status)
        WHERE id = ${id}
        RETURNING *
      `;
      res.json({ success: true, data: des, message: 'Designation updated successfully' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to update designation' });
    }
  });

  app.put('/api/manager/designations/:id/toggle', async (req, res) => {
    try {
      const { id } = req.params;
      const [des] = await sql`
        UPDATE designations 
        SET status = CASE WHEN status = 'active' THEN 'inactive' ELSE 'active' END
        WHERE id = ${id}
        RETURNING *
      `;
      res.json({ success: true, data: des, message: 'Designation status toggled' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to toggle status' });
    }
  });

  app.delete('/api/manager/designations/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await sql`DELETE FROM designations WHERE id = ${id}`;
      res.json({ success: true, message: 'Designation deleted successfully' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to delete designation' });
    }
  });

  // ----------------------------------------------------
  // 2. EMPLOYEES MANAGEMENT (Manager & Client)
  // ----------------------------------------------------
  app.get(['/api/manager/employees', '/api/client/employees', '/api/manager/all-staff'], async (req, res) => {
    try {
      const { search = '', department = '', status = 'all' } = req.query;

      let query = sql`
        SELECT u.id, u.email, u.role, u.first_name, u.last_name, u.designation,
               u.department, u.phone, u.emergency_phone, u.blood_group, u.doj,
               u.dob, u.gender, u.work_location, u.employment_type, u.shift,
               u.pan_number, u.bank_account, u.avatar_url, u.company_name, u.manager_name,
               COALESCE(u.status, 'active') AS status,
               COALESCE(u.is_active, true) AS is_active,
               COALESCE(s.monthly_gross_inr, 0) AS monthly_gross,
               COALESCE(s.annual_ctc_inr, 0) AS annual_ctc
        FROM users u
        LEFT JOIN salary_structures s ON u.id = s.user_id
        WHERE u.role IN ('employee', 'manager', 'payroll_admin')
      `;

      const rows = await query;
      let filtered = rows;

      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(u =>
          (u.first_name + ' ' + u.last_name).toLowerCase().includes(s) ||
          u.email.toLowerCase().includes(s) ||
          (u.designation || '').toLowerCase().includes(s) ||
          (u.department || '').toLowerCase().includes(s)
        );
      }

      if (department && department !== 'all') {
        filtered = filtered.filter(u => (u.department || '').toLowerCase() === department.toLowerCase());
      }

      if (status !== 'all') {
        filtered = filtered.filter(u => u.status === status || (status === 'active' && u.is_active));
      }

      const formatted = filtered.map(u => ({
        ...u,
        name: `${u.first_name} ${u.last_name}`,
        fullName: `${u.first_name} ${u.last_name}`.toUpperCase()
      }));

      res.json({ success: true, data: formatted, count: formatted.length });
    } catch (err) {
      console.error('Error fetching employees:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch employees' });
    }
  });

  app.get('/api/manager/employees/suggest-email', async (req, res) => {
    const { firstName = '', lastName = '' } = req.query;
    const cleanFirst = firstName.toLowerCase().replace(/[^a-z]/g, '');
    const cleanLast = lastName.toLowerCase().replace(/[^a-z]/g, '');
    const suggested = cleanFirst && cleanLast ? `${cleanFirst}.${cleanLast}@intelliattend.com` : 'employee@intelliattend.com';
    res.json({ success: true, suggestedEmail: suggested });
  });

  app.get('/api/manager/employees/:id/profile', async (req, res) => {
    try {
      const { id } = req.params;
      const rows = await sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`;
      if (rows.length === 0) return res.status(404).json({ success: false, message: 'Employee not found' });
      const salary = await sql`SELECT * FROM salary_structures WHERE user_id = ${id} LIMIT 1`;
      const leave = await sql`SELECT * FROM leave_balances WHERE user_id = ${id} LIMIT 1`;

      res.json({
        success: true,
        data: {
          user: rows[0],
          salary: salary[0] || null,
          leaveBalances: leave[0] || null
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch profile' });
    }
  });

  app.post('/api/manager/employees', async (req, res) => {
    try {
      const {
        first_name, last_name, email, role = 'employee', designation, department,
        phone, doj, dob, gender, address, work_location = 'Corporate HQ, Hyderabad',
        employment_type = 'Full-Time Regular', shift = 'General Day (09:00 AM - 06:00 PM)',
        annual_ctc = 850000
      } = req.body;

      if (!first_name || !last_name || !email) {
        return res.status(400).json({ success: false, message: 'First name, last name, and email required' });
      }

      const countResult = await sql`SELECT COUNT(*)::int AS count FROM users`;
      const newId = `IA-EM-${String(countResult[0].count + 1).padStart(3, '0')}`;
      const passwordHash = await bcrypt.hash('password123', 10);

      const [newUser] = await sql`
        INSERT INTO users (
          id, company_id, email, password_hash, role, first_name, last_name,
          designation, department, phone, doj, dob, gender, address,
          work_location, employment_type, shift, status, is_active,
          company_name, manager_name
        )
        VALUES (
          ${newId}, 1, ${email.toLowerCase().trim()}, ${passwordHash}, ${role},
          ${first_name}, ${last_name}, ${designation || 'Associate'},
          ${department || 'Engineering'}, ${phone || ''}, ${doj || new Date().toISOString().split('T')[0]},
          ${dob || ''}, ${gender || 'Not Specified'}, ${address || ''},
          ${work_location}, ${employment_type}, ${shift}, 'active', true,
          'IntelliAttend Technologies', 'David Chen'
        )
        RETURNING *
      `;

      // Initialize salary structure
      const grossMonthly = Math.round(annual_ctc / 12);
      const basic = Math.round(grossMonthly * 0.5);
      const hra = Math.round(basic * 0.4);
      const special = grossMonthly - basic - hra;
      const pf = 1800;
      const tds = Math.round(grossMonthly * 0.05);
      const pt = 200;
      const net = grossMonthly - pf - tds - pt;

      await sql`
        INSERT INTO salary_structures (
          user_id, user_name, designation, department, annual_ctc_inr,
          monthly_gross_inr, basic_salary, hra, special_allowance,
          performance_bonus, pf_deduction, tds_deduction, insurance_deduction,
          professional_tax, monthly_net_inr, bank_name, bank_account
        )
        VALUES (
          ${newId}, ${first_name + ' ' + last_name}, ${designation}, ${department},
          ${annual_ctc}, ${grossMonthly}, ${basic}, ${hra}, ${special},
          5000, ${pf}, ${tds}, 1000, ${pt}, ${net}, 'HDFC Bank', '•••• •••• 1001'
        )
        ON CONFLICT (user_id) DO NOTHING;
      `;

      // Initialize leave balance
      await sql`
        INSERT INTO leave_balances (user_id, annual_total, annual_used, sick_total, sick_used, casual_total, casual_used)
        VALUES (${newId}, 20, 0, 10, 0, 6, 0)
        ON CONFLICT (user_id) DO NOTHING;
      `;

      res.status(201).json({
        success: true,
        data: newUser,
        message: 'Employee successfully created and provisioned'
      });
    } catch (err) {
      console.error('Error creating employee:', err);
      res.status(500).json({ success: false, message: err.message || 'Failed to create employee' });
    }
  });

  app.put('/api/manager/employees/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { first_name, last_name, designation, department, phone, work_location, shift, status, is_active } = req.body;

      const [updated] = await sql`
        UPDATE users SET
          first_name = COALESCE(${first_name}, first_name),
          last_name = COALESCE(${last_name}, last_name),
          designation = COALESCE(${designation}, designation),
          department = COALESCE(${department}, department),
          phone = COALESCE(${phone}, phone),
          work_location = COALESCE(${work_location}, work_location),
          shift = COALESCE(${shift}, shift),
          status = COALESCE(${status}, status),
          is_active = COALESCE(${is_active}, is_active)
        WHERE id = ${id}
        RETURNING *
      `;
      res.json({ success: true, data: updated, message: 'Employee updated successfully' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to update employee' });
    }
  });

  app.put('/api/manager/employees/:id/promote', async (req, res) => {
    try {
      const { id } = req.params;
      const [u] = await sql`
        UPDATE users SET role = 'manager' WHERE id = ${id} RETURNING *
      `;
      res.json({ success: true, data: u, message: 'Employee promoted to Manager' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to promote employee' });
    }
  });

  app.put('/api/manager/employees/:id/demote', async (req, res) => {
    try {
      const { id } = req.params;
      const [u] = await sql`
        UPDATE users SET role = 'employee' WHERE id = ${id} RETURNING *
      `;
      res.json({ success: true, data: u, message: 'User role updated to Employee' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to demote employee' });
    }
  });

  app.put('/api/manager/employees/:id/reset-password', async (req, res) => {
    try {
      const { id } = req.params;
      const defaultHash = await bcrypt.hash('password123', 10);
      await sql`UPDATE users SET password_hash = ${defaultHash} WHERE id = ${id}`;
      res.json({ success: true, message: 'Password reset to "password123"' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to reset password' });
    }
  });

  app.delete('/api/manager/employees/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await sql`UPDATE users SET status = 'inactive', is_active = false WHERE id = ${id}`;
      res.json({ success: true, message: 'Employee deactivated successfully' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to deactivate employee' });
    }
  });

  // ----------------------------------------------------
  // 3. LEAVE ALLOCATION
  // ----------------------------------------------------
  app.post('/api/manager/leaves/allocate', async (req, res) => {
    try {
      const { targetType, targetId, annual = 20, sick = 10, casual = 6 } = req.body;

      if (targetType === 'department') {
        const usersInDept = await sql`SELECT id FROM users WHERE department = ${targetId}`;
        for (const u of usersInDept) {
          await sql`
            UPDATE leave_balances SET
              annual_total = ${annual},
              sick_total = ${sick},
              casual_total = ${casual}
            WHERE user_id = ${u.id}
          `;
        }
        res.json({ success: true, message: `Leaves allocated to department "${targetId}" (${usersInDept.length} staff)` });
      } else {
        await sql`
          UPDATE leave_balances SET
            annual_total = ${annual},
            sick_total = ${sick},
            casual_total = ${casual}
          WHERE user_id = ${targetId}
        `;
        res.json({ success: true, message: 'Leaves quota updated successfully' });
      }
    } catch (err) {
      console.error('Error allocating leaves:', err);
      res.status(500).json({ success: false, message: 'Failed to allocate leaves' });
    }
  });

  // ----------------------------------------------------
  // 4. INTERNAL EXPENSES
  // ----------------------------------------------------
  app.get('/api/manager/internal-expenses', async (req, res) => {
    try {
      const rows = await sql`
        SELECT * FROM internal_expenses ORDER BY expense_date DESC
      `;
      res.json({ success: true, data: rows });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch internal expenses' });
    }
  });

  app.post('/api/manager/internal-expenses', async (req, res) => {
    try {
      const { title, category, amount_inr, expense_date, vendor, payment_method, notes } = req.body;
      if (!title || !category || !amount_inr) {
        return res.status(400).json({ success: false, message: 'Title, category, and amount required' });
      }

      const [item] = await sql`
        INSERT INTO internal_expenses (
          title, category, amount_inr, expense_date, vendor, payment_method,
          status, notes, logged_by
        )
        VALUES (
          ${title}, ${category}, ${amount_inr}, ${expense_date || new Date().toISOString().split('T')[0]},
          ${vendor || 'Corporate Vendor'}, ${payment_method || 'Corporate Account'},
          'paid', ${notes || ''}, 'David Chen'
        )
        RETURNING *
      `;
      res.status(201).json({ success: true, data: item, message: 'Internal expense recorded' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to record expense' });
    }
  });

  app.delete('/api/manager/internal-expenses/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await sql`DELETE FROM internal_expenses WHERE id = ${id}`;
      res.json({ success: true, message: 'Internal expense deleted' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to delete expense' });
    }
  });

  // ----------------------------------------------------
  // 5. INCOME & REVENUE MANAGEMENT
  // ----------------------------------------------------
  app.get('/api/manager/income-types', async (req, res) => {
    try {
      const rows = await sql`SELECT * FROM income_types ORDER BY id ASC`;
      res.json({ success: true, data: rows });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch income types' });
    }
  });

  app.post('/api/manager/income-types', async (req, res) => {
    try {
      const { name, category, billing_cycle, default_amount } = req.body;
      const [it] = await sql`
        INSERT INTO income_types (name, category, billing_cycle, default_amount, status)
        VALUES (${name}, ${category || 'Client Retainer'}, ${billing_cycle || 'Monthly'}, ${default_amount || 0}, 'active')
        RETURNING *
      `;
      res.status(201).json({ success: true, data: it, message: 'Income stream created' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to create income stream' });
    }
  });

  app.get('/api/manager/income-records', async (req, res) => {
    try {
      const rows = await sql`SELECT * FROM income_records ORDER BY received_date DESC`;
      res.json({ success: true, data: rows });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch income records' });
    }
  });

  app.post('/api/manager/income-records', async (req, res) => {
    try {
      const { income_type_id, income_type_name, client_name, invoice_ref, amount_inr, received_date, payment_method, notes } = req.body;
      const [rec] = await sql`
        INSERT INTO income_records (
          income_type_id, income_type_name, client_name, invoice_ref,
          amount_inr, received_date, payment_method, status, notes
        )
        VALUES (
          ${income_type_id || 1}, ${income_type_name || 'Enterprise Retainer'},
          ${client_name}, ${invoice_ref || `INV-${Date.now()}`},
          ${amount_inr}, ${received_date || new Date().toISOString().split('T')[0]},
          ${payment_method || 'Bank Wire'}, 'received', ${notes || ''}
        )
        RETURNING *
      `;
      res.status(201).json({ success: true, data: rec, message: 'Income record logged' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to log income record' });
    }
  });

  // ----------------------------------------------------
  // 6. EMPLOYEE SALARY STRUCTURES
  // ----------------------------------------------------
  app.get('/api/manager/employee-salaries', async (req, res) => {
    try {
      const rows = await sql`
        SELECT s.*, u.email, u.first_name, u.last_name, u.role, u.status
        FROM salary_structures s
        JOIN users u ON s.user_id = u.id
        ORDER BY s.annual_ctc_inr DESC
      `;
      res.json({ success: true, data: rows });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch salary structures' });
    }
  });

  app.put('/api/manager/employee-salaries/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { annual_ctc_inr, basic_salary, hra, special_allowance, pf_deduction, tds_deduction, bank_name, bank_account } = req.body;

      const monthlyGross = Math.round(Number(annual_ctc_inr) / 12);
      const net = monthlyGross - Number(pf_deduction || 1800) - Number(tds_deduction || 0) - 200;

      const [updated] = await sql`
        UPDATE salary_structures SET
          annual_ctc_inr = ${annual_ctc_inr},
          monthly_gross_inr = ${monthlyGross},
          basic_salary = ${basic_salary},
          hra = ${hra},
          special_allowance = ${special_allowance},
          pf_deduction = ${pf_deduction},
          tds_deduction = ${tds_deduction},
          monthly_net_inr = ${net},
          bank_name = COALESCE(${bank_name}, bank_name),
          bank_account = COALESCE(${bank_account}, bank_account)
        WHERE user_id = ${userId}
        RETURNING *
      `;
      res.json({ success: true, data: updated, message: 'Salary structure updated' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to update salary' });
    }
  });

  // ----------------------------------------------------
  // 7. PAYROLL ADMINS & INVOICES
  // ----------------------------------------------------
  app.get('/api/manager/payroll-admins', async (req, res) => {
    try {
      const rows = await sql`
        SELECT pa.*, u.first_name, u.last_name, u.email, u.phone, u.designation
        FROM payroll_admins pa
        JOIN users u ON pa.user_id = u.id
      `;
      res.json({ success: true, data: rows });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch payroll admins' });
    }
  });

  app.post('/api/manager/payroll-admins', async (req, res) => {
    try {
      const { user_id, can_view_salaries = true, can_process_invoices = true } = req.body;
      const [pa] = await sql`
        INSERT INTO payroll_admins (user_id, assigned_by, can_view_salaries, can_process_invoices, status)
        VALUES (${user_id}, 'David Chen', ${can_view_salaries}, ${can_process_invoices}, 'active')
        ON CONFLICT (user_id) DO UPDATE SET status = 'active'
        RETURNING *
      `;
      await sql`UPDATE users SET role = 'payroll_admin' WHERE id = ${user_id}`;
      res.status(201).json({ success: true, data: pa, message: 'Payroll admin assigned' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to assign payroll admin' });
    }
  });

  app.get('/api/payroll-admin/dashboard', async (req, res) => {
    try {
      const [totalStaff] = await sql`SELECT COUNT(*)::int AS count FROM users WHERE role IN ('employee', 'manager') AND is_active = true`;
      const [pendingInvoices] = await sql`SELECT COUNT(*)::int AS count FROM payroll_invoices WHERE status = 'submitted'`;
      const [settledInvoices] = await sql`SELECT COALESCE(SUM(net_disbursal), 0)::numeric AS sum FROM payroll_invoices WHERE status = 'paid'`;

      res.json({
        success: true,
        data: {
          activeEmployees: totalStaff.count,
          pendingInvoices: pendingInvoices.count,
          totalDisbursed: settledInvoices.sum,
          payrollCycle: 'Monthly (30th EOM)'
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch payroll dashboard' });
    }
  });

  app.get('/api/payroll-admin/invoices', async (req, res) => {
    try {
      const rows = await sql`SELECT * FROM payroll_invoices ORDER BY year DESC, id DESC`;
      res.json({ success: true, data: rows });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch payroll invoices' });
    }
  });

  app.post('/api/payroll-admin/invoices', async (req, res) => {
    try {
      const { month, year = 2026, notes } = req.body;
      const salaryRows = await sql`SELECT monthly_gross_inr, pf_deduction, tds_deduction, monthly_net_inr FROM salary_structures`;
      
      const employeeCount = salaryRows.length || 5;
      const gross = salaryRows.reduce((acc, s) => acc + Number(s.monthly_gross_inr), 0) || 590000;
      const deductions = salaryRows.reduce((acc, s) => acc + Number(s.pf_deduction) + Number(s.tds_deduction), 0) || 48500;
      const net = gross - deductions;

      const invoiceNum = `PAY-INV-${year}-${String(month).substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;

      const [inv] = await sql`
        INSERT INTO payroll_invoices (
          invoice_number, month, year, total_employees, gross_amount,
          total_deductions, net_disbursal, status, generated_by, due_date, notes
        )
        VALUES (
          ${invoiceNum}, ${month}, ${year}, ${employeeCount}, ${gross},
          ${deductions}, ${net}, 'draft', 'James Wilson', CURRENT_DATE + INTERVAL '10 days', ${notes || ''}
        )
        RETURNING *
      `;
      res.status(201).json({ success: true, data: inv, message: 'Payroll invoice drafted' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to draft payroll invoice' });
    }
  });

  app.post('/api/payroll-admin/invoices/:id/submit', async (req, res) => {
    try {
      const { id } = req.params;
      const [inv] = await sql`
        UPDATE payroll_invoices SET status = 'submitted' WHERE id = ${id} RETURNING *
      `;
      res.json({ success: true, data: inv, message: 'Invoice submitted for manager/finance approval' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to submit invoice' });
    }
  });

  app.post('/api/payroll-admin/invoices/:id/cancel', async (req, res) => {
    try {
      const { id } = req.params;
      const [inv] = await sql`
        UPDATE payroll_invoices SET status = 'cancelled' WHERE id = ${id} RETURNING *
      `;
      res.json({ success: true, data: inv, message: 'Invoice marked as cancelled' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to cancel invoice' });
    }
  });

  // ----------------------------------------------------
  // 8. LETTERS & TEMPLATES
  // ----------------------------------------------------
  app.get('/api/manager/letters/templates', async (req, res) => {
    try {
      const rows = await sql`SELECT * FROM letter_templates ORDER BY id ASC`;
      res.json({ success: true, data: rows });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch templates' });
    }
  });

  app.post('/api/manager/letters/templates', async (req, res) => {
    try {
      const { title, type, subject, body_template } = req.body;
      const [tmpl] = await sql`
        INSERT INTO letter_templates (title, type, subject, body_template)
        VALUES (${title}, ${type}, ${subject || title}, ${body_template})
        RETURNING *
      `;
      res.status(201).json({ success: true, data: tmpl, message: 'Template saved' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to save template' });
    }
  });

  app.get(['/api/manager/letters', '/api/employee/letters'], async (req, res) => {
    try {
      const { userId } = req.query;
      let rows;
      if (userId) {
        rows = await sql`SELECT * FROM issued_letters WHERE user_id = ${userId} ORDER BY issue_date DESC`;
      } else {
        rows = await sql`SELECT * FROM issued_letters ORDER BY issue_date DESC`;
      }
      res.json({ success: true, data: rows });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch letters' });
    }
  });

  app.post('/api/manager/letters', async (req, res) => {
    try {
      const { user_id, user_name, letter_type, title, content } = req.body;
      const [letter] = await sql`
        INSERT INTO issued_letters (user_id, user_name, letter_type, title, issued_by, status, content)
        VALUES (${user_id}, ${user_name}, ${letter_type}, ${title}, 'David Chen', 'Issued', ${content || ''})
        RETURNING *
      `;
      res.status(201).json({ success: true, data: letter, message: 'Letter issued successfully' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to issue letter' });
    }
  });

  // ----------------------------------------------------
  // 9. OFFBOARDING & RELIEVING
  // ----------------------------------------------------
  app.get('/api/manager/offboarding-requests', async (req, res) => {
    try {
      const rows = await sql`SELECT * FROM offboarding_requests ORDER BY id DESC`;
      res.json({ success: true, data: rows });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch offboarding requests' });
    }
  });

  app.put('/api/manager/offboarding-requests/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { status, kt_status, asset_return_status, manager_remarks } = req.body;
      const [reqObj] = await sql`
        UPDATE offboarding_requests SET
          status = COALESCE(${status}, status),
          kt_status = COALESCE(${kt_status}, kt_status),
          asset_return_status = COALESCE(${asset_return_status}, asset_return_status),
          manager_remarks = COALESCE(${manager_remarks}, manager_remarks)
        WHERE id = ${id}
        RETURNING *
      `;
      res.json({ success: true, data: reqObj, message: 'Offboarding status updated' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to update offboarding' });
    }
  });

  app.post('/api/manager/offboarding-requests/:id/relieving-letter', async (req, res) => {
    try {
      const { id } = req.params;
      const [off] = await sql`SELECT * FROM offboarding_requests WHERE id = ${id}`;
      if (!off) return res.status(404).json({ success: false, message: 'Request not found' });

      const letterContent = `This is to certify that ${off.user_name} has successfully completed knowledge transfer and separation clearances as ${off.designation} at IntelliAttend Technologies.`;
      await sql`
        INSERT INTO issued_letters (user_id, user_name, letter_type, title, issued_by, status, content)
        VALUES (${off.user_id}, ${off.user_name}, 'Relieving', 'Official Relieving Certificate', 'David Chen', 'Issued', ${letterContent})
      `;

      await sql`
        UPDATE offboarding_requests SET
          relieving_letter_issued = true,
          status = 'completed'
        WHERE id = ${id}
      `;

      res.json({ success: true, message: 'Relieving letter generated and issued to employee' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to generate relieving letter' });
    }
  });

  app.get('/api/employee/offboarding', async (req, res) => {
    try {
      const rows = await sql`SELECT * FROM offboarding_requests WHERE user_id = 'IA-EM-001' ORDER BY id DESC LIMIT 1`;
      res.json({ success: true, data: rows[0] || null });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch offboarding status' });
    }
  });

  app.post('/api/employee/offboarding/resign', async (req, res) => {
    try {
      const { reason, requested_last_working_day, personal_email } = req.body;
      const [reqObj] = await sql`
        INSERT INTO offboarding_requests (
          user_id, user_name, department, designation, resignation_date,
          requested_last_working_day, reason, personal_email, status
        )
        VALUES (
          'IA-EM-001', 'Sarah Miller', 'Engineering', 'Lead Full-Stack Engineer',
          CURRENT_DATE, ${requested_last_working_day || new Date(Date.now() + 30*86400000).toISOString().split('T')[0]},
          ${reason}, ${personal_email || 'sarah.personal@gmail.com'}, 'pending'
        )
        RETURNING *
      `;
      res.status(201).json({ success: true, data: reqObj, message: 'Resignation submitted to management' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to submit resignation' });
    }
  });

  // ----------------------------------------------------
  // 10. NEWS & ANNOUNCEMENT COMMENTS
  // ----------------------------------------------------
  app.get(['/api/news/:id/comments', '/api/employee/news/:id/comments', '/api/manager/news/:id/comments'], async (req, res) => {
    try {
      const { id } = req.params;
      const rows = await sql`SELECT * FROM news_comments WHERE news_id = ${id} ORDER BY created_at ASC`;
      res.json({ success: true, data: rows });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch comments' });
    }
  });

  app.post(['/api/news/:id/comments', '/api/employee/news/:id/comments', '/api/manager/news/:id/comments'], async (req, res) => {
    try {
      const { id } = req.params;
      const { comment, user_name = 'David Chen', user_id = 'IA-MG-001' } = req.body;
      const [c] = await sql`
        INSERT INTO news_comments (news_id, user_id, user_name, comment)
        VALUES (${id}, ${user_id}, ${user_name}, ${comment})
        RETURNING *
      `;
      res.status(201).json({ success: true, data: c, message: 'Comment posted' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to post comment' });
    }
  });

  // ----------------------------------------------------
  // 11. USER PRESENCE & HEARTBEAT
  // ----------------------------------------------------
  app.post('/api/presence/heartbeat', async (req, res) => {
    try {
      const { userId = 'IA-MG-001', status = 'online' } = req.body;
      await sql`
        INSERT INTO user_presence (user_id, status, last_heartbeat)
        VALUES (${userId}, ${status}, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id) DO UPDATE SET
          status = EXCLUDED.status,
          last_heartbeat = CURRENT_TIMESTAMP
      `;
      res.json({ success: true, status: 'acknowledged' });
    } catch (err) {
      res.json({ success: true });
    }
  });

  app.get('/api/presence/statuses', async (req, res) => {
    try {
      const rows = await sql`SELECT user_id, status, custom_status, last_heartbeat FROM user_presence`;
      const map = {};
      rows.forEach(r => { map[r.user_id] = r.status; });
      res.json({ success: true, data: map, list: rows });
    } catch (err) {
      res.json({ success: true, data: {} });
    }
  });

  app.put('/api/presence/status', async (req, res) => {
    try {
      const { userId = 'IA-MG-001', status = 'online', customStatus = '' } = req.body;
      await sql`
        UPDATE user_presence SET
          status = ${status},
          custom_status = ${customStatus},
          last_heartbeat = CURRENT_TIMESTAMP
        WHERE user_id = ${userId}
      `;
      res.json({ success: true, message: 'Status updated' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to update status' });
    }
  });

  // ----------------------------------------------------
  // 12. CLIENT ACCESS CONTROL & SETTINGS
  // ----------------------------------------------------
  app.get('/api/client/managers/:id/access', async (req, res) => {
    try {
      const { id } = req.params;
      const rows = await sql`SELECT permissions FROM manager_access_control WHERE manager_id = ${id} LIMIT 1`;
      res.json({ success: true, data: rows[0]?.permissions || {} });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch access permissions' });
    }
  });

  app.put('/api/client/managers/:id/access', async (req, res) => {
    try {
      const { id } = req.params;
      const { permissions } = req.body;
      await sql`
        INSERT INTO manager_access_control (manager_id, permissions)
        VALUES (${id}, ${JSON.stringify(permissions)}::jsonb)
        ON CONFLICT (manager_id) DO UPDATE SET
          permissions = EXCLUDED.permissions,
          updated_at = CURRENT_TIMESTAMP
      `;
      res.json({ success: true, message: 'Manager access permissions updated' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to save permissions' });
    }
  });

  console.log('✓ All Enhanced API routes successfully bound.');
}
