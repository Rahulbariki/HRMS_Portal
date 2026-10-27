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
    console.log('✓ Table "users" verified');

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
        designation: 'Global Platform Super Administrator & Founder',
        department: 'Platform Administration & Security'
      },
      {
        id: 'IA-CA-001',
        email: 'clientadmin.intelliattend@gmail.com',
        role: 'client',
        first_name: 'Alex',
        last_name: 'Rivera',
        designation: 'Client Enterprise Administrator',
        department: 'Executive Leadership'
      },
      {
        id: 'IA-MG-001',
        email: 'manager.intelliattend@gmail.com',
        role: 'manager',
        first_name: 'David',
        last_name: 'Chen',
        designation: 'Engineering & Delivery Director',
        department: 'Engineering'
      },
      {
        id: 'IA-EM-001',
        email: 'employee.intelliattend@gmail.com',
        role: 'employee',
        first_name: 'Sarah',
        last_name: 'Miller',
        designation: 'Lead Product UI/UX Engineer',
        department: 'Product & Design'
      }
    ];

    for (const u of initialUsers) {
      await sql`
        INSERT INTO users (id, email, password_hash, role, first_name, last_name, designation, department)
        VALUES (${u.id}, ${u.email}, ${passwordHash}, ${u.role}, ${u.first_name}, ${u.last_name}, ${u.designation}, ${u.department})
        ON CONFLICT (email) DO UPDATE SET
          password_hash = ${passwordHash},
          first_name = ${u.first_name},
          last_name = ${u.last_name},
          role = ${u.role},
          designation = ${u.designation},
          department = ${u.department};
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
