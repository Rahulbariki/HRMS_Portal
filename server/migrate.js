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
        status VARCHAR(20) NOT NULL,
        mode VARCHAR(50)
      );
    `;
    console.log('✓ Table "attendance_records" verified');

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

    // Seed initial companies
    await sql`
      INSERT INTO companies (name, subdomain, plan, status, admin_email, employees, managers, joined_date)
      VALUES 
        ('Acme Enterprise', 'acme.hrms.portal', 'Enterprise Tier', 'active', 'clientadmin.intelliattend@gmail.com', 480, 32, 'Jan 15, 2025'),
        ('Global Tech Corp', 'globaltech.hrms.portal', 'Professional Tier', 'active', 'hr@globaltech.com', 195, 14, 'Mar 02, 2025'),
        ('Nexus Dynamics', 'nexus.hrms.portal', 'Starter Tier', 'active', 'contact@nexusdyn.io', 45, 4, 'Oct 10, 2026'),
        ('Pinnacle Labs', 'pinnacle.hrms.portal', 'Enterprise Tier', 'active', 'admin@pinnaclelabs.com', 620, 48, 'Jun 22, 2024')
      ON CONFLICT (subdomain) DO NOTHING;
    `;
    console.log('✓ Corporate tenant companies seeded');

    // Seed initial transactions in INR (₹)
    await sql`
      INSERT INTO transactions (id, company_name, subdomain, plan, billing_cycle, amount_inr, subtotal, gst_18, gateway, gateway_ref, status, customer_email, customer_name, gstin, payment_method)
      VALUES
        ('TXN-2026-98412', 'Acme Enterprise', 'acme.hrms.portal', 'Enterprise Tier', 'Annual', 4800.00, 4067.80, 732.20, 'Razorpay UPI', 'pay_Rz7x92La1098', 'completed', 'clientadmin.intelliattend@gmail.com', 'Acme Corporate Accounts', '36AABCU9603R1ZM', 'UPI • corporate@okhdfcbank'),
        ('TXN-2026-98409', 'Global Tech Corp', 'globaltech.hrms.portal', 'Professional Tier', 'Annual', 2390.00, 2025.42, 364.58, 'Stripe Business', 'ch_3N9xKl2eZvKYlo2C1', 'completed', 'hr@globaltech.com', 'Global Tech Corp Accounts', '29AABCG8921P1ZN', 'Corporate Visa •••• 4242'),
        ('TXN-2026-98401', 'CyberTech Systems', 'cybertech.hrms.portal', 'Enterprise Tier', 'Annual', 4800.00, 4067.80, 732.20, 'HDFC Corporate Wire', 'NEFT-HDFC002847192', 'pending', 'finance@cybertechsys.in', 'CyberTech Treasury', '36AACCY1122R1ZQ', 'Bank Wire / RTGS'),
        ('TXN-2026-98394', 'Pinnacle Labs', 'pinnacle.hrms.portal', 'Enterprise Tier', 'Monthly', 499.00, 422.88, 76.12, 'Razorpay UPI', 'pay_Pinnacle77192', 'completed', 'admin@pinnaclelabs.com', 'Pinnacle Labs Inc', '36AAACP4411Q1ZU', 'UPI • pinnacle@icici')
      ON CONFLICT (id) DO NOTHING;
    `;
    console.log('✓ Financial transactions seeded in INR (₹)');

    console.log('\nSUCCESS: Neon PostgreSQL schema and seed migration complete!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
