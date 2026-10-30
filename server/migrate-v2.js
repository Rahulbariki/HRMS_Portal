import sql from './db.js';
import bcrypt from 'bcryptjs';

export async function runEnhancedMigration() {
  console.log('--- Running Enhanced HRMS Schema Migrations ---');

  // 1. Alter Users and Companies tables
  await sql`
    DO $$
    BEGIN
      ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS corporate_email VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS joining_date DATE DEFAULT CURRENT_DATE;
      ALTER TABLE companies ADD COLUMN IF NOT EXISTS subdomain_status VARCHAR(50) DEFAULT 'active';
      ALTER TABLE companies ADD COLUMN IF NOT EXISTS attendance_selfie_required BOOLEAN DEFAULT FALSE;
      ALTER TABLE companies ADD COLUMN IF NOT EXISTS geo_fencing_enabled BOOLEAN DEFAULT FALSE;
    END
    $$;
  `;
  console.log('✓ Users & Companies schema enhanced');

  // 2. Departments table
  await sql`
    CREATE TABLE IF NOT EXISTS departments (
      id SERIAL PRIMARY KEY,
      company_id INT DEFAULT 1,
      name VARCHAR(150) NOT NULL,
      code VARCHAR(50),
      head_name VARCHAR(150),
      head_id VARCHAR(50),
      description TEXT,
      status VARCHAR(20) DEFAULT 'active',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log('✓ Table "departments" verified');

  // 3. Designations table
  await sql`
    CREATE TABLE IF NOT EXISTS designations (
      id SERIAL PRIMARY KEY,
      company_id INT DEFAULT 1,
      title VARCHAR(150) NOT NULL,
      department VARCHAR(100),
      level VARCHAR(50) DEFAULT 'Mid-Level',
      description TEXT,
      status VARCHAR(20) DEFAULT 'active',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log('✓ Table "designations" verified');

  // 4. Internal Expenses table
  await sql`
    CREATE TABLE IF NOT EXISTS internal_expenses (
      id SERIAL PRIMARY KEY,
      company_id INT DEFAULT 1,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      amount_inr NUMERIC(12,2) NOT NULL,
      expense_date DATE NOT NULL,
      vendor VARCHAR(200),
      payment_method VARCHAR(50) DEFAULT 'Corporate Account',
      status VARCHAR(20) DEFAULT 'paid',
      receipt_url TEXT,
      notes TEXT,
      logged_by VARCHAR(100),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log('✓ Table "internal_expenses" verified');

  // 5. Income Types table
  await sql`
    CREATE TABLE IF NOT EXISTS income_types (
      id SERIAL PRIMARY KEY,
      company_id INT DEFAULT 1,
      name VARCHAR(150) NOT NULL,
      category VARCHAR(100) DEFAULT 'Client Retainer',
      billing_cycle VARCHAR(50) DEFAULT 'Monthly',
      currency VARCHAR(10) DEFAULT 'INR',
      default_amount NUMERIC(12,2) DEFAULT 0.00,
      status VARCHAR(20) DEFAULT 'active',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log('✓ Table "income_types" verified');

  // 6. Income Records table
  await sql`
    CREATE TABLE IF NOT EXISTS income_records (
      id SERIAL PRIMARY KEY,
      company_id INT DEFAULT 1,
      income_type_id INT,
      income_type_name VARCHAR(150),
      client_name VARCHAR(255) NOT NULL,
      invoice_ref VARCHAR(100),
      amount_inr NUMERIC(12,2) NOT NULL,
      received_date DATE NOT NULL,
      payment_method VARCHAR(100) DEFAULT 'Bank Wire',
      status VARCHAR(50) DEFAULT 'received',
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log('✓ Table "income_records" verified');

  // 7. Payroll Admins table
  await sql`
    CREATE TABLE IF NOT EXISTS payroll_admins (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(50) NOT NULL UNIQUE,
      company_id INT DEFAULT 1,
      assigned_by VARCHAR(100),
      can_view_salaries BOOLEAN DEFAULT TRUE,
      can_process_invoices BOOLEAN DEFAULT TRUE,
      status VARCHAR(20) DEFAULT 'active',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log('✓ Table "payroll_admins" verified');

  // 8. Payroll Invoices table
  await sql`
    CREATE TABLE IF NOT EXISTS payroll_invoices (
      id SERIAL PRIMARY KEY,
      invoice_number VARCHAR(100) UNIQUE NOT NULL,
      company_id INT DEFAULT 1,
      month VARCHAR(50) NOT NULL,
      year INT NOT NULL,
      total_employees INT NOT NULL,
      gross_amount NUMERIC(12,2) NOT NULL,
      total_deductions NUMERIC(12,2) NOT NULL,
      net_disbursal NUMERIC(12,2) NOT NULL,
      status VARCHAR(50) DEFAULT 'draft',
      generated_by VARCHAR(100),
      due_date DATE,
      payment_date DATE,
      payment_ref VARCHAR(100),
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log('✓ Table "payroll_invoices" verified');

  // 9. Letter Templates table
  await sql`
    CREATE TABLE IF NOT EXISTS letter_templates (
      id SERIAL PRIMARY KEY,
      company_id INT DEFAULT 1,
      title VARCHAR(255) NOT NULL,
      type VARCHAR(100) NOT NULL,
      subject VARCHAR(255),
      body_template TEXT NOT NULL,
      placeholders JSONB DEFAULT '[]'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log('✓ Table "letter_templates" verified');

  // 10. Issued Letters table
  await sql`
    CREATE TABLE IF NOT EXISTS issued_letters (
      id SERIAL PRIMARY KEY,
      company_id INT DEFAULT 1,
      user_id VARCHAR(50) NOT NULL,
      user_name VARCHAR(150) NOT NULL,
      letter_type VARCHAR(100) NOT NULL,
      title VARCHAR(255) NOT NULL,
      issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
      issued_by VARCHAR(150),
      status VARCHAR(50) DEFAULT 'Issued',
      content TEXT,
      download_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log('✓ Table "issued_letters" verified');

  // 11. Offboarding Requests table
  await sql`
    CREATE TABLE IF NOT EXISTS offboarding_requests (
      id SERIAL PRIMARY KEY,
      company_id INT DEFAULT 1,
      user_id VARCHAR(50) NOT NULL,
      user_name VARCHAR(150) NOT NULL,
      department VARCHAR(100),
      designation VARCHAR(150),
      resignation_date DATE NOT NULL,
      requested_last_working_day DATE NOT NULL,
      approved_last_working_day DATE,
      reason TEXT NOT NULL,
      personal_email VARCHAR(255),
      status VARCHAR(50) DEFAULT 'pending',
      kt_status VARCHAR(50) DEFAULT 'pending',
      asset_return_status VARCHAR(50) DEFAULT 'pending',
      relieving_letter_issued BOOLEAN DEFAULT FALSE,
      relieving_letter_url TEXT,
      manager_remarks TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log('✓ Table "offboarding_requests" verified');

  // 12. News Comments table
  await sql`
    CREATE TABLE IF NOT EXISTS news_comments (
      id SERIAL PRIMARY KEY,
      news_id INT NOT NULL,
      user_id VARCHAR(50) NOT NULL,
      user_name VARCHAR(150) NOT NULL,
      avatar_url TEXT,
      comment TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log('✓ Table "news_comments" verified');

  // 13. User Presence table
  await sql`
    CREATE TABLE IF NOT EXISTS user_presence (
      user_id VARCHAR(50) PRIMARY KEY,
      status VARCHAR(20) DEFAULT 'online',
      custom_status TEXT,
      last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log('✓ Table "user_presence" verified');

  // 14. Manager Access Control table
  await sql`
    CREATE TABLE IF NOT EXISTS manager_access_control (
      manager_id VARCHAR(50) PRIMARY KEY,
      permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log('✓ Table "manager_access_control" verified');

  // 15. Subdomain Requests table
  await sql`
    CREATE TABLE IF NOT EXISTS subdomain_requests (
      id SERIAL PRIMARY KEY,
      company_name VARCHAR(255) NOT NULL,
      requested_subdomain VARCHAR(100) UNIQUE NOT NULL,
      contact_email VARCHAR(255) NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log('✓ Table "subdomain_requests" verified');

  // 16. Seed Seed Data
  const passwordHash = await bcrypt.hash('password123', 10);

  // Seed Payroll Admin User & Staff
  const additionalUsers = [
    {
      id: 'IA-PA-001',
      email: 'payrolladmin.intelliattend@gmail.com',
      role: 'payroll_admin',
      first_name: 'James',
      last_name: 'Wilson',
      designation: 'SENIOR PAYROLL & DISBURSAL ADMINISTRATOR',
      department: 'Finance & Accounts',
      phone: '9876543299',
      emergency_phone: '9876543200',
      emergency_contact_name: 'Clara Wilson (Spouse)',
      blood_group: 'B+',
      doj: '10-01-2024',
      dob: '14-04-1988',
      gender: 'Male',
      address: 'Suite 201, Green Meadows, Financial District, Hyderabad',
      work_location: 'Corporate HQ, Hyderabad',
      employment_type: 'Full-Time Corporate Staff',
      shift: 'Corporate General (09:30 AM - 06:30 PM)',
      pan_number: 'ZXCVB1234Q',
      bank_account: '•••• •••• 9921 (ICICI Bank)',
      pf_number: 'PF/HYD/10927766',
      avatar_url: '',
      company_name: 'IntelliAttend Technologies',
      manager_name: 'Alex Rivera (Client Admin)',
      status: 'active',
      is_active: true
    },
    {
      id: 'IA-EM-002',
      email: 'marcus.vance@intelliattend.com',
      role: 'employee',
      first_name: 'Marcus',
      last_name: 'Vance',
      designation: 'Frontend Engineer',
      department: 'Engineering',
      phone: '9876543202',
      emergency_phone: '9876543203',
      emergency_contact_name: 'Helen Vance (Mother)',
      blood_group: 'A+',
      doj: '12-03-2024',
      dob: '05-09-1996',
      gender: 'Male',
      address: 'Apt 12, Cyber Gateway, Madhapur, Hyderabad',
      work_location: 'Engineering Hub, Hyderabad',
      employment_type: 'Full-Time Employee',
      shift: 'General Day (09:00 AM - 06:00 PM)',
      pan_number: 'PLMKJ4567T',
      bank_account: '•••• •••• 5512 (HDFC Bank)',
      pf_number: 'PF/HYD/10928811',
      avatar_url: '',
      company_name: 'IntelliAttend Technologies',
      manager_name: 'David Chen',
      status: 'active',
      is_active: true
    },
    {
      id: 'IA-EM-003',
      email: 'priya.sharma@intelliattend.com',
      role: 'employee',
      first_name: 'Priya',
      last_name: 'Sharma',
      designation: 'Product UI/UX Designer',
      department: 'Product & Design',
      phone: '9876543204',
      emergency_phone: '9876543205',
      emergency_contact_name: 'Rohan Sharma (Brother)',
      blood_group: 'O+',
      doj: '01-05-2024',
      dob: '18-07-1997',
      gender: 'Female',
      address: 'Tower 4, Gachibowli, Hyderabad',
      work_location: 'Engineering Hub, Hyderabad',
      employment_type: 'Full-Time Employee',
      shift: 'General Day (09:00 AM - 06:00 PM)',
      pan_number: 'NBVCX7890Y',
      bank_account: '•••• •••• 3341 (Axis Bank)',
      pf_number: 'PF/HYD/10928822',
      avatar_url: '',
      company_name: 'IntelliAttend Technologies',
      manager_name: 'David Chen',
      status: 'active',
      is_active: true
    },
    {
      id: 'IA-EM-004',
      email: 'daniel.chen@intelliattend.com',
      role: 'employee',
      first_name: 'Daniel',
      last_name: 'Chen',
      designation: 'Cloud DevOps Specialist',
      department: 'Engineering',
      phone: '9876543206',
      emergency_phone: '9876543207',
      emergency_contact_name: 'Mei Chen (Spouse)',
      blood_group: 'B+',
      doj: '15-06-2024',
      dob: '29-01-1993',
      gender: 'Male',
      address: 'Flat 5B, Rainbow Vistas, Hitec City, Hyderabad',
      work_location: 'Engineering Hub, Hyderabad',
      employment_type: 'Full-Time Employee',
      shift: 'General Day (09:00 AM - 06:00 PM)',
      pan_number: 'QAZWS1234E',
      bank_account: '•••• •••• 8871 (SBI Bank)',
      pf_number: 'PF/HYD/10928833',
      avatar_url: '',
      company_name: 'IntelliAttend Technologies',
      manager_name: 'David Chen',
      status: 'active',
      is_active: true
    }
  ];

  for (const u of additionalUsers) {
    await sql`
      INSERT INTO users (
        id, company_id, email, password_hash, role, first_name, last_name,
        designation, department, phone, emergency_phone, emergency_contact_name,
        blood_group, doj, dob, gender, address, work_location,
        employment_type, shift, pan_number, bank_account, pf_number,
        avatar_url, company_name, manager_name, status, is_active
      )
      VALUES (
        ${u.id}, 1, ${u.email}, ${passwordHash}, ${u.role}, ${u.first_name}, ${u.last_name},
        ${u.designation}, ${u.department}, ${u.phone}, ${u.emergency_phone}, ${u.emergency_contact_name},
        ${u.blood_group}, ${u.doj}, ${u.dob}, ${u.gender}, ${u.address}, ${u.work_location},
        ${u.employment_type}, ${u.shift}, ${u.pan_number}, ${u.bank_account}, ${u.pf_number},
        ${u.avatar_url}, ${u.company_name}, ${u.manager_name}, ${u.status}, ${u.is_active}
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        designation = EXCLUDED.designation,
        department = EXCLUDED.department,
        status = EXCLUDED.status,
        is_active = EXCLUDED.is_active;
    `;

    // Seed salary structure
    await sql`
      INSERT INTO salary_structures (
        user_id, user_name, designation, department, annual_ctc_inr,
        monthly_gross_inr, basic_salary, hra, special_allowance,
        performance_bonus, pf_deduction, tds_deduction, insurance_deduction,
        professional_tax, monthly_net_inr, bank_name, bank_account, pan_number
      )
      VALUES (
        ${u.id}, ${u.first_name + ' ' + u.last_name}, ${u.designation}, ${u.department},
        1200000.00, 100000.00, 50000.00, 20000.00, 20000.00,
        10000.00, 1800.00, 4500.00, 1500.00, 200.00, 92000.00,
        'HDFC Bank', ${u.bank_account}, ${u.pan_number}
      )
      ON CONFLICT (user_id) DO NOTHING;
    `;

    // Seed leave balances
    await sql`
      INSERT INTO leave_balances (user_id, annual_total, annual_used, sick_total, sick_used, casual_total, casual_used)
      VALUES (${u.id}, 20, 2, 10, 1, 6, 1)
      ON CONFLICT (user_id) DO NOTHING;
    `;
  }
  console.log('✓ Additional production personnel, salaries & leave balances seeded');

  // Seed Departments
  await sql`
    INSERT INTO departments (id, company_id, name, code, head_name, head_id, description, status)
    VALUES
      (1, 1, 'Engineering', 'ENG', 'David Chen', 'IA-MG-001', 'Core product development, cloud platform, AI, and systems engineering.', 'active'),
      (2, 1, 'Product & Design', 'PRD', 'Sarah Miller', 'IA-EM-001', 'Product discovery, UI/UX architecture, user research, and prototyping.', 'active'),
      (3, 1, 'Sales & Business Development', 'SBD', 'Vikram Malhotra', 'IA-SA-001', 'Enterprise enterprise sales, solutions engineering, and channel growth.', 'active'),
      (4, 1, 'Human Resources & People Ops', 'HR', 'Alex Rivera', 'IA-CA-001', 'Talent acquisition, culture, retention, statutory compliance, and payroll.', 'active'),
      (5, 1, 'Finance & Accounts', 'FIN', 'James Wilson', 'IA-PA-001', 'Corporate treasury, audits, vendor disbursements, and client invoicing.', 'active')
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      code = EXCLUDED.code,
      head_name = EXCLUDED.head_name;
  `;
  console.log('✓ Departments seeded');

  // Seed Designations
  await sql`
    INSERT INTO designations (id, company_id, title, department, level, description, status)
    VALUES
      (1, 1, 'Lead Full-Stack Engineer', 'Engineering', 'Lead Level', 'Technical architecture, sprint oversight, code reviews.', 'active'),
      (2, 1, 'Senior Cloud Architect', 'Engineering', 'Senior Level', 'Multi-tenant cloud scalability, Neon Postgres optimizations, security.', 'active'),
      (3, 1, 'Product UI/UX Designer', 'Product & Design', 'Mid-Level', 'High fidelity component libraries, user journeys, accessibility.', 'active'),
      (4, 1, 'DevOps Specialist', 'Engineering', 'Mid-Level', 'CI/CD automation, Docker orchestration, monitoring.', 'active'),
      (5, 1, 'HR Operations Manager', 'Human Resources & People Ops', 'Manager Level', 'Workforce governance, policy rollout, exit clearances.', 'active'),
      (6, 1, 'Senior Payroll Specialist', 'Finance & Accounts', 'Senior Level', 'Compensation calculations, TDS, Form 16, payroll invoices.', 'active')
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      department = EXCLUDED.department;
  `;
  console.log('✓ Designations seeded');

  // Seed Internal Expenses
  await sql`
    INSERT INTO internal_expenses (id, company_id, title, category, amount_inr, expense_date, vendor, payment_method, status, notes, logged_by)
    VALUES
      (1, 1, 'Neon Postgres Cloud Enterprise Cluster Subscription', 'SaaS & Cloud Infrastructure', 48500.00, '2026-10-15', 'Neon Inc.', 'Corporate Credit Card', 'paid', 'Monthly scalable serverless database compute and storage.', 'David Chen'),
      (2, 1, 'Dedicated 1Gbps Fiber Leased Line & Static IPs', 'Utilities & Network', 18900.00, '2026-10-10', 'Airtel Corporate Business', 'Corporate Account Wire', 'paid', 'High reliability primary network uplink for Hyderabad campus.', 'Alex Rivera'),
      (3, 1, 'Ergonomic Workstations & Standing Desks (Batch 3)', 'Office Infrastructure', 94500.00, '2026-10-02', 'Featherlite Corporate Living', 'Bank Wire Transfer', 'paid', 'Procurement for new engineering pods in Floor 3.', 'David Chen'),
      (4, 1, 'Cloudinary Enterprise Media Transformation CDN', 'SaaS & Cloud Infrastructure', 22400.00, '2026-10-01', 'Cloudinary Ltd.', 'Corporate Credit Card', 'paid', 'KYC document encryption and employee avatar storage pipeline.', 'David Chen')
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      amount_inr = EXCLUDED.amount_inr;
  `;
  console.log('✓ Internal expenses seeded');

  // Seed Income Types & Records
  await sql`
    INSERT INTO income_types (id, company_id, name, category, billing_cycle, currency, default_amount, status)
    VALUES
      (1, 1, 'Enterprise SaaS Annual Retainer', 'Software Licensing', 'Annual', 'INR', 450000.00, 'active'),
      (2, 1, 'Managed HR & Payroll Operations SLA', 'Managed Services', 'Monthly', 'INR', 85000.00, 'active'),
      (3, 1, 'Custom Cloud Integration & Dedicated Support', 'Professional Services', 'Quarterly', 'INR', 150000.00, 'active')
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      default_amount = EXCLUDED.default_amount;
  `;

  await sql`
    INSERT INTO income_records (id, company_id, income_type_id, income_type_name, client_name, invoice_ref, amount_inr, received_date, payment_method, status, notes)
    VALUES
      (1, 1, 1, 'Enterprise SaaS Annual Retainer', 'Acme Global Corporation', 'INV-2026-901', 450000.00, '2026-10-05', 'Direct Wire (HDFC)', 'received', 'Annual enterprise license renewal covering 500 employee seats.'),
      (2, 1, 2, 'Managed HR & Payroll Operations SLA', 'Apex Innovations Group', 'INV-2026-902', 85000.00, '2026-10-12', 'Direct Wire (ICICI)', 'received', 'October 2026 monthly payroll reconciliation and tax compliance fee.'),
      (3, 1, 3, 'Custom Cloud Integration & Dedicated Support', 'NextGen Cloud Systems', 'INV-2026-903', 150000.00, '2026-10-20', 'NEFT Payment', 'received', 'Q3 milestone delivery for biometric webhook integration.')
    ON CONFLICT (id) DO UPDATE SET
      amount_inr = EXCLUDED.amount_inr,
      status = EXCLUDED.status;
  `;
  console.log('✓ Income types & income records seeded');

  // Seed Payroll Admins & Invoices
  await sql`
    INSERT INTO payroll_admins (id, user_id, company_id, assigned_by, can_view_salaries, can_process_invoices, status)
    VALUES
      (1, 'IA-PA-001', 1, 'Alex Rivera', true, true, 'active')
    ON CONFLICT (user_id) DO UPDATE SET
      status = EXCLUDED.status;
  `;

  await sql`
    INSERT INTO payroll_invoices (id, invoice_number, company_id, month, year, total_employees, gross_amount, total_deductions, net_disbursal, status, generated_by, due_date, payment_date, payment_ref, notes)
    VALUES
      (1, 'PAY-INV-2026-10', 1, 'October', 2026, 5, 590000.00, 48500.00, 541500.00, 'submitted', 'James Wilson', '2026-10-31', NULL, NULL, 'October monthly salary run for engineering, product, and leadership teams.'),
      (2, 'PAY-INV-2026-09', 1, 'September', 2026, 5, 590000.00, 48500.00, 541500.00, 'paid', 'James Wilson', '2026-09-30', '2026-09-30', 'HDFC-PAY-998812', 'September salary disbursements completed successfully via HDFC Corporate CMS.'),
      (3, 'PAY-INV-2026-08', 1, 'August', 2026, 5, 590000.00, 48500.00, 541500.00, 'paid', 'James Wilson', '2026-08-31', '2026-08-31', 'HDFC-PAY-882291', 'August monthly payroll processed without deductions variance.')
    ON CONFLICT (invoice_number) DO UPDATE SET
      status = EXCLUDED.status,
      net_disbursal = EXCLUDED.net_disbursal;
  `;
  console.log('✓ Payroll admins & invoices seeded');

  // Seed Standard Corporate Letter Templates
  await sql`
    INSERT INTO letter_templates (id, company_id, title, type, subject, body_template, placeholders)
    VALUES
      (
        1, 1, 'Official Employment Offer Letter', 'Offer',
        'Offer of Employment - {{designation}} at {{company_name}}',
        'Dear {{employee_name}},\n\nOn behalf of {{company_name}}, we are thrilled to offer you the position of {{designation}} in our {{department}} department.\n\nYour annual Cost to Company (CTC) will be INR {{ctc_inr}}, with an intended date of joining on {{joining_date}}.\n\nWe look forward to welcoming you to our team.\n\nSincerely,\nHR Operations Leadership\n{{company_name}}',
        '["employee_name", "designation", "department", "company_name", "ctc_inr", "joining_date"]'::jsonb
      ),
      (
        2, 1, 'Confirmation of Appointment Letter', 'Appointment',
        'Letter of Appointment - {{designation}}',
        'Dear {{employee_name}},\n\nFollowing the successful completion of your verification, we confirm your appointment as a full-time regular employee effective {{joining_date}}.\n\nYou will report to {{manager_name}} at {{work_location}}.\n\nRegards,\nPeople & Culture Operations',
        '["employee_name", "designation", "joining_date", "manager_name", "work_location"]'::jsonb
      ),
      (
        3, 1, 'Merit Promotion & Compensation Adjustment', 'Promotion',
        'Promotion Letter - Advancement to {{new_designation}}',
        'Dear {{employee_name}},\n\nIn recognition of your exceptional performance and strategic contributions to {{department}}, we are delighted to promote you to {{new_designation}} effective {{effective_date}}.\n\nYour revised annual CTC is updated to INR {{new_ctc}}.\n\nCongratulations on this well-deserved achievement!\n\nExecutive Management',
        '["employee_name", "department", "new_designation", "effective_date", "new_ctc"]'::jsonb
      ),
      (
        4, 1, 'Experience & Service Certificate', 'Experience',
        'Certificate of Service & Experience - {{employee_name}}',
        'TO WHOMSOEVER IT MAY CONCERN\n\nThis is to certify that {{employee_name}} (Employee ID: {{employee_id}}) was employed with {{company_name}} from {{doj}} to {{last_working_day}} as {{designation}} in the {{department}} department.\n\nDuring their tenure, they demonstrated high professionalism, technical excellence, and dedication. We wish them all the best in their future endeavors.\n\nAuthorized Signatory\nIntelliAttend Technologies',
        '["employee_name", "employee_id", "company_name", "doj", "last_working_day", "designation", "department"]'::jsonb
      ),
      (
        5, 1, 'Official Relieving Letter & Clearance Certificate', 'Relieving',
        'Relieving Letter & Final Settlement Clearance',
        'Dear {{employee_name}},\n\nWith reference to your resignation dated {{resignation_date}}, we confirm that you are formally relieved from your duties as {{designation}} on the close of business on {{last_working_day}}.\n\nAll company assets have been reconciled and full and final settlement has been authorized.\n\nPeople & Culture Directorate',
        '["employee_name", "resignation_date", "designation", "last_working_day"]'::jsonb
      )
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      body_template = EXCLUDED.body_template;
  `;
  console.log('✓ Letter templates seeded');

  // Seed Issued Letters
  await sql`
    INSERT INTO issued_letters (id, company_id, user_id, user_name, letter_type, title, issue_date, issued_by, status, content)
    VALUES
      (1, 1, 'IA-EM-001', 'Sarah Miller', 'Appointment', 'Official Letter of Appointment', '2024-03-01', 'David Chen', 'Issued', 'Confirmation of regular appointment as Lead Full-Stack Engineer at IntelliAttend Technologies.'),
      (2, 1, 'IA-EM-001', 'Sarah Miller', 'Promotion', 'Annual Merit Promotion & Band Adjustment', '2025-04-01', 'David Chen', 'Issued', 'Promoted to Engineering Lead Band L5 with revised compensation.')
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title;
  `;
  console.log('✓ Issued letters seeded');

  // Seed Offboarding Requests
  await sql`
    INSERT INTO offboarding_requests (id, company_id, user_id, user_name, department, designation, resignation_date, requested_last_working_day, approved_last_working_day, reason, personal_email, status, kt_status, asset_return_status, relieving_letter_issued, manager_remarks)
    VALUES
      (1, 1, 'IA-EM-004', 'Daniel Chen', 'Engineering', 'Cloud DevOps Specialist', '2026-10-18', '2026-11-18', '2026-11-18', 'Pursuing higher academic research in distributed systems.', 'daniel.chen.personal@gmail.com', 'pending', 'in_progress', 'pending', false, 'Knowledge transfer document drafted; awaiting final review.')
    ON CONFLICT (id) DO UPDATE SET
      status = EXCLUDED.status;
  `;
  console.log('✓ Offboarding requests seeded');

  // Seed News Comments
  await sql`
    INSERT INTO news_comments (id, news_id, user_id, user_name, avatar_url, comment)
    VALUES
      (1, 1, 'IA-EM-001', 'Sarah Miller', '', 'Looking forward to the international roadmap presentation and engineering sprint goals!'),
      (2, 1, 'IA-MG-001', 'David Chen', '', 'Engineering leads have prepared great architecture demos for the townhall.'),
      (3, 2, 'IA-EM-001', 'Sarah Miller', '', 'Thanks for publishing the gazetted calendar in advance!')
    ON CONFLICT (id) DO UPDATE SET
      comment = EXCLUDED.comment;
  `;
  console.log('✓ News comments seeded');

  // Seed User Presence
  await sql`
    INSERT INTO user_presence (user_id, status, custom_status)
    VALUES
      ('IA-SA-001', 'online', 'System Monitoring & Security'),
      ('IA-CA-001', 'online', 'Corporate Operations Desk'),
      ('IA-MG-001', 'online', 'In Sprint Review'),
      ('IA-EM-001', 'online', 'Coding / Feature Delivery'),
      ('IA-PA-001', 'online', 'Payroll Processing')
    ON CONFLICT (user_id) DO UPDATE SET
      status = EXCLUDED.status;
  `;
  console.log('✓ User presence seeded');

  // Seed Manager Access Control
  const defaultManagerPerms = {
    employees: true,
    departments: true,
    tasks: true,
    leaves: true,
    attendance: true,
    regularization: true,
    expenses: true,
    internal_expenses: true,
    income: true,
    employee_salaries: true,
    salary_payslips: true,
    payroll_admins: true,
    offboarding: true,
    letters: true,
    news: true,
    documents: true,
    policies: true,
    org_chart: true,
    queries: true,
    messaging: true,
    settings: true
  };

  await sql`
    INSERT INTO manager_access_control (manager_id, permissions)
    VALUES ('IA-MG-001', ${JSON.stringify(defaultManagerPerms)}::jsonb)
    ON CONFLICT (manager_id) DO UPDATE SET
      permissions = EXCLUDED.permissions;
  `;
  console.log('✓ Manager access control seeded');

  console.log('\n--- ENHANCED MIGRATION COMPLETED SUCCESSFULLY ---');
}

if (process.argv[1]?.endsWith('migrate-v2.js')) {
  runEnhancedMigration()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
