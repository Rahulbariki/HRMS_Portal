import sql from './db.js';

export async function runV3Migration() {
  console.log('--- Running HRMS Schema Migrations v3 (Chat, Mail, Contact Queries, Audit Logs) ---');

  // 1. chat_conversations table
  await sql`
    CREATE TABLE IF NOT EXISTS chat_conversations (
      id VARCHAR(100) PRIMARY KEY,
      type VARCHAR(50) DEFAULT 'dm',
      name VARCHAR(255) NOT NULL,
      initials VARCHAR(10),
      designation VARCHAR(150),
      email VARCHAR(255),
      avatar TEXT,
      is_online BOOLEAN DEFAULT TRUE,
      last_time VARCHAR(50),
      last_message TEXT,
      unread_count INT DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log('✓ Table "chat_conversations" verified');

  // 2. chat_messages table
  await sql`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id SERIAL PRIMARY KEY,
      conversation_id VARCHAR(100) NOT NULL,
      sender_name VARCHAR(150) NOT NULL,
      sender_email VARCHAR(255),
      sender_id VARCHAR(50),
      content TEXT NOT NULL,
      time VARCHAR(50),
      is_me BOOLEAN DEFAULT FALSE,
      attachment_url TEXT,
      attachment_name VARCHAR(255),
      attachment_type VARCHAR(100),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await sql`
    ALTER TABLE chat_messages
    ADD COLUMN IF NOT EXISTS attachment_url TEXT,
    ADD COLUMN IF NOT EXISTS attachment_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS attachment_type VARCHAR(100);
  `;
  console.log('✓ Table "chat_messages" verified');

  // 3. corporate_emails table
  await sql`
    CREATE TABLE IF NOT EXISTS corporate_emails (
      id SERIAL PRIMARY KEY,
      sender_name VARCHAR(150) NOT NULL,
      sender_email VARCHAR(255) NOT NULL,
      sender_initial VARCHAR(10),
      recipient_email VARCHAR(255) DEFAULT 'all',
      is_system BOOLEAN DEFAULT FALSE,
      subject VARCHAR(255) NOT NULL,
      snippet TEXT,
      body TEXT NOT NULL,
      folder VARCHAR(50) DEFAULT 'inbox',
      previous_folder TEXT,
      is_unread BOOLEAN DEFAULT TRUE,
      is_starred BOOLEAN DEFAULT FALSE,
      has_attachment BOOLEAN DEFAULT FALSE,
      label VARCHAR(100) DEFAULT 'General',
      time VARCHAR(50),
      date VARCHAR(50),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await sql`
    ALTER TABLE corporate_emails
    ADD COLUMN IF NOT EXISTS previous_folder TEXT,
    ADD COLUMN IF NOT EXISTS cc TEXT,
    ADD COLUMN IF NOT EXISTS bcc TEXT,
    ADD COLUMN IF NOT EXISTS attachments TEXT;
  `;
  console.log('✓ Table "corporate_emails" verified');

  // 4. contact_queries table
  await sql`
    CREATE TABLE IF NOT EXISTS contact_queries (
      id SERIAL PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      company VARCHAR(150),
      subject VARCHAR(255),
      message TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log('✓ Table "contact_queries" verified');

  // 5. audit_logs table
  await sql`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      user_email VARCHAR(255),
      user_role VARCHAR(50),
      action VARCHAR(100),
      details TEXT,
      ip_address VARCHAR(100) DEFAULT '127.0.0.1',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log('✓ Table "audit_logs" verified');

  // ----------------------------------------------------
  // SEED DATA
  // ----------------------------------------------------
  const [existingConversations] = await sql`SELECT count(*) FROM chat_conversations`;
  if (parseInt(existingConversations.count) === 0) {
    await sql`
      INSERT INTO chat_conversations (id, type, name, initials, designation, email, is_online, last_time, last_message, unread_count)
      VALUES
        ('space-eng', 'space', 'Engineering & Architecture Hub', 'EA', 'All Tech Personnel', 'engineering@intelliattend.com', TRUE, '6:30 pm', 'All schema migrations and connection tests verified.', 1),
        ('dm-david', 'dm', 'David Chen', 'DC', 'Lead Engineering Manager', 'manager.intelliattend@gmail.com', TRUE, '11:55 am', 'Verified and approved your recent attendance regularization request.', 0),
        ('dm-alex', 'dm', 'Alex Rivera', 'AR', 'Client Enterprise Administrator', 'clientadmin.intelliattend@gmail.com', TRUE, 'Yesterday', 'Enterprise subscription tier renewed successfully.', 0),
        ('dm-rahul', 'dm', 'Rahul Bariki', 'RB', 'Platform Super Administrator', 'rahulbariki.intelliattend@gmail.com', TRUE, '24 Oct', 'Neon PostgreSQL cloud database configured and healthy.', 0),
        ('dm-james', 'dm', 'James Wilson', 'JW', 'Payroll Administrator', 'payrolladmin.intelliattend@gmail.com', TRUE, '10:15 am', 'October payroll invoice has been compiled and submitted.', 0);
    `;

    await sql`
      INSERT INTO chat_messages (conversation_id, sender_name, sender_email, content, time, is_me)
      VALUES
        ('space-eng', 'David Chen', 'manager.intelliattend@gmail.com', 'Team, please confirm your local git remote points to https://github.com/Rahulbariki/HRMS_Portal.git before pushing.', '6:15 pm', FALSE),
        ('space-eng', 'Sarah Miller', 'employee.intelliattend@gmail.com', 'Confirmed! Tested the attendance punch-in flow, and verified direct Cloudinary receipt uploads in the reimbursement module.', '6:30 pm', TRUE),
        ('dm-david', 'David Chen', 'manager.intelliattend@gmail.com', 'Hi Sarah, please ensure all INR currency values are formatted with Indian numbering comma separations.', '11:45 am', FALSE),
        ('dm-david', 'Sarah Miller', 'employee.intelliattend@gmail.com', 'Understood David! Formatted all amounts with toLocaleString("en-IN") and tested zero crash states.', '11:55 am', TRUE),
        ('dm-alex', 'Alex Rivera', 'clientadmin.intelliattend@gmail.com', 'Corporate tenant policies have been updated to reflect Q4 2026 security guidelines.', 'Yesterday, 04:30 pm', FALSE),
        ('dm-rahul', 'Rahul Bariki', 'rahulbariki.intelliattend@gmail.com', 'All database tables and schemas are live on Neon serverless PostgreSQL with direct branch connectivity.', '24 Oct, 02:15 pm', FALSE),
        ('dm-james', 'James Wilson', 'payrolladmin.intelliattend@gmail.com', 'Compensation records for all 5 employees in October 2026 have been calculated with full statutory deductions.', '10:15 am', FALSE);
    `;
    console.log('✓ Seeded chat conversations and messages');
  }

  const [existingEmails] = await sql`SELECT count(*) FROM corporate_emails`;
  if (parseInt(existingEmails.count) === 0) {
    await sql`
      INSERT INTO corporate_emails (sender_name, sender_email, sender_initial, is_system, subject, snippet, body, folder, is_unread, is_starred, label, time, date)
      VALUES
        ('HRMS Automated', 'hrms-notifications@intelliattend.io', 'IA', TRUE, 'Annual Leave Approved: Tech Delivery Milestone', 'Your annual leave request has been approved by your Reporting Manager David Chen.', 'Dear Team Member,\n\nYour leave request has been officially approved by David Chen (Lead Engineering Manager).\n\nRequest Summary:\n• Leave Type: Annual Leave (Paid)\n• Start Date: 12 Nov 2026\n• End Date: 15 Nov 2026\n• Total Days: 4.0 Days\n• Status: Approved & Logged in Neon DB\n\nYour attendance records and payroll calculation have been synchronized accordingly.\n\nRegards,\nHuman Resources & People Operations\nIntelliAttend Workspace', 'inbox', TRUE, FALSE, 'HR & Leaves', '16:13', 'Today'),
        ('David Chen', 'manager.intelliattend@gmail.com', 'DC', FALSE, 'Architecture Review: Neon DB & Connection Pooling', 'Hi, please ensure the pool configuration uses the Direct Connection endpoint with SSL rejectUnauthorized set to false.', 'Hi,\n\nGreat progress on the backend migrations. A few quick reminders for the upcoming release:\n1. Ensure the PostgreSQL connection string uses our Neon cloud credentials.\n2. Confirm Cloudinary storage tokens handle receipts and KYC document buffers directly without saving to disk.\n3. Validate that all production accounts have access to administrative routes.\n\nLet me know once the verification tests pass.', 'inbox', FALSE, TRUE, 'Engineering', '14:22', 'Today'),
        ('Finance & Treasury', 'finance@intelliattend.com', 'FT', TRUE, 'October 2026 Salary Disbursal Notice', 'Your salary for the month of October 2026 has been processed and credited to your HDFC salary account.', 'Dear Employee,\n\nYour salary for the period 01-Oct-2026 to 31-Oct-2026 has been successfully disbursed.\n\nGross Salary: ₹1,55,000\nNet Credit: ₹1,34,500\nBank Reference: UTR9821441829\n\nYou can view and download your full signed payslip from the Salary portal.\n\nBest Regards,\nPayroll & Compensation Unit', 'inbox', FALSE, FALSE, 'Finance', '10:00', 'Yesterday'),
        ('Alex Rivera', 'clientadmin.intelliattend@gmail.com', 'AR', FALSE, 'Q4 Enterprise Goals & Performance Appraisal Cycle', 'The annual review cycles are kicking off next Monday. Self-evaluations must be completed.', 'Hi Team,\n\nPlease make sure your sprint deliverables are tagged in the tasks portal. Self-evaluations will open in the next sprint window.\n\nCheers,\nAlex Rivera', 'sent', FALSE, FALSE, 'Management', '09:45', '26 Oct');
    `;
    console.log('✓ Seeded corporate emails');
  }

  const [existingQueries] = await sql`SELECT count(*) FROM contact_queries`;
  if (parseInt(existingQueries.count) === 0) {
    await sql`
      INSERT INTO contact_queries (name, email, phone, company, subject, message, status)
      VALUES
        ('Vikram Malhotra', 'vikram@tataelxsi.com', '+91 98200 12345', 'Tata Elxsi Ltd', 'Enterprise Custom Deployment & Face Biometrics', 'We are looking to migrate 1,200 engineers onto IntelliAttend with custom facial recognition and geo-fenced punch-ins.', 'pending'),
        ('Pooja Singhania', 'pooja@infosys.com', '+91 98450 67890', 'Infosys Cloud', 'Multi-tenant Subdomain Setup SLA', 'Inquiring about dedicated subdomains and SSO SAML integration for client portals.', 'resolved');
    `;
    console.log('✓ Seeded contact queries');
  }

  const [existingLogs] = await sql`SELECT count(*) FROM audit_logs`;
  if (parseInt(existingLogs.count) === 0) {
    await sql`
      INSERT INTO audit_logs (user_email, user_role, action, details, ip_address)
      VALUES
        ('rahulbariki.intelliattend@gmail.com', 'superadmin', 'MIGRATION_RUN', 'Executed Neon PostgreSQL schema sync v3', '127.0.0.1'),
        ('manager.intelliattend@gmail.com', 'manager', 'LEAVE_ALLOCATION', 'Allocated 2026 leave quotas for Engineering department', '192.168.1.104'),
        ('payrolladmin.intelliattend@gmail.com', 'payroll_admin', 'INVOICE_SUBMITTED', 'Submitted October 2026 payroll run (₹10,83,000 net)', '192.168.1.112');
    `;
    console.log('✓ Seeded audit logs');
  }

  console.log('--- Migrations v3 Successfully Applied ---');
}

