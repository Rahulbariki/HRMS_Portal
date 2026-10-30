import { pathToFileURL } from 'url';
import sql from './db.js';

export async function resetFreshDatabase() {
  console.log('====================================================');
  console.log('  PURGING ALL DUMMY DATA FOR FRESH START TODAY      ');
  console.log('====================================================');

  try {
    // 1. Purge dummy transactional records
    console.log('[1/7] Purging dummy attendance, leave requests & regularizations...');
    await sql`TRUNCATE TABLE attendance_records CASCADE`;
    await sql`TRUNCATE TABLE leave_requests CASCADE`;
    await sql`TRUNCATE TABLE regularizations CASCADE`;
    console.log('✓ Attendance, leaves & regularization history cleared');

    // 2. Purge dummy tasks & comments
    console.log('\n[2/7] Purging dummy sprint tasks and discussions...');
    await sql`TRUNCATE TABLE task_comments CASCADE`;
    await sql`TRUNCATE TABLE tasks CASCADE`;
    console.log('✓ Tasks and task comments cleared');

    // 3. Purge dummy expenses, income, payslips & invoices
    console.log('\n[3/7] Purging dummy finances, invoices & expense claims...');
    await sql`TRUNCATE TABLE expenses CASCADE`;
    await sql`TRUNCATE TABLE internal_expenses CASCADE`;
    await sql`TRUNCATE TABLE income_records CASCADE`;
    await sql`TRUNCATE TABLE payslips CASCADE`;
    await sql`TRUNCATE TABLE payroll_invoices CASCADE`;
    await sql`TRUNCATE TABLE transactions CASCADE`;
    console.log('✓ Financial claims, payslips, invoices & transactions cleared');

    // 4. Purge dummy letters & offboarding
    console.log('\n[4/7] Purging dummy issued letters & offboarding requests...');
    await sql`TRUNCATE TABLE issued_letters CASCADE`;
    await sql`TRUNCATE TABLE offboarding_requests CASCADE`;
    console.log('✓ Issued letters and offboarding requests cleared');

    // 5. Purge dummy chat messages, corporate emails & support tickets
    console.log('\n[5/7] Purging dummy communications & queries...');
    await sql`TRUNCATE TABLE chat_messages CASCADE`;
    await sql`TRUNCATE TABLE corporate_emails CASCADE`;
    await sql`TRUNCATE TABLE contact_queries CASCADE`;
    await sql`TRUNCATE TABLE support_tickets CASCADE`;
    await sql`TRUNCATE TABLE audit_logs CASCADE`;
    await sql`TRUNCATE TABLE subdomain_requests CASCADE`;
    await sql`TRUNCATE TABLE news_comments CASCADE`;
    await sql`TRUNCATE TABLE announcements CASCADE`;
    console.log('✓ Chat messages, emails, queries, tickets & circulars cleared');

    // 6. Reset chat conversations to clean zero state
    console.log('\n[6/7] Resetting chat channels to fresh state...');
    await sql`
      UPDATE chat_conversations SET
        last_message = 'No messages yet',
        last_time = 'Fresh',
        unread_count = 0
    `;
    console.log('✓ Chat conversations reset');

    // 7. Reset employee leave balances to fresh full annual quotas for 2026
    console.log('\n[7/7] Initializing fresh 2026 annual leave balances...');
    await sql`
      UPDATE leave_balances SET
        annual_total = 15,
        annual_used = 0,
        sick_total = 12,
        sick_used = 0,
        casual_total = 12,
        casual_used = 0,
        updated_at = CURRENT_TIMESTAMP
    `;
    console.log('✓ Leave balances set to full fresh quotas');

    // Add a fresh initial system announcement
    const timeNow = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    await sql`
      INSERT INTO announcements (title, category, date, read_time, author, pinned, summary, content)
      VALUES (
        'Welcome to IntelliAttend HRMS Portal',
        'Townhall',
        ${timeNow},
        '2 min read',
        'Executive Leadership',
        TRUE,
        'IntelliAttend enterprise workspace is officially live starting today.',
        'IntelliAttend enterprise workspace is officially live. Track your daily attendance, regularizations, tasks, leaves, expenses, and payroll directly from your dashboard.'
      )
    `;

    // Log the fresh system startup in audit logs
    await sql`
      INSERT INTO audit_logs (user_email, user_role, action, details, ip_address)
      VALUES (
        'rahulbariki.intelliattend@gmail.com',
        'superadmin',
        'FRESH_SYSTEM_START',
        'Purged all dummy seed data. Started production system fresh on Friday, 30 Oct 2026.',
        '127.0.0.1'
      )
    `;

    console.log('\n====================================================');
    console.log('  DATABASE IS NOW 100% FRESH & READY FOR PRODUCTION ');
    console.log('====================================================');
  } catch (err) {
    console.error('Error during fresh database reset:', err);
    throw err;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const hasConfirm = process.argv.includes('--confirm') || process.env.CONFIRM_RESET === 'true';
  if (!hasConfirm) {
    console.error('ERROR: Database reset requires --confirm flag to execute (e.g. `node server/reset-fresh.js --confirm`).');
    process.exit(1);
  }

  resetFreshDatabase()
    .then(() => {
      console.log('Reset complete, exiting.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Reset execution failed:', err);
      process.exit(1);
    });
}
