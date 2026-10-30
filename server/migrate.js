import sql from './db.js';
import bcrypt from 'bcryptjs';

async function migrate() {
  console.log('--- Connecting to Neon PostgreSQL & Running Migrations ---');

  try {
    // 1. Verify connection
    const health = await sql`SELECT current_database() AS db, current_user AS user, version() AS version`;
    console.log(`Connected to Neon Database: "${health[0].db}" as user "${health[0].user}"`);

    // 2. Companies table
    await sql`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        subdomain VARCHAR(100) UNIQUE NOT NULL,
        plan VARCHAR(50) NOT NULL DEFAULT 'Professional Tier',
        status VARCHAR(20) DEFAULT 'active',
        admin_email VARCHAR(255) NOT NULL,
        employees INT DEFAULT 0,
        managers INT DEFAULT 0,
        joined_date VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✓ Table "companies" verified');

    // 3. Users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        company_id INT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        designation VARCHAR(150),
        department VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Ensure all profile columns exist on users table
    await sql`
      DO $$
      BEGIN
        ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(30);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_phone VARCHAR(30);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(100);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS blood_group VARCHAR(10);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS doj VARCHAR(50);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS dob VARCHAR(50);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS work_location VARCHAR(150);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS employment_type VARCHAR(100);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS shift VARCHAR(100);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS pan_number VARCHAR(50);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_account VARCHAR(100);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS pf_number VARCHAR(100);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS company_name VARCHAR(150);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS manager_name VARCHAR(150);
      END
      $$;
    `;
    console.log('✓ Table "users" schema enhanced with complete profile columns');

    // 4. Attendance records table
    await sql`
      CREATE TABLE IF NOT EXISTS attendance_records (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        user_name VARCHAR(100) NOT NULL,
        department VARCHAR(100) NOT NULL,
        punch_date DATE NOT NULL,
        check_in VARCHAR(20),
        check_out VARCHAR(20),
        total_hours VARCHAR(20),
        work_seconds INT DEFAULT 0,
        status VARCHAR(20) NOT NULL DEFAULT 'present',
        mode VARCHAR(50) DEFAULT 'Office',
        verified_by VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      DO $$
      BEGIN
        ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS work_seconds INT DEFAULT 0;
        ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS verified_by VARCHAR(100);
        ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
      END
      $$;
    `;

    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_user_date ON attendance_records (user_id, punch_date);
    `;
    console.log('✓ Table "attendance_records" verified and indexed');

    // 4b. Leave requests table
    await sql`
      CREATE TABLE IF NOT EXISTS leave_requests (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        user_name VARCHAR(100) NOT NULL,
        user_role VARCHAR(100),
        department VARCHAR(100),
        avatar_url TEXT,
        leave_type VARCHAR(50) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        days INT NOT NULL DEFAULT 1,
        reason TEXT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        approved_by VARCHAR(100) DEFAULT 'Awaiting Manager Review',
        applied_on DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✓ Table "leave_requests" verified');

    // 4c. Leave balances table
    await sql`
      CREATE TABLE IF NOT EXISTS leave_balances (
        user_id VARCHAR(50) PRIMARY KEY,
        annual_total INT DEFAULT 20,
        annual_used INT DEFAULT 0,
        sick_total INT DEFAULT 10,
        sick_used INT DEFAULT 0,
        casual_total INT DEFAULT 6,
        casual_used INT DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✓ Table "leave_balances" verified');

    // 4d. Expenses & Reimbursements table
    await sql`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        user_name VARCHAR(100) NOT NULL,
        user_role VARCHAR(100),
        department VARCHAR(100),
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        amount_inr NUMERIC(12, 2) NOT NULL,
        expense_date DATE NOT NULL,
        description TEXT,
        receipt_url TEXT,
        receipt_public_id VARCHAR(255),
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        approved_by VARCHAR(100),
        payment_ref VARCHAR(100),
        applied_on DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✓ Table "expenses" verified');

    // 4e. Salary structures table
    await sql`
      CREATE TABLE IF NOT EXISTS salary_structures (
        user_id VARCHAR(50) PRIMARY KEY,
        user_name VARCHAR(100) NOT NULL,
        designation VARCHAR(150),
        department VARCHAR(100),
        annual_ctc_inr NUMERIC(12, 2) NOT NULL,
        monthly_gross_inr NUMERIC(12, 2) NOT NULL,
        basic_salary NUMERIC(12, 2) NOT NULL,
        hra NUMERIC(12, 2) NOT NULL,
        special_allowance NUMERIC(12, 2) NOT NULL,
        performance_bonus NUMERIC(12, 2) NOT NULL,
        pf_deduction NUMERIC(12, 2) NOT NULL,
        tds_deduction NUMERIC(12, 2) NOT NULL,
        insurance_deduction NUMERIC(12, 2) NOT NULL,
        professional_tax NUMERIC(12, 2) NOT NULL DEFAULT 200.00,
        monthly_net_inr NUMERIC(12, 2) NOT NULL,
        salary_band VARCHAR(50) DEFAULT 'Engineering Band L4',
        bank_name VARCHAR(100),
        bank_account VARCHAR(100),
        pan_number VARCHAR(50),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✓ Table "salary_structures" verified');

    // 4f. Payslips table
    await sql`
      CREATE TABLE IF NOT EXISTS payslips (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        user_name VARCHAR(100) NOT NULL,
        month VARCHAR(50) NOT NULL,
        pay_date DATE NOT NULL,
        gross_inr NUMERIC(12, 2) NOT NULL,
        deductions_inr NUMERIC(12, 2) NOT NULL,
        net_inr NUMERIC(12, 2) NOT NULL,
        working_days INT NOT NULL DEFAULT 22,
        paid_days INT NOT NULL DEFAULT 22,
        status VARCHAR(20) NOT NULL DEFAULT 'paid',
        transaction_ref VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✓ Table "payslips" verified');

    // 5. Transactions table
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(50) PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,
        subdomain VARCHAR(100) NOT NULL,
        plan VARCHAR(50) NOT NULL,
        billing_cycle VARCHAR(50) NOT NULL,
        amount_inr NUMERIC(12, 2) NOT NULL,
        subtotal NUMERIC(12, 2) NOT NULL,
        gst_18 NUMERIC(12, 2) NOT NULL,
        gateway VARCHAR(50) NOT NULL,
        gateway_ref VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        gstin VARCHAR(50) NOT NULL,
        payment_method VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✓ Table "transactions" verified');

    // 6. Notifications table
    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_email VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        read_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✓ Table "notifications" verified');

    // 7. Documents table (Cloudinary storage metadata)
    await sql`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) DEFAULT 'General',
        file_url TEXT NOT NULL,
        public_id VARCHAR(255),
        file_size VARCHAR(50),
        file_type VARCHAR(50),
        uploaded_by VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✓ Table "documents" verified');

    // 8. Policies table
    await sql`
      CREATE TABLE IF NOT EXISTS policies (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL DEFAULT 'Conduct',
        version VARCHAR(20) DEFAULT 'v1.0',
        status VARCHAR(20) DEFAULT 'active',
        description TEXT,
        content TEXT NOT NULL,
        last_updated VARCHAR(50) DEFAULT CURRENT_DATE::text,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✓ Table "policies" verified');

    // 9. Support tickets table
    await sql`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id SERIAL PRIMARY KEY,
        ticket_ref VARCHAR(50) UNIQUE NOT NULL,
        user_id VARCHAR(50) NOT NULL,
        user_name VARCHAR(100) NOT NULL,
        user_email VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL DEFAULT 'General HR',
        priority VARCHAR(50) NOT NULL DEFAULT 'Normal',
        subject VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'open',
        resolution_notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✓ Table "support_tickets" verified');

    // 10. Tasks table
    await sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle TEXT,
        scope VARCHAR(50) DEFAULT 'assignedToMe',
        assigned_by VARCHAR(100) NOT NULL,
        assigned_date DATE DEFAULT CURRENT_DATE,
        priority VARCHAR(50) DEFAULT 'Medium',
        due_date DATE NOT NULL,
        due_date_formatted VARCHAR(50),
        status VARCHAR(50) DEFAULT 'Pending',
        progress INT DEFAULT 0,
        assignees JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✓ Table "tasks" verified');

    // 11. Task comments table
    await sql`
      CREATE TABLE IF NOT EXISTS task_comments (
        id SERIAL PRIMARY KEY,
        task_id INT NOT NULL,
        author VARCHAR(100) NOT NULL,
        author_email VARCHAR(255),
        time VARCHAR(50),
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✓ Table "task_comments" verified');

    // 12. Attendance Regularizations table
    await sql`
      CREATE TABLE IF NOT EXISTS regularizations (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        user_name VARCHAR(100) NOT NULL,
        attendance_date DATE NOT NULL,
        day VARCHAR(20),
        original_clock_in VARCHAR(20),
        original_clock_out VARCHAR(20),
        requested_clock_in VARCHAR(20),
        requested_clock_out VARCHAR(20),
        reason_type VARCHAR(150) NOT NULL,
        reason_details TEXT,
        status VARCHAR(20) DEFAULT 'Pending',
        manager_comment TEXT,
        applied_date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✓ Table "regularizations" verified');

    // 13. Announcements table
    await sql`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        date VARCHAR(50) NOT NULL,
        read_time VARCHAR(50) DEFAULT '3 min read',
        author VARCHAR(100) NOT NULL,
        pinned BOOLEAN DEFAULT false,
        summary TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✓ Table "announcements" verified');

    // 14. Holidays table
    await sql`
      CREATE TABLE IF NOT EXISTS holidays (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        day VARCHAR(50) NOT NULL,
        month INT NOT NULL,
        year INT NOT NULL DEFAULT 2026,
        type VARCHAR(100) NOT NULL DEFAULT 'Gazetted Holiday',
        description TEXT,
        is_paid BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✓ Table "holidays" verified');

    // Seed production credentials if not exists
    const passwordHash = await bcrypt.hash('password123', 10);

    const initialUsers = [
      {
        id: 'IA-SA-001',
        email: 'rahulbariki.intelliattend@gmail.com',
        role: 'superadmin',
        first_name: 'Rahul',
        last_name: 'Bariki',
        designation: 'GLOBAL PLATFORM SUPER ADMINISTRATOR & FOUNDER',
        department: 'Platform Administration & Security',
        phone: '6281769923',
        emergency_phone: '8374273126',
        emergency_contact_name: 'B. Venkata Rao (Father)',
        blood_group: 'O+',
        doj: '01-01-2022',
        dob: '15-08-1998',
        gender: 'Male',
        address: 'Flat 304, Silicon Heights, Madhapur, Hyderabad, TS 500081',
        work_location: 'Corporate HQ, Hyderabad',
        employment_type: 'Executive Root Authority',
        shift: 'Continuous System Oversight (24x7)',
        pan_number: 'ABCDE1234F',
        bank_account: '•••• •••• 4892 (HDFC Bank)',
        pf_number: 'PF/HYD/10928374',
        avatar_url: '/avatar_rahul.png',
        company_name: 'IntelliAttend Technologies',
        manager_name: 'Board of Directors',
      },
      {
        id: 'IA-CA-001',
        email: 'clientadmin.intelliattend@gmail.com',
        role: 'client',
        first_name: 'Alex',
        last_name: 'Rivera',
        designation: 'CLIENT ENTERPRISE ADMINISTRATOR & OPERATIONS DIRECTOR',
        department: 'Human Resources & Corporate Governance',
        phone: '9876543212',
        emergency_phone: '9876543288',
        emergency_contact_name: 'Corporate HR Desk',
        blood_group: 'A-',
        doj: '15-02-2024',
        dob: '22-11-1992',
        gender: 'Male',
        address: 'Plot 42, Jubilee Hills, Hyderabad, TS 500033',
        work_location: 'Corporate HQ, Hyderabad',
        employment_type: 'Corporate Executive Admin',
        shift: 'General Executive Hours',
        pan_number: 'ERTY56789X',
        bank_account: '•••• •••• 6610 (HDFC Bank)',
        pf_number: 'PF/HYD/10920008',
        avatar_url: '',
        company_name: 'IntelliAttend Technologies',
        manager_name: 'Rahul Bariki (Super Admin)',
      },
      {
        id: 'IA-MG-001',
        email: 'manager.intelliattend@gmail.com',
        role: 'manager',
        first_name: 'David',
        last_name: 'Chen',
        designation: 'LEAD ENGINEERING & DELIVERY DIRECTOR',
        department: 'Engineering & Technology',
        phone: '9876543211',
        emergency_phone: '9876543299',
        emergency_contact_name: 'Operations Lead',
        blood_group: 'B+',
        doj: '12-04-2024',
        dob: '10-03-1994',
        gender: 'Male',
        address: 'Hill View Enclave, Banjara Hills, Hyderabad, TS 500034',
        work_location: 'Hyderabad Campus (On-site)',
        employment_type: 'Full-time Permanent',
        shift: 'General Day (09:00 AM - 06:30 PM)',
        pan_number: 'BNMKL9876P',
        bank_account: '•••• •••• 1029 (ICICI Bank)',
        pf_number: 'PF/HYD/10927711',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80',
        company_name: 'IntelliAttend Technologies',
        manager_name: 'Alex Rivera (Client Admin)',
      },
      {
        id: 'IA-EM-001',
        email: 'employee.intelliattend@gmail.com',
        role: 'employee',
        first_name: 'Sarah',
        last_name: 'Miller',
        designation: 'LEAD PRODUCT SOFTWARE DEVELOPMENT ENGINEER',
        department: 'Engineering & Technology',
        phone: '9876543220',
        emergency_phone: '9876543299',
        emergency_contact_name: 'Operations Lead',
        blood_group: 'O+',
        doj: '01-01-2026',
        dob: '18-07-1999',
        gender: 'Female',
        address: 'Flat 304, Silicon Heights, Madhapur, Hyderabad, TS 500081',
        work_location: 'Hyderabad Campus (Hybrid)',
        employment_type: 'Full-time Permanent',
        shift: 'General Day (09:00 AM - 06:30 PM)',
        pan_number: 'ABCDE1234F',
        bank_account: '•••• •••• 4892 (HDFC Bank)',
        pf_number: 'PF/HYD/10928374',
        avatar_url: '',
        company_name: 'IntelliAttend Technologies',
        manager_name: 'David Chen (Engineering Manager)',
      }
    ];

    for (const u of initialUsers) {
      await sql`
        INSERT INTO users (
          id, email, password_hash, role, first_name, last_name, designation, department,
          phone, emergency_phone, emergency_contact_name, blood_group, doj, dob, gender,
          address, work_location, employment_type, shift, pan_number, bank_account,
          pf_number, avatar_url, company_name, manager_name
        )
        VALUES (
          ${u.id}, ${u.email}, ${passwordHash}, ${u.role}, ${u.first_name}, ${u.last_name}, ${u.designation}, ${u.department},
          ${u.phone}, ${u.emergency_phone}, ${u.emergency_contact_name}, ${u.blood_group}, ${u.doj}, ${u.dob}, ${u.gender},
          ${u.address}, ${u.work_location}, ${u.employment_type}, ${u.shift}, ${u.pan_number}, ${u.bank_account},
          ${u.pf_number}, ${u.avatar_url}, ${u.company_name}, ${u.manager_name}
        )
        ON CONFLICT (email) DO UPDATE SET
          password_hash = ${passwordHash},
          first_name = ${u.first_name},
          last_name = ${u.last_name},
          role = ${u.role},
          designation = ${u.designation},
          department = ${u.department},
          phone = ${u.phone},
          emergency_phone = ${u.emergency_phone},
          emergency_contact_name = ${u.emergency_contact_name},
          blood_group = ${u.blood_group},
          doj = ${u.doj},
          dob = ${u.dob},
          gender = ${u.gender},
          address = ${u.address},
          work_location = ${u.work_location},
          employment_type = ${u.employment_type},
          shift = ${u.shift},
          pan_number = ${u.pan_number},
          bank_account = ${u.bank_account},
          pf_number = ${u.pf_number},
          avatar_url = ${u.avatar_url},
          company_name = ${u.company_name},
          manager_name = ${u.manager_name};
      `;
    }
    console.log('✓ Production accounts seeded (SuperAdmin, Client Admin, Manager, Employee)');

    // Ensure no other accounts exist in the production database
    await sql`
      DELETE FROM users 
      WHERE email NOT IN (
        'rahulbariki.intelliattend@gmail.com',
        'clientadmin.intelliattend@gmail.com',
        'manager.intelliattend@gmail.com',
        'employee.intelliattend@gmail.com'
      );
    `;
    console.log('✓ Cleaned up any non-production accounts from database');

    // 8. Subscription plans table
    await sql`
      CREATE TABLE IF NOT EXISTS subscription_plans (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price_monthly NUMERIC(10, 2) NOT NULL,
        price_annual NUMERIC(10, 2) NOT NULL,
        max_employees INT NOT NULL,
        active_subscribers INT DEFAULT 0,
        status VARCHAR(20) DEFAULT 'active',
        popular BOOLEAN DEFAULT false,
        features JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✓ Table "subscription_plans" verified');

    // Seed production subscription plans
    await sql`
      INSERT INTO subscription_plans (name, price_monthly, price_annual, max_employees, active_subscribers, status, popular, features)
      VALUES
        ('Starter Tier', 99.00, 950.00, 50, 14, 'active', false, '["Clock-In / Clock-Out Tracking", "Leave Management & Approvals", "Basic Salary Slip Downloads", "Email Support (48h response)"]'::jsonb),
        ('Professional Tier', 249.00, 2390.00, 200, 28, 'active', true, '["All Starter Features", "Multi-Department Manager Hierarchy", "Team Task Delegation & Review", "Detailed Audit Logs & Export", "Priority Support (12h response)"]'::jsonb),
        ('Enterprise Tier', 499.00, 4800.00, 1000, 12, 'active', false, '["All Professional Features", "Unlimited Departments & Managers", "Custom Role Permissions & Security Policies", "Dedicated Customer Success Manager", "Custom Subdomain & Single Sign-On (SSO)", "99.9% Uptime SLA"]'::jsonb)
      ON CONFLICT DO NOTHING;
    `;

    // Purge any dummy tenant companies and seed clean production organizations
    await sql`
      DELETE FROM companies 
      WHERE admin_email NOT IN ('clientadmin.intelliattend@gmail.com', 'rahulbariki.intelliattend@gmail.com');
    `;

    await sql`
      INSERT INTO companies (name, subdomain, plan, status, admin_email, employees, managers, joined_date)
      VALUES 
        ('Acme Enterprise', 'acme.hrms.portal', 'Enterprise Tier', 'active', 'clientadmin.intelliattend@gmail.com', 480, 32, 'Jan 15, 2025'),
        ('Apex Global Innovations', 'apex.hrms.portal', 'Professional Tier', 'active', 'clientadmin.intelliattend@gmail.com', 180, 12, 'Mar 02, 2025'),
        ('NextGen Tech Cloud', 'nextgen.hrms.portal', 'Enterprise Tier', 'active', 'rahulbariki.intelliattend@gmail.com', 350, 25, 'Jul 10, 2025')
      ON CONFLICT (subdomain) DO UPDATE SET
        admin_email = EXCLUDED.admin_email,
        status = EXCLUDED.status,
        plan = EXCLUDED.plan,
        employees = EXCLUDED.employees,
        managers = EXCLUDED.managers;
    `;
    console.log('✓ Corporate tenant companies sanitized and verified');

    // Purge any dummy transactions and seed production INR transactions
    await sql`
      DELETE FROM transactions 
      WHERE customer_email NOT IN ('clientadmin.intelliattend@gmail.com', 'rahulbariki.intelliattend@gmail.com');
    `;

    await sql`
      INSERT INTO transactions (id, company_name, subdomain, plan, billing_cycle, amount_inr, subtotal, gst_18, gateway, gateway_ref, status, customer_email, customer_name, gstin, payment_method)
      VALUES
        ('TXN-2026-98412', 'Acme Enterprise', 'acme.hrms.portal', 'Enterprise Tier', 'Annual', 4800.00, 4067.80, 732.20, 'Razorpay UPI', 'pay_Rz7x92La1098', 'completed', 'clientadmin.intelliattend@gmail.com', 'Acme Corporate Accounts', '36AABCU9603R1ZM', 'UPI • corporate@okhdfcbank'),
        ('TXN-2026-98409', 'Apex Global Innovations', 'apex.hrms.portal', 'Professional Tier', 'Annual', 2390.00, 2025.42, 364.58, 'Stripe Business', 'ch_3N9xKl2eZvKYlo2C1', 'completed', 'clientadmin.intelliattend@gmail.com', 'Apex Corporate Accounts', '29AABCG8921P1ZN', 'Corporate Visa •••• 4242'),
        ('TXN-2026-98401', 'NextGen Tech Cloud', 'nextgen.hrms.portal', 'Enterprise Tier', 'Annual', 4800.00, 4067.80, 732.20, 'HDFC Corporate Wire', 'NEFT-HDFC002847192', 'pending', 'rahulbariki.intelliattend@gmail.com', 'NextGen Treasury', '36AACCY1122R1ZQ', 'Bank Wire / RTGS'),
        ('TXN-2025-88412', 'Acme Enterprise', 'acme.hrms.portal', 'Enterprise Tier', 'Annual', 4800.00, 4067.80, 732.20, 'Razorpay UPI', 'pay_Rz6x11Ka9821', 'completed', 'clientadmin.intelliattend@gmail.com', 'Acme Corporate Accounts', '36AABCU9603R1ZM', 'UPI • corporate@okhdfcbank'),
        ('TXN-2024-78412', 'Acme Enterprise', 'acme.hrms.portal', 'Enterprise Tier', 'Annual', 4500.00, 3813.56, 686.44, 'Razorpay UPI', 'pay_Rz5x00Ja8712', 'completed', 'clientadmin.intelliattend@gmail.com', 'Acme Corporate Accounts', '36AABCU9603R1ZM', 'Corporate Visa •••• 4242')
      ON CONFLICT (id) DO UPDATE SET
        customer_email = EXCLUDED.customer_email,
        company_name = EXCLUDED.company_name,
        amount_inr = EXCLUDED.amount_inr,
        status = EXCLUDED.status;
    `;
    console.log('✓ Financial transactions sanitized and verified in INR (₹)');

    // Clean up any unauthorized or dummy attendance/leave records
    await sql`
      DELETE FROM attendance_records
      WHERE user_id NOT IN ('IA-SA-001', 'IA-CA-001', 'IA-MG-001', 'IA-EM-001');
    `;
    await sql`
      DELETE FROM leave_requests
      WHERE user_id NOT IN ('IA-SA-001', 'IA-CA-001', 'IA-MG-001', 'IA-EM-001');
    `;

    // Seed leave balances
    const initialBalances = [
      { user_id: 'IA-SA-001', annual_total: 24, annual_used: 0, sick_total: 12, sick_used: 0, casual_total: 6, casual_used: 0 },
      { user_id: 'IA-CA-001', annual_total: 22, annual_used: 3, sick_total: 10, sick_used: 1, casual_total: 6, casual_used: 1 },
      { user_id: 'IA-MG-001', annual_total: 20, annual_used: 4, sick_total: 10, sick_used: 2, casual_total: 6, casual_used: 2 },
      { user_id: 'IA-EM-001', annual_total: 20, annual_used: 5, sick_total: 10, sick_used: 2, casual_total: 6, casual_used: 2 },
    ];
    for (const b of initialBalances) {
      await sql`
        INSERT INTO leave_balances (user_id, annual_total, annual_used, sick_total, sick_used, casual_total, casual_used)
        VALUES (${b.user_id}, ${b.annual_total}, ${b.annual_used}, ${b.sick_total}, ${b.sick_used}, ${b.casual_total}, ${b.casual_used})
        ON CONFLICT (user_id) DO UPDATE SET
          annual_total = ${b.annual_total},
          annual_used = ${b.annual_used},
          sick_total = ${b.sick_total},
          sick_used = ${b.sick_used},
          casual_total = ${b.casual_total},
          casual_used = ${b.casual_used};
      `;
    }
    console.log('✓ Leave balances initialized for production personnel');

    // Seed initial production leave requests for employee Sarah Miller
    await sql`
      INSERT INTO leave_requests (id, user_id, user_name, user_role, department, avatar_url, leave_type, start_date, end_date, days, reason, status, approved_by, applied_on)
      VALUES 
        (101, 'IA-EM-001', 'Sarah Miller', 'Lead Product Software Engineer', 'Engineering & Technology', '', 'Annual Leave', '2026-11-12', '2026-11-15', 4, 'Family vacation & travel', 'approved', 'David Chen (Engineering Director)', '2026-10-20'),
        (102, 'IA-EM-001', 'Sarah Miller', 'Lead Product Software Engineer', 'Engineering & Technology', '', 'Sick Leave', '2026-10-24', '2026-10-24', 1, 'Viral fever and doctor consultation', 'approved', 'David Chen (Engineering Director)', '2026-10-23'),
        (103, 'IA-EM-001', 'Sarah Miller', 'Lead Product Software Engineer', 'Engineering & Technology', '', 'Casual Leave', '2026-11-28', '2026-11-29', 2, 'Personal legal documentation', 'pending', 'Awaiting Manager Review', '2026-10-25')
      ON CONFLICT (id) DO NOTHING;
    `;
    console.log('✓ Production leave requests seeded');

    // Seed realistic attendance records for recent workdays
    const attendanceData = [
      { user_id: 'IA-EM-001', user_name: 'Sarah Miller', department: 'Engineering & Technology', punch_date: '2026-10-27', check_in: '09:02 AM', check_out: '', total_hours: 'Calculating...', work_seconds: 18420, status: 'present', mode: 'Office' },
      { user_id: 'IA-EM-001', user_name: 'Sarah Miller', department: 'Engineering & Technology', punch_date: '2026-10-26', check_in: '09:05 AM', check_out: '06:12 PM', total_hours: '8h 07m', work_seconds: 29220, status: 'present', mode: 'Office' },
      { user_id: 'IA-EM-001', user_name: 'Sarah Miller', department: 'Engineering & Technology', punch_date: '2026-10-25', check_in: '09:28 AM', check_out: '06:30 PM', total_hours: '8h 02m', work_seconds: 28920, status: 'late', mode: 'Office' },
      { user_id: 'IA-EM-001', user_name: 'Sarah Miller', department: 'Engineering & Technology', punch_date: '2026-10-24', check_in: '08:55 AM', check_out: '05:58 PM', total_hours: '8h 03m', work_seconds: 28980, status: 'wfh', mode: 'Remote / WFH' },
      { user_id: 'IA-EM-001', user_name: 'Sarah Miller', department: 'Engineering & Technology', punch_date: '2026-10-23', check_in: '09:01 AM', check_out: '06:05 PM', total_hours: '8h 04m', work_seconds: 29040, status: 'present', mode: 'Office' },

      { user_id: 'IA-MG-001', user_name: 'David Chen', department: 'Engineering & Technology', punch_date: '2026-10-27', check_in: '08:50 AM', check_out: '', total_hours: 'Calculating...', work_seconds: 19140, status: 'present', mode: 'Office' },
      { user_id: 'IA-MG-001', user_name: 'David Chen', department: 'Engineering & Technology', punch_date: '2026-10-26', check_in: '08:55 AM', check_out: '06:20 PM', total_hours: '8h 25m', work_seconds: 30300, status: 'present', mode: 'Office' },

      { user_id: 'IA-CA-001', user_name: 'Client Administrator', department: 'Human Resources & Corporate Governance', punch_date: '2026-10-27', check_in: '09:15 AM', check_out: '', total_hours: 'Calculating...', work_seconds: 17640, status: 'present', mode: 'Office' },

      { user_id: 'IA-SA-001', user_name: 'Bariki Rahul', department: 'Platform Administration & Security', punch_date: '2026-10-27', check_in: '08:30 AM', check_out: '', total_hours: 'Calculating...', work_seconds: 20340, status: 'present', mode: 'Corporate HQ' },
    ];

    for (const a of attendanceData) {
      await sql`
        INSERT INTO attendance_records (user_id, user_name, department, punch_date, check_in, check_out, total_hours, work_seconds, status, mode)
        VALUES (${a.user_id}, ${a.user_name}, ${a.department}, ${a.punch_date}, ${a.check_in}, ${a.check_out}, ${a.total_hours}, ${a.work_seconds}, ${a.status}, ${a.mode})
        ON CONFLICT (user_id, punch_date) DO UPDATE SET
          check_in = ${a.check_in},
          check_out = ${a.check_out},
          total_hours = ${a.total_hours},
          work_seconds = ${a.work_seconds},
          status = ${a.status},
          mode = ${a.mode};
      `;
    }
    console.log('✓ Attendance records synchronized for production personnel');

    // Clean up any unauthorized or dummy expense records
    await sql`
      DELETE FROM expenses
      WHERE user_id NOT IN ('IA-SA-001', 'IA-CA-001', 'IA-MG-001', 'IA-EM-001');
    `;

    // Seed production expenses in INR (₹)
    await sql`
      INSERT INTO expenses (
        id, user_id, user_name, user_role, department, title, category,
        amount_inr, expense_date, description, receipt_url, status, approved_by, payment_ref, applied_on
      )
      VALUES 
        (
          501, 'IA-EM-001', 'Sarah Miller', 'Lead Product Software Engineer', 'Engineering & Technology',
          'Client Architecture Lunch & Product Review', 'Meal & Hospitality',
          2450.00, '2026-10-22', 'Client executive discussion with technical leads over lunch in Hitec City',
          'https://res.cloudinary.com/demo/image/upload/sample.jpg', 'approved', 'David Chen (Engineering Director)', 'NEFT-HDFC-9921', '2026-10-23'
        ),
        (
          502, 'IA-EM-001', 'Sarah Miller', 'Lead Product Software Engineer', 'Engineering & Technology',
          'AWS Solutions Architect Professional Exam', 'Tech Equipment',
          12500.00, '2026-10-18', 'Annual technical certification reimbursement according to engineering policy',
          'https://res.cloudinary.com/demo/image/upload/sample.jpg', 'reimbursed', 'David Chen (Engineering Director)', 'UPI-RZR-8109', '2026-10-19'
        ),
        (
          503, 'IA-EM-001', 'Sarah Miller', 'Lead Product Software Engineer', 'Engineering & Technology',
          'High-Speed Fiber Internet Allowance (Q3)', 'Internet & Phone',
          3540.00, '2026-10-25', 'Quarterly home fiber broadband bill for hybrid engineering work',
          'https://res.cloudinary.com/demo/image/upload/sample.jpg', 'pending', 'Awaiting Manager Review', NULL, '2026-10-26'
        ),
        (
          504, 'IA-EM-001', 'Sarah Miller', 'Lead Product Software Engineer', 'Engineering & Technology',
          'Ergonomic Mechanical Keyboard & Mouse Set', 'Office Supplies',
          4299.00, '2026-10-12', 'Ergonomic workspace accessory set for developer productivity',
          'https://res.cloudinary.com/demo/image/upload/sample.jpg', 'approved', 'David Chen (Engineering Director)', 'NEFT-HDFC-8910', '2026-10-13'
        )
      ON CONFLICT (id) DO NOTHING;
    `;
    console.log('✓ Production expense claims seeded in INR (₹)');

    // Clean up any unauthorized or dummy salary/payslips records
    await sql`
      DELETE FROM salary_structures
      WHERE user_id NOT IN ('IA-SA-001', 'IA-CA-001', 'IA-MG-001', 'IA-EM-001');
    `;
    await sql`
      DELETE FROM payslips
      WHERE user_id NOT IN ('IA-SA-001', 'IA-CA-001', 'IA-MG-001', 'IA-EM-001');
    `;

    // Seed salary structures for all 4 production accounts
    const salaries = [
      {
        user_id: 'IA-SA-001',
        user_name: 'Bariki Rahul',
        designation: 'GLOBAL PLATFORM SUPER ADMINISTRATOR & FOUNDER',
        department: 'Platform Administration & Security',
        annual_ctc_inr: 3600000.00,
        monthly_gross_inr: 300000.00,
        basic_salary: 150000.00,
        hra: 60000.00,
        special_allowance: 65000.00,
        performance_bonus: 25000.00,
        pf_deduction: 18000.00,
        tds_deduction: 34800.00,
        insurance_deduction: 2000.00,
        professional_tax: 200.00,
        monthly_net_inr: 245000.00,
        salary_band: 'Executive Founder Band E1',
        bank_name: 'HDFC Bank',
        bank_account: '•••• •••• 4892 (HDFC Bank)',
        pan_number: 'ABCDE1234F'
      },
      {
        user_id: 'IA-CA-001',
        user_name: 'Alex Rivera',
        designation: 'CLIENT ENTERPRISE ADMINISTRATOR & OPERATIONS DIRECTOR',
        department: 'Human Resources & Corporate Governance',
        annual_ctc_inr: 2400000.00,
        monthly_gross_inr: 200000.00,
        basic_salary: 100000.00,
        hra: 40000.00,
        special_allowance: 45000.00,
        performance_bonus: 15000.00,
        pf_deduction: 12000.00,
        tds_deduction: 18000.00,
        insurance_deduction: 1800.00,
        professional_tax: 200.00,
        monthly_net_inr: 168000.00,
        salary_band: 'Corporate Director Band D1',
        bank_name: 'HDFC Bank',
        bank_account: '•••• •••• 6610 (HDFC Bank)',
        pan_number: 'ERTY56789X'
      },
      {
        user_id: 'IA-MG-001',
        user_name: 'David Chen',
        designation: 'LEAD ENGINEERING & DELIVERY DIRECTOR',
        department: 'Engineering & Technology',
        annual_ctc_inr: 2800000.00,
        monthly_gross_inr: 233333.00,
        basic_salary: 116666.00,
        hra: 46666.00,
        special_allowance: 50001.00,
        performance_bonus: 20000.00,
        pf_deduction: 14000.00,
        tds_deduction: 22533.00,
        insurance_deduction: 1600.00,
        professional_tax: 200.00,
        monthly_net_inr: 195000.00,
        salary_band: 'Engineering Leadership Band M2',
        bank_name: 'ICICI Bank',
        bank_account: '•••• •••• 1029 (ICICI Bank)',
        pan_number: 'BNMKL9876P'
      },
      {
        user_id: 'IA-EM-001',
        user_name: 'Sarah Miller',
        designation: 'LEAD PRODUCT SOFTWARE DEVELOPMENT ENGINEER',
        department: 'Engineering & Technology',
        annual_ctc_inr: 1800000.00,
        monthly_gross_inr: 150000.00,
        basic_salary: 75000.00,
        hra: 30000.00,
        special_allowance: 33000.00,
        performance_bonus: 12000.00,
        pf_deduction: 9000.00,
        tds_deduction: 11000.00,
        insurance_deduction: 1400.00,
        professional_tax: 200.00,
        monthly_net_inr: 128400.00,
        salary_band: 'Engineering Band L4',
        bank_name: 'HDFC Bank',
        bank_account: '•••• •••• 4892 (HDFC Bank)',
        pan_number: 'ABCDE1234F'
      }
    ];

    for (const s of salaries) {
      await sql`
        INSERT INTO salary_structures (
          user_id, user_name, designation, department, annual_ctc_inr, monthly_gross_inr,
          basic_salary, hra, special_allowance, performance_bonus, pf_deduction, tds_deduction,
          insurance_deduction, professional_tax, monthly_net_inr, salary_band, bank_name, bank_account, pan_number
        )
        VALUES (
          ${s.user_id}, ${s.user_name}, ${s.designation}, ${s.department}, ${s.annual_ctc_inr}, ${s.monthly_gross_inr},
          ${s.basic_salary}, ${s.hra}, ${s.special_allowance}, ${s.performance_bonus}, ${s.pf_deduction}, ${s.tds_deduction},
          ${s.insurance_deduction}, ${s.professional_tax}, ${s.monthly_net_inr}, ${s.salary_band}, ${s.bank_name}, ${s.bank_account}, ${s.pan_number}
        )
        ON CONFLICT (user_id) DO UPDATE SET
          annual_ctc_inr = ${s.annual_ctc_inr},
          monthly_gross_inr = ${s.monthly_gross_inr},
          basic_salary = ${s.basic_salary},
          hra = ${s.hra},
          special_allowance = ${s.special_allowance},
          performance_bonus = ${s.performance_bonus},
          pf_deduction = ${s.pf_deduction},
          tds_deduction = ${s.tds_deduction},
          insurance_deduction = ${s.insurance_deduction},
          professional_tax = ${s.professional_tax},
          monthly_net_inr = ${s.monthly_net_inr},
          salary_band = ${s.salary_band},
          bank_name = ${s.bank_name},
          bank_account = ${s.bank_account},
          pan_number = ${s.pan_number};
      `;
    }
    console.log('✓ Salary structures seeded in INR (₹)');

    // Seed recent payslips for Sarah Miller
    await sql`
      INSERT INTO payslips (id, user_id, user_name, month, pay_date, gross_inr, deductions_inr, net_inr, working_days, paid_days, status, transaction_ref)
      VALUES
        (201, 'IA-EM-001', 'Sarah Miller', 'September 2026', '2026-09-30', 150000.00, 21600.00, 128400.00, 22, 22, 'paid', 'SAL-SEP26-9812'),
        (202, 'IA-EM-001', 'Sarah Miller', 'August 2026', '2026-08-31', 150000.00, 21600.00, 128400.00, 22, 22, 'paid', 'SAL-AUG26-8941'),
        (203, 'IA-EM-001', 'Sarah Miller', 'July 2026', '2026-07-31', 150000.00, 21600.00, 128400.00, 23, 23, 'paid', 'SAL-JUL26-7612'),
        (204, 'IA-EM-001', 'Sarah Miller', 'June 2026', '2026-06-30', 150000.00, 21600.00, 128400.00, 22, 22, 'paid', 'SAL-JUN26-6519'),
        (205, 'IA-EM-001', 'Sarah Miller', 'May 2026', '2026-05-31', 150000.00, 21600.00, 128400.00, 21, 21, 'paid', 'SAL-MAY26-5412')
      ON CONFLICT (id) DO NOTHING;
    `;
    // Seed corporate policies
    await sql`
      INSERT INTO policies (id, title, category, version, status, description, content, last_updated)
      VALUES
        (1, 'Code of Conduct & Professional Ethics', 'Conduct', 'v2.3', 'active', 'Standards of professional behavior, ethical guidelines, and compliance requirements for all personnel.', '<h3>1. Purpose</h3><p>This Code of Conduct establishes the standards of professional behavior expected from all personnel across IntelliAttend workspaces.</p><h3>2. Core Values</h3><ul><li><strong>Integrity:</strong> We act honestly, transparently, and ethically in all client and stakeholder interactions.</li><li><strong>Respect:</strong> We treat everyone with dignity, equity, and courtesy.</li><li><strong>Confidentiality:</strong> Strict protection of customer data and intellectual property.</li><li><strong>Accountability:</strong> Ownership of commitments and transparent incident reporting.</li></ul>', '2026-10-15'),
        (2, 'Data Privacy & Information Security Policy', 'Security', 'v3.1', 'active', 'GDPR, ISO 27001, and SOC2 compliant corporate data protection standards and encryption guidelines.', '<h3>1. Scope</h3><p>Applies to all systems, cryptographic secrets, employee records, and production databases.</p><h3>2. Requirements</h3><ul><li>Two-factor authentication (MFA) mandatory on all enterprise portals.</li><li>Zero plain-text password or API key exposure.</li><li>Access based on least-privilege role-based access control (RBAC).</li><li>All data at rest encrypted using AES-256 and in transit via TLS 1.3.</li></ul>', '2026-10-01'),
        (3, 'Remote & Hybrid Work Protocol', 'Operations', 'v1.4', 'active', 'Workplace ergonomics, secure remote access, working hours, and communication standards.', '<h3>1. Work Schedules</h3><p>Core collaboration hours are 10:00 AM to 5:00 PM IST. Employees must punch in/out daily via IntelliAttend.</p><h3>2. Security & Assets</h3><ul><li>Company assets must not be used on unsecured public Wi-Fi networks.</li><li>Hardware loss or compromise must be immediately reported to IT within 2 hours.</li></ul>', '2026-09-15'),
        (4, 'POSH & Workplace Anti-Harassment Policy', 'Compliance', 'v2.0', 'active', 'Zero tolerance framework for workplace discrimination, harassment, and grievance redressing.', '<h3>1. Zero Tolerance</h3><p>IntelliAttend maintains zero tolerance for any form of verbal, physical, sexual, or discriminatory harassment.</p><h3>2. Internal Complaints Committee (ICC)</h3><p>All complaints are investigated strictly within 10 business days under total confidentiality.</p>', '2026-08-20')
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        category = EXCLUDED.category,
        content = EXCLUDED.content;
    `;
    console.log('✓ Enterprise corporate policies seeded');

    // Seed official corporate documents
    await sql`
      INSERT INTO documents (id, title, category, file_url, public_id, file_size, file_type, uploaded_by)
      VALUES
        (1, 'IntelliAttend Employee Handbook 2026', 'Handbooks', 'https://res.cloudinary.com/demo/image/upload/sample.pdf', 'doc_handbook_2026', '2.4 MB', 'PDF', 'SuperAdmin'),
        (2, 'Corporate Code of Conduct & Ethics Charter', 'Policies', 'https://res.cloudinary.com/demo/image/upload/sample.pdf', 'doc_conduct_2026', '1.8 MB', 'PDF', 'HR Operations'),
        (3, 'Statutory EPF & Health Insurance Scheme Guide', 'Benefits', 'https://res.cloudinary.com/demo/image/upload/sample.pdf', 'doc_benefits_2026', '1.2 MB', 'PDF', 'Finance Treasury'),
        (4, 'Emergency Response & Cyber Incident Protocol', 'Security', 'https://res.cloudinary.com/demo/image/upload/sample.pdf', 'doc_security_2026', '950 KB', 'PDF', 'IT SecOps')
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        category = EXCLUDED.category;
    `;
    console.log('✓ Corporate document storage metadata seeded');

    // Seed production support tickets
    await sql`
      INSERT INTO support_tickets (id, ticket_ref, user_id, user_name, user_email, category, priority, subject, description, status, resolution_notes)
      VALUES
        (1, 'TKT-2026-1001', 'IA-EM-001', 'Sarah Miller', 'employee.intelliattend@gmail.com', 'Payroll', 'High', 'Form 16 & TDS Certificate dispatch request', 'Requesting digital Form 16 Part A and Part B for FY 2025-26 tax filing.', 'resolved', 'Digitally signed Form 16 Part A & B generated and dispatched to registered email.'),
        (2, 'TKT-2026-1002', 'IA-EM-001', 'Sarah Miller', 'employee.intelliattend@gmail.com', 'IT Assets', 'Normal', 'External dual-monitor setup request for workstation', 'Requesting additional 27-inch 4K monitor and USB-C dock for Hyderabad development station.', 'in_progress', 'Approved by Engineering Director. Hardware shipment dispatch scheduled.'),
        (3, 'TKT-2026-1003', 'IA-MG-001', 'David Chen', 'manager.intelliattend@gmail.com', 'Attendance', 'High', 'Shift roster biometric sync override for weekend maintenance', 'Weekend scheduled infrastructure maintenance punch override for engineering on-call personnel.', 'resolved', 'Compensatory off balances credited and punch timestamps manually verified.'),
        (4, 'TKT-2026-1004', 'IA-CA-001', 'Client Admin', 'clientadmin.intelliattend@gmail.com', 'Billing', 'High', 'Annual enterprise invoice GSTIN verification', 'Verify GST registration details on TXN-2026-98412 for corporate quarterly tax credit filing.', 'open', NULL)
      ON CONFLICT (id) DO UPDATE SET
        user_name = EXCLUDED.user_name,
        user_email = EXCLUDED.user_email,
        status = EXCLUDED.status;
    `;
    console.log('✓ Production support tickets seeded');

    // 10. Seed real production tasks
    await sql`
      INSERT INTO tasks (id, title, subtitle, scope, assigned_by, assigned_date, priority, due_date, due_date_formatted, status, progress, assignees)
      VALUES
        (
          1,
          'Go through Guides and setup git',
          'Go through Guides and setup git, GitHub workspace, clone repos, and configure local SSH keys.',
          'assignedToMe',
          'David Chen',
          '2026-10-10',
          'Medium',
          '2026-10-15',
          '15 Oct 2026',
          'Completed',
          100,
          '[{"name": "Sarah Miller", "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"}, {"name": "David Chen", "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"}]'::jsonb
        ),
        (
          2,
          'Work on dashboards implementation',
          'Work on dashboards implementation in the panels of employee, manager, and client views.',
          'assignedToMe',
          'David Chen',
          '2026-10-16',
          'Medium',
          '2026-10-23',
          '23 Oct 2026',
          'Completed',
          100,
          '[{"name": "Sarah Miller", "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"}, {"name": "David Chen", "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"}]'::jsonb
        ),
        (
          3,
          'Implement Face Biometrics & Geo Attendance verification',
          'Integrate MediaPipe camera feed for facial match check during punch in/out workflow.',
          'assignedToMe',
          'David Chen',
          '2026-10-24',
          'High',
          '2026-10-29',
          '29 Oct 2026',
          'In Progress',
          75,
          '[{"name": "Sarah Miller", "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"}]'::jsonb
        ),
        (
          4,
          'Review Organisation Chart & Branch Filter components',
          'Verify SVG link connectors, pan/zoom canvas, and employee detail cards.',
          'assignedByMe',
          'Rahul Bariki',
          '2026-10-25',
          'Medium',
          '2026-10-31',
          '31 Oct 2026',
          'Pending',
          30,
          '[{"name": "Sarah Miller", "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"}, {"name": "Alex Rivera", "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"}]'::jsonb
        )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        status = EXCLUDED.status,
        progress = EXCLUDED.progress;
    `;
    console.log('✓ Production tasks seeded');

    // 11. Seed task comments
    await sql`
      INSERT INTO task_comments (id, task_id, author, author_email, time, content)
      VALUES
        (1, 1, 'David Chen', 'manager.intelliattend@gmail.com', '12 Oct 2026, 10:30 AM', 'Please confirm when your local SSH keys and repository remotes are working properly.'),
        (2, 1, 'Sarah Miller', 'employee.intelliattend@gmail.com', '14 Oct 2026, 04:15 PM', 'Completed setup, verified git push and branches. All guides reviewed.'),
        (3, 2, 'David Chen', 'manager.intelliattend@gmail.com', '18 Oct 2026, 11:00 AM', 'Ensure responsiveness on tablets and mobile screens for all quick action widgets.'),
        (4, 2, 'Sarah Miller', 'employee.intelliattend@gmail.com', '23 Oct 2026, 06:00 PM', 'Implemented and tested work timers, quick actions, leaves summary, and regularizations.'),
        (5, 3, 'David Chen', 'manager.intelliattend@gmail.com', '25 Oct 2026, 02:20 PM', 'Add fallbacks for when webcam permission is denied or device does not have camera.')
      ON CONFLICT (id) DO UPDATE SET
        author = EXCLUDED.author,
        content = EXCLUDED.content;
    `;
    console.log('✓ Task comments seeded');

    // 12. Seed real regularizations
    await sql`
      INSERT INTO regularizations (id, user_id, user_name, attendance_date, day, original_clock_in, original_clock_out, requested_clock_in, requested_clock_out, reason_type, reason_details, status, manager_comment, applied_date)
      VALUES
        (
          1,
          'IA-EM-001',
          'Sarah Miller',
          '2026-10-24',
          'Saturday',
          '10:45 AM',
          '06:15 PM',
          '09:30 AM',
          '06:30 PM',
          'Biometric Scanner Failure / Network Glitch',
          'Device terminal failed to sync face verification at office gate entry.',
          'Approved',
          'Verified with physical security entry register.',
          '2026-10-24'
        ),
        (
          2,
          'IA-EM-001',
          'Sarah Miller',
          '2026-10-21',
          'Wednesday',
          '11:15 AM',
          '07:30 PM',
          '09:00 AM',
          '07:30 PM',
          'On-site Client Meeting',
          'Client site deployment visit at Hyderabad facility during morning hours.',
          'Approved',
          'Approved as per itinerary.',
          '2026-10-21'
        ),
        (
          3,
          'IA-EM-001',
          'Sarah Miller',
          '2026-10-26',
          'Monday',
          'Missed Punch',
          '07:00 PM',
          '09:15 AM',
          '07:00 PM',
          'Forgot to Clock In',
          'Was in urgent sprint triage call with tech lead right after arrival.',
          'Pending',
          NULL,
          '2026-10-26'
        )
      ON CONFLICT (id) DO UPDATE SET
        user_name = EXCLUDED.user_name,
        status = EXCLUDED.status;
    `;
    console.log('✓ Production regularizations seeded');

    // 13. Seed real announcements
    await sql`
      INSERT INTO announcements (id, title, category, date, read_time, author, pinned, summary, content)
      VALUES
        (
          1,
          'Q4 2026 Global Townhall & Strategy Alignment',
          'Townhall',
          'Oct 28, 2026',
          '3 min read',
          'Executive Leadership',
          true,
          'Join leadership for the upcoming quarterly townhall addressing company milestones, international expansion, and FY27 roadmap.',
          '<p>Dear Team,</p><p>We are excited to invite all team members across departments to our upcoming <strong>Q4 2026 Global Townhall</strong>. Leadership will present high-level updates on organizational velocity, customer adoption metrics, and key initiatives for the upcoming fiscal cycle.</p><h4>Agenda Overview:</h4><ul><li>• Performance and milestone highlights across engineering and product.</li><li>• Infrastructure and compliance certifications update (ISO 27001 & SOC2 Type II).</li><li>• Open Q&A session with executive leadership and team recognition awards.</li></ul>'
        ),
        (
          2,
          'Annual Festival Holiday Schedule & Workplace Protocols',
          'HR Updates',
          'Oct 24, 2026',
          '2 min read',
          'People & Culture',
          false,
          'Official notification regarding the upcoming gazetted holidays, shift roster adjustments, and emergency operational support.',
          '<p>Dear Employees,</p><p>In accordance with the 2026 statutory holiday calendar, corporate offices will observe mandatory gazetted holidays as published under the Holidays tab.</p><p>For departments supporting round-the-clock enterprise infrastructure, emergency on-call rosters have been published by respective engineering managers. Compensatory off balances will be credited automatically for on-call personnel.</p>'
        ),
        (
          3,
          'Enhanced Group Health Insurance & Wellness Coverage 2026-27',
          'Benefits',
          'Oct 15, 2026',
          '4 min read',
          'Finance & Benefits Treasury',
          false,
          'Rollout of enhanced cashless hospitalization limits, dental OPD coverage, and digital mental health counseling benefits.',
          '<p>Team,</p><p>We are delighted to announce that our annual Group Medical Cover (GMC) policy has been refreshed with enhanced family floater coverage up to ₹7,50,000 per annum, with cashless network access across 8,500+ accredited hospitals nationwide.</p>'
        )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        summary = EXCLUDED.summary;
    `;
    console.log('✓ Real announcements seeded');

    // 14. Seed 2026 official holidays
    await sql`
      INSERT INTO holidays (id, name, date, day, month, year, type, description, is_paid)
      VALUES
        (1, 'New Year''s Day', '2026-01-01', 'Thursday', 0, 2026, 'National Holiday', 'First day of the Gregorian calendar year.', true),
        (2, 'Republic Day', '2026-01-26', 'Monday', 0, 2026, 'National Holiday', 'Commemorates the enactment of the Constitution of India.', true),
        (3, 'Maha Shivaratri', '2026-02-15', 'Sunday', 1, 2026, 'Gazetted Holiday', 'Celebration of Lord Shiva.', true),
        (4, 'Holi', '2026-03-04', 'Wednesday', 2, 2026, 'Gazetted Holiday', 'Festival of colors and arrival of spring.', true),
        (5, 'Eid-ul-Fitr', '2026-03-21', 'Saturday', 2, 2026, 'Gazetted Holiday', 'Islamic festival marking the end of Ramadan fasting.', true),
        (6, 'Dr. B.R. Ambedkar Jayanti', '2026-04-14', 'Tuesday', 3, 2026, 'National Holiday', 'Honors the father of the Indian Constitution.', true),
        (7, 'May Day / Labor Day', '2026-05-01', 'Friday', 4, 2026, 'National Holiday', 'International Workers Day honoring labor rights and welfare.', true),
        (8, 'Independence Day', '2026-08-15', 'Saturday', 7, 2026, 'National Holiday', 'Celebration of national sovereignty and independence.', true),
        (9, 'Mahatma Gandhi Jayanti', '2026-10-02', 'Friday', 9, 2026, 'National Holiday', 'Commemorates the birth anniversary of the Father of the Nation.', true),
        (10, 'Dussehra (Vijaya Dashami)', '2026-10-20', 'Tuesday', 9, 2026, 'Gazetted Holiday', 'Victory of good over evil.', true),
        (11, 'Diwali (Deepavali)', '2026-11-08', 'Sunday', 10, 2026, 'Gazetted Holiday', 'Festival of lights celebrating hope and prosperity.', true),
        (12, 'Christmas Day', '2026-12-25', 'Friday', 11, 2026, 'National Holiday', 'Commemoration of the birth of Jesus Christ.', true)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        date = EXCLUDED.date;
    `;
    console.log('✓ Official 2026 holidays seeded');

    // Run enhanced migrations for reference feature architecture parity
    const { runEnhancedMigration } = await import('./migrate-v2.js');
    await runEnhancedMigration();

    const { runV3Migration } = await import('./migrate-v3.js');
    await runV3Migration();

    console.log('\nSUCCESS: Neon PostgreSQL schema and seed migration complete!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
