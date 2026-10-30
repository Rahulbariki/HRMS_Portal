import bcrypt from 'bcryptjs';
import defaultSql from './db.js';

export const isDmParticipant = async (convId, userId, userEmail = null, sqlClient = defaultSql) => {
  if (!convId || (!userId && !userEmail)) return false;
  if (!convId.startsWith('dm_') && !convId.startsWith('dm-')) {
    return true; // Not a DM (e.g. space channel)
  }

  const uid = (userId || '').toLowerCase().trim();
  const uemail = (userEmail || '').toLowerCase().trim();

  // For dm_ where both participant IDs are embedded, check them directly
  if (convId.startsWith('dm_')) {
    const parts = convId.slice(3).toLowerCase().split('_');
    if (uid && parts.includes(uid)) return true;
  }

  // Verify membership against the conversation's stored participant list in chat_conversations
  try {
    const rows = await sqlClient`
      SELECT participants, email 
      FROM chat_conversations 
      WHERE id = ${convId} 
      LIMIT 1;
    `;
    if (rows.length > 0) {
      const conv = rows[0];
      const pList = Array.isArray(conv.participants) ? conv.participants : [];
      if (pList.length > 0) {
        const lowerList = pList.map(p => String(p).toLowerCase().trim());
        if (uid && lowerList.includes(uid)) return true;
        if (uemail && lowerList.includes(uemail)) return true;
        return false;
      }
    }
  } catch (err) {
    console.error('Error verifying DM participant against stored conversation list:', err);
  }

  // Reject access when no stored participant list confirms the user
  return false;
};

export function setupEnhancedRoutes(app, { sql, authenticateToken, authorizeRoles, upload, formatUserResponse }) {
  console.log('✓ Registering Enhanced Architecture API routes...');

  // ----------------------------------------------------
  // 1. DEPARTMENTS & DESIGNATIONS
  // ----------------------------------------------------
  app.get(['/api/departments', '/api/manager/departments', '/api/client/departments'], async (req, res) => {
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
  app.get(['/api/designations', '/api/manager/designations', '/api/client/designations'], async (req, res) => {
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

      const maxEm = await sql`
        SELECT id FROM users 
        WHERE id ~ '^IA-EM-[0-9]+$' 
        ORDER BY CAST(SUBSTRING(id FROM '[0-9]+$') AS INTEGER) DESC 
        LIMIT 1
      `;
      let nextNum = 1;
      if (maxEm.length > 0) {
        const match = maxEm[0].id.match(/IA-EM-(\d+)/);
        if (match) nextNum = parseInt(match[1], 10) + 1;
      }
      const newId = `IA-EM-${String(nextNum).padStart(3, '0')}`;
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
      // Prevent unauthorized or lower-role password resets
      const [target] = await sql`SELECT role FROM users WHERE id = ${id} LIMIT 1`;
      if (!target) return res.status(404).json({ success: false, message: 'Target user not found' });
      if (target.role === 'superadmin' && req.user?.role !== 'superadmin') {
        return res.status(403).json({ success: false, message: 'Forbidden: Cannot reset superadmin credentials' });
      }

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
      const [target] = await sql`SELECT role FROM users WHERE id = ${id} LIMIT 1`;
      if (!target) return res.status(404).json({ success: false, message: 'Employee not found' });
      if (target.role === 'superadmin') {
        return res.status(403).json({ success: false, message: 'Forbidden: Superadmin accounts cannot be deactivated' });
      }

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
            INSERT INTO leave_balances (user_id, annual_total, annual_used, sick_total, sick_used, casual_total, casual_used, updated_at)
            VALUES (${u.id}, ${annual}, 0, ${sick}, 0, ${casual}, 0, NOW())
            ON CONFLICT (user_id) DO UPDATE SET
              annual_total = EXCLUDED.annual_total,
              sick_total = EXCLUDED.sick_total,
              casual_total = EXCLUDED.casual_total,
              updated_at = NOW()
          `;
        }
        res.json({ success: true, message: `Leaves allocated to department "${targetId}" (${usersInDept.length} staff)` });
      } else {
        await sql`
          INSERT INTO leave_balances (user_id, annual_total, annual_used, sick_total, sick_used, casual_total, casual_used, updated_at)
          VALUES (${targetId}, ${annual}, 0, ${sick}, 0, ${casual}, 0, NOW())
          ON CONFLICT (user_id) DO UPDATE SET
            annual_total = EXCLUDED.annual_total,
            sick_total = EXCLUDED.sick_total,
            casual_total = EXCLUDED.casual_total,
            updated_at = NOW()
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

  app.get('/api/payroll-admin/dashboard', authorizeRoles('payroll_admin', 'superadmin', 'client', 'client_admin'), async (req, res) => {
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

  app.get('/api/payroll-admin/invoices', authorizeRoles('payroll_admin', 'superadmin', 'client', 'client_admin'), async (req, res) => {
    try {
      const rows = await sql`SELECT * FROM payroll_invoices ORDER BY year DESC, id DESC`;
      res.json({ success: true, data: rows });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch payroll invoices' });
    }
  });

  app.post('/api/payroll-admin/invoices', authorizeRoles('payroll_admin', 'superadmin', 'client', 'client_admin'), async (req, res) => {
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

  app.post('/api/payroll-admin/invoices/:id/submit', authorizeRoles('payroll_admin', 'superadmin', 'client', 'client_admin'), async (req, res) => {
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

  app.post('/api/payroll-admin/invoices/:id/cancel', authorizeRoles('payroll_admin', 'superadmin', 'client', 'client_admin'), async (req, res) => {
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

  app.get('/api/manager/letters', async (req, res) => {
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

      if (off.kt_status !== 'completed' || off.asset_return_status !== 'returned') {
        return res.status(400).json({
          success: false,
          message: 'Both Knowledge Transfer (KT) and hardware asset return clearances must be completed before issuing a relieving letter'
        });
      }

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

  // ----------------------------------------------------
  // 13. REAL-TIME CHAT & MESSAGING
  // ----------------------------------------------------
  app.get('/api/chat/conversations', async (req, res) => {
    try {
      const currentUserId = req.user?.id || req.query.userId;
      const currentUserEmail = req.user?.email || req.query.userEmail;

      // 1. Ensure core corporate channels exist
      await sql`
        INSERT INTO chat_conversations (id, type, name, initials, designation, email, is_online, last_time, last_message, unread_count)
        VALUES 
          ('space-general', 'space', 'Company Announcements & All Hands', 'AH', 'All Corporate Staff', 'all@intelliattend.com', TRUE, 'Live', 'Welcome to the official company workspace chat.', 0),
          ('space-eng', 'space', 'Engineering & Technology Hub', 'ET', 'Tech & Platform Team', 'engineering@intelliattend.com', TRUE, 'Live', 'Sprint planning and deployment logs.', 0),
          ('space-ops', 'space', 'Operations & Leadership Hub', 'OL', 'Operations & Management Team', 'operations@intelliattend.com', TRUE, 'Live', 'Daily operations and workspace sync.', 0)
        ON CONFLICT (id) DO NOTHING;
      `;

      // 2. Resolve current user identity if provided
      let currentUser = null;
      if (currentUserId) {
        const [u] = await sql`SELECT * FROM users WHERE LOWER(id) = ${currentUserId.toLowerCase().trim()} LIMIT 1`;
        currentUser = u;
      } else if (currentUserEmail) {
        const [u] = await sql`SELECT * FROM users WHERE LOWER(email) = ${currentUserEmail.toLowerCase().trim()} LIMIT 1`;
        currentUser = u;
      }

      // 3. Single query to fetch latest message per conversation
      const latestMessages = await sql`
        SELECT DISTINCT ON (conversation_id) conversation_id, content, time
        FROM chat_messages
        ORDER BY conversation_id, id DESC
      `;
      const latestMsgMap = new Map();
      for (const m of latestMessages) {
        latestMsgMap.set(m.conversation_id, m);
      }

      // 4. Load all workspace channels from database
      const dbSpaces = await sql`
        SELECT * FROM chat_conversations 
        WHERE type = 'space' 
        ORDER BY created_at ASC, id ASC
      `;

      const spaceRows = dbSpaces.map(sp => {
        const lastMsg = latestMsgMap.get(sp.id);
        return {
          id: sp.id,
          type: 'space',
          name: sp.name,
          initials: sp.initials || sp.name.substring(0, 2).toUpperCase(),
          designation: sp.designation || 'Workspace Channel',
          email: sp.email || 'all@intelliattend.com',
          avatar: null,
          is_online: true,
          last_time: lastMsg ? lastMsg.time : sp.last_time || 'Live',
          last_message: lastMsg ? lastMsg.content : sp.last_message || 'Welcome to the channel.',
          unread_count: 0
        };
      });

      // 5. Prepare symmetric 1-on-1 direct messages
      let colleagues = [];
      if (currentUser) {
        colleagues = await sql`
          SELECT id, first_name, last_name, designation, email, role, avatar_url 
          FROM users 
          WHERE LOWER(id) != ${currentUser.id.toLowerCase()} 
          ORDER BY first_name ASC
        `;
      } else {
        colleagues = await sql`
          SELECT id, first_name, last_name, designation, email, role, avatar_url 
          FROM users 
          ORDER BY first_name ASC
        `;
      }

      const dmRows = colleagues.map(colleague => {
        const canonicalId = currentUser
          ? `dm_${[currentUser.id.toLowerCase(), colleague.id.toLowerCase()].sort().join('_')}`
          : `dm-${colleague.id.toLowerCase()}`;

        const lastMsg = latestMsgMap.get(canonicalId);
        const fullName = `${colleague.first_name} ${colleague.last_name}`.trim();
        const initials = `${colleague.first_name?.[0] || ''}${colleague.last_name?.[0] || ''}`.toUpperCase() || 'U';

        return {
          id: canonicalId,
          type: 'dm',
          name: fullName,
          initials,
          designation: colleague.designation || colleague.role,
          email: colleague.email,
          avatar: colleague.avatar_url || null,
          is_online: true,
          last_time: lastMsg ? lastMsg.time : 'Active',
          last_message: lastMsg ? lastMsg.content : 'Click to send message',
          unread_count: 0,
          otherUserId: colleague.id
        };
      });

      res.json({ success: true, data: [...spaceRows, ...dmRows] });
    } catch (err) {
      console.error('Error fetching chat conversations:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch conversations' });
    }
  });

  app.get('/api/chat/conversations/:id/messages', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;

      // Verify conversation membership for direct messages
      if ((id.startsWith('dm_') || id.startsWith('dm-')) && req.user?.id) {
        const isAllowed = await isDmParticipant(id, req.user.id, req.user.email, sql);
        if (!isAllowed) {
          return res.status(403).json({ success: false, message: 'Forbidden: You are not a participant in this conversation' });
        }
      }

      const rows = await sql`
        SELECT * FROM chat_messages 
        WHERE conversation_id = ${id} 
        ORDER BY id ASC
      `;
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error('Error fetching chat messages:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch messages' });
    }
  });

  app.post('/api/chat/messages', authenticateToken, async (req, res) => {
    try {
      const { 
        conversationId, 
        content, 
        senderName = 'Corporate Staff', 
        senderEmail = 'staff@intelliattend.com', 
        senderId = null,
        attachmentUrl = null,
        attachmentName = null,
        attachmentType = null
      } = req.body;

      if (!conversationId || (!content && !attachmentUrl)) {
        return res.status(400).json({ success: false, message: 'conversationId and content/attachment are required' });
      }

      const currentSenderId = req.user?.id || senderId;
      const currentSenderEmail = req.user?.email || senderEmail;
      const currentSenderName = req.user?.name || `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim() || senderName;

      // Verify conversation membership for direct messages
      if ((conversationId.startsWith('dm_') || conversationId.startsWith('dm-')) && currentSenderId) {
        const isAllowed = await isDmParticipant(conversationId, currentSenderId, currentSenderEmail, sql);
        if (!isAllowed) {
          return res.status(403).json({ success: false, message: 'Forbidden: You are not a participant in this conversation' });
        }
      }

      const timeNow = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
      const snippet = content || (attachmentName ? `📎 Attached: ${attachmentName}` : 'File shared');

      const [newMsg] = await sql`
        INSERT INTO chat_messages (
          conversation_id, sender_name, sender_email, sender_id, content, time, is_me,
          attachment_url, attachment_name, attachment_type
        )
        VALUES (
          ${conversationId}, ${currentSenderName}, ${currentSenderEmail}, ${currentSenderId}, ${snippet}, ${timeNow}, TRUE,
          ${attachmentUrl}, ${attachmentName}, ${attachmentType}
        )
        RETURNING *
      `;

      // Update conversation last message & time
      await sql`
        UPDATE chat_conversations SET
          last_message = ${snippet},
          last_time = ${timeNow}
        WHERE id = ${conversationId}
      `;

      res.status(201).json({ success: true, data: newMsg });
    } catch (err) {
      console.error('Error sending chat message:', err);
      res.status(500).json({ success: false, message: 'Failed to send message' });
    }
  });

  app.post('/api/chat/conversations', async (req, res) => {
    try {
      const { id, type = 'space', name, initials, designation, email, avatar = null } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, message: 'Channel/conversation name is required' });
      }

      const convId = id || (type === 'space' 
        ? `space-${name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}`
        : `dm-${Date.now()}`
      );
      const computedInitials = initials || name.substring(0, 2).toUpperCase();

      const [conv] = await sql`
        INSERT INTO chat_conversations (id, type, name, initials, designation, email, avatar, is_online, last_time, last_message, unread_count)
        VALUES (
          ${convId}, ${type}, ${name}, ${computedInitials}, 
          ${designation || (type === 'space' ? 'Team Channel' : 'Team Member')}, 
          ${email || (type === 'space' ? `${convId}@intelliattend.com` : '')}, 
          ${avatar}, TRUE, 'Just now', 'Channel created', 0
        )
        ON CONFLICT (id) DO UPDATE SET 
          name = EXCLUDED.name,
          designation = EXCLUDED.designation,
          is_online = TRUE
        RETURNING *
      `;
      res.status(201).json({ success: true, data: conv, message: 'Channel created successfully' });
    } catch (err) {
      console.error('Error creating conversation:', err);
      res.status(500).json({ success: false, message: 'Failed to create conversation' });
    }
  });

  app.delete('/api/chat/messages/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await sql`DELETE FROM chat_messages WHERE id = ${id}`;
      res.json({ success: true, message: 'Message deleted' });
    } catch (err) {
      console.error('Error deleting chat message:', err);
      res.status(500).json({ success: false, message: 'Failed to delete message' });
    }
  });

  // ----------------------------------------------------
  // 14. REAL-TIME CORPORATE MAIL
  // ----------------------------------------------------
  app.get('/api/mail/emails', async (req, res) => {
    try {
      const { folder } = req.query;
      const currentUserEmail = (req.user?.email || req.query.userEmail || '').toLowerCase().trim();

      // Seed initial corporate broadcast announcements if absent
      const [sysCount] = await sql`SELECT count(*)::int as count FROM corporate_emails WHERE is_system = TRUE`;
      if (!sysCount || sysCount.count === 0) {
        await sql`
          INSERT INTO corporate_emails (
            sender_name, sender_email, sender_initial, recipient_email, is_system,
            subject, snippet, body, folder, is_unread, is_starred, label, time, date
          )
          VALUES 
            (
              'IntelliAttend System', 'system@intelliattend.com', 'IS', 'all@intelliattend.com', TRUE,
              'Welcome to IntelliAttend Enterprise Cloud HRMS',
              'Welcome to your enterprise HRMS portal. Explore Attendance, Regularization, Chat, Mail, Leaves...',
              'Welcome to the unified IntelliAttend Enterprise HRMS portal!\n\nAll departments and staff members have full access to real-time chat, corporate mail, attendance tracking, shift scheduling, and leave approvals.\n\nPlease complete your profile verification and reach out to IT or HR for any workspace assistance.',
              'inbox', FALSE, TRUE, 'Corporate', '9:00 AM', 'Today'
            ),
            (
              'Executive Directorate', 'executive@intelliattend.com', 'ED', 'all@intelliattend.com', TRUE,
              'Quarterly Strategic Objectives & Innovation All-Hands',
              'Join us for our upcoming quarterly all-hands meeting focusing on next-generation platform releases...',
              'Dear Team,\n\nWe are pleased to invite everyone to our upcoming Quarterly All-Hands briefing. We will review key organizational milestones, platform scalability targets, and employee development initiatives.\n\nDate: This Friday at 4:00 PM EST.\nVenue: Executive Auditorium & Virtual Live Stream.',
              'inbox', TRUE, FALSE, 'Announcement', '10:30 AM', 'Today'
            ),
            (
              'IT Security & Infrastructure', 'security@intelliattend.com', 'SC', 'all@intelliattend.com', TRUE,
              'Workplace Security & Compliance Standard Operating Procedures',
              'Please review our updated information security protocols, 2FA credentials, and data privacy policies...',
              'All Personnel,\n\nAs part of our continuous commitment to SOC-2 and ISO compliance, please ensure your corporate credentials are kept confidential and two-factor authentication is active on all managed devices.\n\nFor any security inquiries, please contact security@intelliattend.com.',
              'inbox', TRUE, FALSE, 'Security', '11:15 AM', 'Today'
            );
        `;
      }

      let rows;
      if (folder === 'sent') {
        if (currentUserEmail) {
          rows = await sql`
            SELECT * FROM corporate_emails 
            WHERE folder = 'sent' AND LOWER(sender_email) = ${currentUserEmail}
            ORDER BY id DESC
          `;
        } else {
          rows = await sql`SELECT * FROM corporate_emails WHERE folder = 'sent' ORDER BY id DESC`;
        }
      } else if (folder === 'drafts') {
        if (currentUserEmail) {
          rows = await sql`
            SELECT * FROM corporate_emails 
            WHERE folder = 'drafts' AND LOWER(sender_email) = ${currentUserEmail}
            ORDER BY id DESC
          `;
        } else {
          rows = await sql`SELECT * FROM corporate_emails WHERE folder = 'drafts' ORDER BY id DESC`;
        }
      } else if (folder === 'trash') {
        if (currentUserEmail) {
          rows = await sql`
            SELECT * FROM corporate_emails 
            WHERE folder = 'trash' AND (
              LOWER(recipient_email) = ${currentUserEmail} OR 
              LOWER(sender_email) = ${currentUserEmail}
            )
            ORDER BY id DESC
          `;
        } else {
          rows = await sql`SELECT * FROM corporate_emails WHERE folder = 'trash' ORDER BY id DESC`;
        }
      } else if (folder === 'starred') {
        if (currentUserEmail) {
          rows = await sql`
            SELECT * FROM corporate_emails 
            WHERE is_starred = TRUE AND (
              LOWER(recipient_email) = ${currentUserEmail} OR 
              LOWER(sender_email) = ${currentUserEmail} OR
              LOWER(recipient_email) = 'all@intelliattend.com' OR
              is_system = TRUE
            )
            ORDER BY id DESC
          `;
        } else {
          rows = await sql`SELECT * FROM corporate_emails WHERE is_starred = TRUE ORDER BY id DESC`;
        }
      } else if (folder === 'inbox') {
        if (currentUserEmail) {
          rows = await sql`
            SELECT * FROM corporate_emails 
            WHERE folder = 'inbox' AND (
              LOWER(recipient_email) = ${currentUserEmail} OR 
              LOWER(recipient_email) = 'all' OR 
              LOWER(recipient_email) = 'all@intelliattend.com' OR
              (is_system = TRUE AND subject NOT IN (
                SELECT subject FROM corporate_emails 
                WHERE folder = 'trash' AND LOWER(recipient_email) = ${currentUserEmail}
              ))
            )
            ORDER BY id DESC
          `;
        } else {
          rows = await sql`SELECT * FROM corporate_emails WHERE folder = 'inbox' ORDER BY id DESC`;
        }
      } else {
        // All active emails for user
        if (currentUserEmail) {
          rows = await sql`
            SELECT * FROM corporate_emails 
            WHERE (
              (folder = 'inbox' AND (
                LOWER(recipient_email) = ${currentUserEmail} OR 
                LOWER(recipient_email) = 'all' OR 
                LOWER(recipient_email) = 'all@intelliattend.com' OR
                (is_system = TRUE AND subject NOT IN (
                  SELECT subject FROM corporate_emails 
                  WHERE folder = 'trash' AND LOWER(recipient_email) = ${currentUserEmail}
                ))
              )) OR
              (folder = 'sent' AND LOWER(sender_email) = ${currentUserEmail}) OR
              (folder = 'drafts' AND LOWER(sender_email) = ${currentUserEmail}) OR
              (folder = 'trash' AND (
                LOWER(recipient_email) = ${currentUserEmail} OR 
                LOWER(sender_email) = ${currentUserEmail}
              ))
            )
            ORDER BY id DESC
          `;
        } else {
          rows = await sql`SELECT * FROM corporate_emails ORDER BY id DESC`;
        }
      }

      res.json({ success: true, data: rows });
    } catch (err) {
      console.error('Error fetching emails:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch emails' });
    }
  });

  app.post('/api/mail/send', async (req, res) => {
    try {
      const { 
        to, 
        cc = '', 
        bcc = '', 
        subject, 
        body, 
        senderName = 'Corporate Staff', 
        senderEmail = 'staff@intelliattend.com', 
        label = 'General',
        attachments = '',
        draftId = null
      } = req.body;

      if (!to || !subject || !body) {
        return res.status(400).json({ success: false, message: 'Recipient, subject, and body are required' });
      }

      const actualSenderEmail = req.user?.email || senderEmail;
      const actualSenderName = req.user?.name || `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim() || senderName;

      // Exact recipient resolution: require exact email or exact full name
      const cleanTo = to.trim().toLowerCase();
      let recipientEmail = cleanTo;
      let recipientName = to.trim();

      if (cleanTo === 'all' || cleanTo === 'all@intelliattend.com') {
        recipientEmail = 'all@intelliattend.com';
        recipientName = 'All Staff';
      } else {
        const [userByEmail] = await sql`SELECT id, first_name, last_name, email FROM users WHERE LOWER(email) = ${cleanTo} LIMIT 1`;
        if (userByEmail) {
          recipientEmail = userByEmail.email.toLowerCase();
          recipientName = `${userByEmail.first_name} ${userByEmail.last_name}`;
        } else {
          const [userByName] = await sql`SELECT id, first_name, last_name, email FROM users WHERE LOWER(TRIM(first_name || ' ' || last_name)) = ${cleanTo} LIMIT 1`;
          if (userByName) {
            recipientEmail = userByName.email.toLowerCase();
            recipientName = `${userByName.first_name} ${userByName.last_name}`;
          } else {
            return res.status(400).json({
              success: false,
              message: `Recipient '${to}' could not be resolved. Please enter a valid employee email or exact full name.`
            });
          }
        }
      }

      const timeNow = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      const snippet = body.substring(0, 100);
      const hasAttachment = Boolean(attachments && attachments.length > 0);

      // Save copy in sender's Sent folder
      const [sentMail] = await sql`
        INSERT INTO corporate_emails (
          sender_name, sender_email, sender_initial, recipient_email, is_system,
          subject, snippet, body, folder, is_unread, is_starred, label, time, date,
          cc, bcc, attachments, has_attachment
        )
        VALUES (
          ${actualSenderName}, ${actualSenderEmail}, ${actualSenderName.substring(0, 2).toUpperCase()}, ${recipientEmail}, FALSE,
          ${subject}, ${snippet}, ${body}, 'sent', FALSE, FALSE, ${label}, ${timeNow}, 'Today',
          ${cc || null}, ${bcc || null}, ${attachments || null}, ${hasAttachment}
        )
        RETURNING *
      `;

      // Deliver copy to primary recipient's Inbox
      await sql`
        INSERT INTO corporate_emails (
          sender_name, sender_email, sender_initial, recipient_email, is_system,
          subject, snippet, body, folder, is_unread, is_starred, label, time, date,
          cc, bcc, attachments, has_attachment
        )
        VALUES (
          ${actualSenderName}, ${actualSenderEmail}, ${actualSenderName.substring(0, 2).toUpperCase()}, ${recipientEmail}, FALSE,
          ${subject}, ${snippet}, ${body}, 'inbox', TRUE, FALSE, ${label}, ${timeNow}, 'Today',
          ${cc || null}, ${bcc || null}, ${attachments || null}, ${hasAttachment}
        )
      `;

      // Deliver copy to any CC recipients
      if (cc && cc.trim()) {
        const ccList = cc.split(/[,;]/).map(s => s.trim().toLowerCase()).filter(Boolean);
        for (const ccEmail of ccList) {
          if (ccEmail !== recipientEmail) {
            await sql`
              INSERT INTO corporate_emails (
                sender_name, sender_email, sender_initial, recipient_email, is_system,
                subject, snippet, body, folder, is_unread, is_starred, label, time, date,
                cc, attachments, has_attachment
              )
              VALUES (
                ${senderName}, ${senderEmail}, ${senderName.substring(0, 2).toUpperCase()}, ${ccEmail}, FALSE,
                ${subject}, ${snippet}, ${body}, 'inbox', TRUE, FALSE, ${label}, ${timeNow}, 'Today',
                ${cc}, ${attachments || null}, ${hasAttachment}
              )
            `;
          }
        }
      }

      // If sent from a saved draft, clean up the draft
      if (draftId) {
        await sql`DELETE FROM corporate_emails WHERE id = ${draftId} AND folder = 'drafts'`;
      }

      res.status(201).json({ 
        success: true, 
        data: sentMail, 
        message: `Email sent to ${recipientName} (${recipientEmail})` 
      });
    } catch (err) {
      console.error('Error sending email:', err);
      res.status(500).json({ success: false, message: 'Failed to send email' });
    }
  });

  app.post('/api/mail/drafts', async (req, res) => {
    try {
      const { id, to = '', cc = '', subject = '(No Subject)', body = '', senderName = 'Corporate Staff', senderEmail = 'staff@intelliattend.com', label = 'Draft' } = req.body;
      const timeNow = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      const snippet = body ? body.substring(0, 100) : 'Draft message';

      let draft;
      if (id) {
        const [updated] = await sql`
          UPDATE corporate_emails SET
            recipient_email = ${to},
            cc = ${cc || null},
            subject = ${subject},
            snippet = ${snippet},
            body = ${body},
            label = ${label},
            time = ${timeNow}
          WHERE id = ${id} AND folder = 'drafts'
          RETURNING *
        `;
        draft = updated;
      } else {
        const [inserted] = await sql`
          INSERT INTO corporate_emails (
            sender_name, sender_email, sender_initial, recipient_email, is_system,
            subject, snippet, body, folder, is_unread, is_starred, label, time, date, cc
          )
          VALUES (
            ${senderName}, ${senderEmail}, ${senderName.substring(0, 2).toUpperCase()}, ${to}, FALSE,
            ${subject}, ${snippet}, ${body}, 'drafts', FALSE, FALSE, ${label}, ${timeNow}, 'Today', ${cc || null}
          )
          RETURNING *
        `;
        draft = inserted;
      }
      res.status(201).json({ success: true, data: draft, message: 'Draft saved successfully' });
    } catch (err) {
      console.error('Error saving draft:', err);
      res.status(500).json({ success: false, message: 'Failed to save draft' });
    }
  });

  app.post('/api/mail/bulk', async (req, res) => {
    try {
      const { ids, action } = req.body;
      if (!Array.isArray(ids) || ids.length === 0 || !action) {
        return res.status(400).json({ success: false, message: 'ids array and action required' });
      }

      if (action === 'read') {
        await sql`UPDATE corporate_emails SET is_unread = FALSE WHERE id = ANY(${ids})`;
      } else if (action === 'unread') {
        await sql`UPDATE corporate_emails SET is_unread = TRUE WHERE id = ANY(${ids})`;
      } else if (action === 'star') {
        await sql`UPDATE corporate_emails SET is_starred = TRUE WHERE id = ANY(${ids})`;
      } else if (action === 'unstar') {
        await sql`UPDATE corporate_emails SET is_starred = FALSE WHERE id = ANY(${ids})`;
      } else if (action === 'trash') {
        const callerEmail = (req.user?.email || '').toLowerCase().trim();
        if (callerEmail) {
          await sql`
            UPDATE corporate_emails 
            SET previous_folder = folder, folder = 'trash' 
            WHERE id = ANY(${ids}) 
              AND is_system = FALSE 
              AND folder != 'trash'
              AND (LOWER(recipient_email) = ${callerEmail} OR LOWER(sender_email) = ${callerEmail})
          `;
        } else {
          await sql`
            UPDATE corporate_emails 
            SET previous_folder = folder, folder = 'trash' 
            WHERE id = ANY(${ids}) 
              AND is_system = FALSE 
              AND folder != 'trash'
          `;
        }

        const systemMails = await sql`
          SELECT * FROM corporate_emails 
          WHERE id = ANY(${ids}) AND is_system = TRUE AND folder != 'trash'
        `;
        for (const sMail of systemMails) {
          const userTarget = callerEmail || sMail.recipient_email;
          const existing = await sql`
            SELECT id FROM corporate_emails 
            WHERE folder = 'trash' 
              AND LOWER(recipient_email) = ${userTarget.toLowerCase()} 
              AND subject = ${sMail.subject} 
            LIMIT 1
          `;
          if (existing.length === 0) {
            await sql`
              INSERT INTO corporate_emails (
                sender_name, sender_email, sender_initial, recipient_email, is_system,
                subject, snippet, body, folder, previous_folder, is_unread, is_starred, label, time, date
              )
              VALUES (
                ${sMail.sender_name}, ${sMail.sender_email}, ${sMail.sender_initial}, ${userTarget}, TRUE,
                ${sMail.subject}, ${sMail.snippet}, ${sMail.body}, 'trash', ${sMail.folder}, ${sMail.is_unread}, ${sMail.is_starred}, ${sMail.label}, ${sMail.time}, ${sMail.date}
              )
            `;
          }
        }
      } else if (action === 'restore') {
        const callerEmail = (req.user?.email || '').toLowerCase().trim();
        if (callerEmail) {
          await sql`
            DELETE FROM corporate_emails 
            WHERE id = ANY(${ids}) 
              AND folder = 'trash' 
              AND is_system = TRUE 
              AND (LOWER(recipient_email) = ${callerEmail} OR LOWER(sender_email) = ${callerEmail})
          `;
          await sql`
            UPDATE corporate_emails 
            SET folder = COALESCE(previous_folder, 'inbox'), previous_folder = NULL 
            WHERE id = ANY(${ids}) 
              AND folder = 'trash' 
              AND is_system = FALSE
              AND (LOWER(recipient_email) = ${callerEmail} OR LOWER(sender_email) = ${callerEmail})
          `;
        } else {
          await sql`
            DELETE FROM corporate_emails 
            WHERE id = ANY(${ids}) 
              AND folder = 'trash' 
              AND is_system = TRUE
          `;
          await sql`
            UPDATE corporate_emails 
            SET folder = COALESCE(previous_folder, 'inbox'), previous_folder = NULL 
            WHERE id = ANY(${ids}) 
              AND folder = 'trash' 
              AND is_system = FALSE
          `;
        }
      } else if (action === 'delete') {
        await sql`DELETE FROM corporate_emails WHERE id = ANY(${ids}) AND (is_system = FALSE OR folder = 'trash')`;
      }

      res.json({ success: true, message: `Bulk action ${action} completed on ${ids.length} emails` });
    } catch (err) {
      console.error('Error performing bulk mail action:', err);
      res.status(500).json({ success: false, message: 'Bulk action failed' });
    }
  });

  app.post('/api/mail/empty-trash', async (req, res) => {
    try {
      const currentUserEmail = (req.user?.email || req.body?.userEmail || '').toLowerCase().trim();
      if (currentUserEmail) {
        await sql`DELETE FROM corporate_emails WHERE folder = 'trash' AND (LOWER(recipient_email) = ${currentUserEmail} OR LOWER(sender_email) = ${currentUserEmail})`;
      } else {
        await sql`DELETE FROM corporate_emails WHERE folder = 'trash'`;
      }
      res.json({ success: true, message: 'Trash emptied successfully' });
    } catch (err) {
      console.error('Error emptying trash:', err);
      res.status(500).json({ success: false, message: 'Failed to empty trash' });
    }
  });

  app.post(['/api/mail/emails/:id/restore', '/api/mail/restore/:id'], async (req, res) => {
    try {
      const { id } = req.params;
      const callerEmail = (req.user?.email || '').toLowerCase().trim();
      const [mail] = await sql`SELECT * FROM corporate_emails WHERE id = ${id} LIMIT 1`;
      if (!mail) {
        return res.status(404).json({ success: false, message: 'Email not found' });
      }

      if (mail.folder !== 'trash') {
        return res.status(400).json({ success: false, message: 'Email is not in trash folder' });
      }

      if (callerEmail) {
        const isOwner = (mail.recipient_email && mail.recipient_email.toLowerCase() === callerEmail) ||
                        (mail.sender_email && mail.sender_email.toLowerCase() === callerEmail);
        if (!isOwner) {
          return res.status(403).json({ success: false, message: 'Forbidden: You do not own this email' });
        }
      }

      if (mail.is_system) {
        // Delete per-user copy so the original broadcast reappears alone
        await sql`DELETE FROM corporate_emails WHERE id = ${id}`;
        return res.json({ success: true, message: 'Email restored to inbox' });
      }

      const targetFolder = mail.previous_folder || 'inbox';
      const [restored] = await sql`
        UPDATE corporate_emails
        SET folder = ${targetFolder}, previous_folder = NULL
        WHERE id = ${id}
        RETURNING *
      `;
      res.json({ success: true, data: restored, message: `Email restored to ${targetFolder}` });
    } catch (err) {
      console.error('Error restoring email:', err);
      res.status(500).json({ success: false, message: 'Failed to restore email' });
    }
  });

  app.patch('/api/mail/emails/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { isStarred, isUnread, folder } = req.body;

      const [updated] = await sql`
        UPDATE corporate_emails SET
          is_starred = COALESCE(${isStarred !== undefined ? isStarred : null}, is_starred),
          is_unread = COALESCE(${isUnread !== undefined ? isUnread : null}, is_unread),
          folder = COALESCE(${folder || null}, folder)
        WHERE id = ${id}
        RETURNING *
      `;
      res.json({ success: true, data: updated });
    } catch (err) {
      console.error('Error updating email:', err);
      res.status(500).json({ success: false, message: 'Failed to update email' });
    }
  });

  app.delete('/api/mail/emails/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const currentUserEmail = (req.user?.email || '').toLowerCase().trim();
      const [mail] = await sql`SELECT * FROM corporate_emails WHERE id = ${id} LIMIT 1`;
      if (!mail) {
        return res.status(404).json({ success: false, message: 'Email not found' });
      }

      if (mail.is_system && mail.folder !== 'trash') {
        // Avoid inserting another trash copy when this user already has one with the same subject
        const userTarget = currentUserEmail || mail.recipient_email;
        const existing = await sql`
          SELECT id FROM corporate_emails 
          WHERE folder = 'trash' 
            AND LOWER(recipient_email) = ${userTarget.toLowerCase()} 
            AND subject = ${mail.subject} 
          LIMIT 1;
        `;
        if (existing.length === 0) {
          await sql`
            INSERT INTO corporate_emails (
              sender_name, sender_email, sender_initial, recipient_email, is_system,
              subject, snippet, body, folder, previous_folder, is_unread, is_starred, label, time, date
            )
            VALUES (
              ${mail.sender_name}, ${mail.sender_email}, ${mail.sender_initial}, ${userTarget}, TRUE,
              ${mail.subject}, ${mail.snippet}, ${mail.body}, 'trash', ${mail.folder}, ${mail.is_unread}, ${mail.is_starred}, ${mail.label}, ${mail.time}, ${mail.date}
            )
          `;
        }
        return res.json({ success: true, message: 'Email moved to trash' });
      }

      if (mail.folder !== 'trash') {
        await sql`UPDATE corporate_emails SET previous_folder = folder, folder = 'trash' WHERE id = ${id}`;
        res.json({ success: true, message: 'Email moved to trash' });
      } else {
        await sql`DELETE FROM corporate_emails WHERE id = ${id}`;
        res.json({ success: true, message: 'Email permanently deleted' });
      }
    } catch (err) {
      console.error('Error deleting email:', err);
      res.status(500).json({ success: false, message: 'Failed to delete email' });
    }
  });

  // ----------------------------------------------------
  // 15. EMPLOYEE OFFBOARDING & CLEARANCE
  // ----------------------------------------------------
  app.get(['/api/employee/offboarding', '/api/offboarding/status'], async (req, res) => {
    try {
      const userId = req.user?.id || req.query.userId || req.query.employeeId || 'IA-EM-001';
      const rows = await sql`
        SELECT * FROM offboarding_requests 
        WHERE LOWER(user_id) = ${userId.toLowerCase()} 
        ORDER BY id DESC LIMIT 1
      `;
      if (rows.length === 0) {
        return res.json({ success: true, data: null, status: 'not_submitted' });
      }
      res.json({ success: true, data: rows[0], status: rows[0].status });
    } catch (err) {
      console.error('Error fetching employee offboarding:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch offboarding status' });
    }
  });

  app.post(['/api/employee/offboarding/apply', '/api/offboarding/apply', '/api/employee/offboarding/resign'], async (req, res) => {
    try {
      const { employeeId, employeeName, reason, customComments = '', noticePeriodDays = 60, requested_last_working_day } = req.body;
      const actualUserId = req.user?.id || employeeId || 'IA-EM-001';
      const actualUserName = req.user?.name || employeeName || 'Sarah Miller';

      let lwdFormatted;
      if (requested_last_working_day) {
        lwdFormatted = requested_last_working_day;
      } else {
        const lastWorkingDay = new Date();
        lastWorkingDay.setDate(lastWorkingDay.getDate() + parseInt(noticePeriodDays || 60));
        lwdFormatted = lastWorkingDay.toISOString().split('T')[0];
      }

      const [reqRow] = await sql`
        INSERT INTO offboarding_requests (
          company_id, user_id, user_name, department, designation,
          resignation_date, requested_last_working_day, reason, status, kt_status, asset_return_status
        )
        VALUES (
          1, ${actualUserId}, ${actualUserName}, 'Engineering', 'Lead Full Stack Engineer',
          CURRENT_DATE, ${lwdFormatted}, ${reason || customComments || 'Career Growth'}, 'pending', 'pending', 'pending'
        )
        RETURNING *
      `;
      res.status(201).json({ success: true, data: reqRow, message: 'Resignation notice submitted successfully' });
    } catch (err) {
      console.error('Error applying for resignation:', err);
      res.status(500).json({ success: false, message: 'Failed to submit resignation notice' });
    }
  });

  // ----------------------------------------------------
  // 16. EMPLOYEE LETTERS & CERTIFICATES
  // ----------------------------------------------------
  app.get(['/api/employee/letters', '/api/letters/my'], async (req, res) => {
    try {
      const userId = req.user?.id || req.query.userId || req.query.employeeId || 'IA-EM-001';
      const rows = await sql`
        SELECT *
        FROM issued_letters
        WHERE LOWER(user_id) = ${userId.toLowerCase()}
        ORDER BY issue_date DESC, id DESC
      `;
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error('Error fetching employee letters:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch issued letters' });
    }
  });

  app.post(['/api/employee/letters/request', '/api/letters/request'], async (req, res) => {
    try {
      const { 
        employeeId, 
        employeeName, 
        letterType = 'Employment Verification Letter'
      } = req.body;
      const actualUserId = req.user?.id || employeeId || 'IA-EM-001';
      const actualUserName = req.user?.name || employeeName || 'Sarah Miller';

      // Accept only allow-listed letterType values
      const ALLOWED_LETTER_TYPES = {
        'employment-verification': 'Employment Verification Letter',
        'salary-certificate': 'Salary & Compensation Certificate',
        'bonafide-letter': 'Bonafide Corporate Certificate',
        'experience-certificate': 'Provisional Service Certificate',
        'Employment Verification Letter': 'Employment Verification Letter',
        'Salary & Compensation Certificate': 'Salary & Compensation Certificate',
        'Bonafide Corporate Certificate': 'Bonafide Corporate Certificate',
        'Provisional Service Certificate': 'Provisional Service Certificate'
      };

      const canonicalType = ALLOWED_LETTER_TYPES[letterType];
      if (!canonicalType) {
        return res.status(400).json({ success: false, message: 'Invalid letter type requested' });
      }

      // Generate content on the server instead of using request-supplied title or content
      const letterTitle = canonicalType;
      const letterContent = `This is an official request for ${canonicalType} submitted by ${actualUserName} (${actualUserId}). Certification and verification details are maintained under IntelliAttend Corporate Governance.`;

      const [letter] = await sql`
        INSERT INTO issued_letters (
          company_id, user_id, user_name, letter_type, title,
          issue_date, issued_by, status, content
        )
        VALUES (
          1, ${actualUserId}, ${actualUserName}, ${canonicalType}, ${letterTitle},
          CURRENT_DATE, 'Pending Approval', 'Pending', ${letterContent}
        )
        RETURNING *
      `;
      res.status(201).json({ success: true, data: letter, message: 'Letter issuance request recorded successfully' });
    } catch (err) {
      console.error('Error requesting letter:', err);
      res.status(500).json({ success: false, message: 'Failed to record letter request' });
    }
  });

  // ----------------------------------------------------
  // 17. SUPERADMIN & CLIENT BACKOFFICE
  // ----------------------------------------------------
  app.get('/api/superadmin/contact-queries', async (req, res) => {
    try {
      const rows = await sql`SELECT * FROM contact_queries ORDER BY created_at DESC`;
      res.json({ success: true, data: rows });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch contact queries' });
    }
  });

  app.patch('/api/superadmin/contact-queries/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const [updated] = await sql`
        UPDATE contact_queries SET status = ${status} WHERE id = ${id} RETURNING *
      `;
      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to update query status' });
    }
  });

  app.get('/api/superadmin/audit-logs', authorizeRoles('superadmin'), async (req, res) => {
    try {
      const rows = await sql`SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100`;
      res.json({ success: true, data: rows });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch audit logs' });
    }
  });

  app.get('/api/client/settings', async (req, res) => {
    try {
      const [comp] = await sql`
        SELECT attendance_selfie_required, geo_fencing_enabled, subdomain, plan, status 
        FROM companies WHERE id = 1 LIMIT 1
      `;
      res.json({
        success: true,
        data: {
          attendanceSelfieRequired: comp?.attendance_selfie_required || false,
          geoFencingEnabled: comp?.geo_fencing_enabled || false,
          subdomain: comp?.subdomain || 'acme.hrms.portal',
          plan: comp?.plan || 'Enterprise Tier',
          status: comp?.status || 'active',
          geofenceRadiusMeters: 250,
          officeLatitude: 17.448294,
          officeLongitude: 78.374187
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch client settings' });
    }
  });

  app.put('/api/client/settings', async (req, res) => {
    try {
      const { attendanceSelfieRequired, geoFencingEnabled } = req.body;
      await sql`
        UPDATE companies SET
          attendance_selfie_required = COALESCE(${attendanceSelfieRequired !== undefined ? attendanceSelfieRequired : null}, attendance_selfie_required),
          geo_fencing_enabled = COALESCE(${geoFencingEnabled !== undefined ? geoFencingEnabled : null}, geo_fencing_enabled)
        WHERE id = 1
      `;
      res.json({ success: true, message: 'Tenant security parameters saved in Neon PostgreSQL' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to save settings' });
    }
  });

  console.log('✓ All Enhanced API routes successfully bound.');
}

