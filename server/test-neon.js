import sql from './db.js';

async function testNeon() {
  console.log('====================================================');
  console.log('       TESTING NEON POSTGRESQL END-TO-END           ');
  console.log('====================================================');

  try {
    // 1. Test basic probe
    console.log('[1/8] Testing Neon Connection Probe...');
    const [probe] = await sql`SELECT NOW() AS current_time, current_database() AS db, current_user AS user`;
    console.log(`✓ Neon Connected successfully! DB: ${probe.db}, User: ${probe.user}, Time: ${probe.current_time}`);

    // 2. Test users table
    console.log('\n[2/8] Testing Production Personnel in Neon...');
    const users = await sql`SELECT id, email, role, first_name, last_name, designation FROM users ORDER BY id`;
    console.log(`✓ Fetched ${users.length} authorized users from Neon:`);
    users.forEach(u => console.log(`   - [${u.role.toUpperCase()}] ${u.email} (${u.first_name} ${u.last_name})`));

    // 3. Test companies table
    console.log('\n[3/8] Testing Tenant Companies in Neon...');
    const companies = await sql`SELECT id, name, subdomain, plan, status FROM companies ORDER BY id`;
    console.log(`✓ Fetched ${companies.length} corporate tenants:`);
    companies.forEach(c => console.log(`   - ${c.name} (${c.subdomain}) - ${c.plan} [${c.status}]`));

    // 4. Test financial transactions in INR
    console.log('\n[4/8] Testing Transactions in Neon (INR ₹)...');
    const txns = await sql`SELECT id, company_name, plan, amount_inr, gateway, status FROM transactions ORDER BY created_at DESC`;
    console.log(`✓ Fetched ${txns.length} financial transactions:`);
    txns.forEach(t => console.log(`   - ${t.id}: ₹${Number(t.amount_inr).toLocaleString('en-IN', { minimumFractionDigits: 2 })} by ${t.company_name} via ${t.gateway} [${t.status}]`));

    // 5. Test tasks & comments
    console.log('\n[5/8] Testing Tasks & Comments in Neon...');
    const tasks = await sql`SELECT id, title, priority, status, progress, assigned_by FROM tasks ORDER BY id`;
    console.log(`✓ Fetched ${tasks.length} production sprint tasks:`);
    tasks.forEach(t => console.log(`   - Task #${t.id}: "${t.title}" [${t.status} - ${t.progress}%] Assigned by ${t.assigned_by}`));
    const comments = await sql`SELECT id, task_id, author, content FROM task_comments ORDER BY id`;
    console.log(`✓ Fetched ${comments.length} task discussion comments.`);

    // 6. Test regularizations
    console.log('\n[6/8] Testing Attendance Regularizations in Neon...');
    const regs = await sql`SELECT id, user_name, attendance_date, requested_clock_in, requested_clock_out, status FROM regularizations ORDER BY id`;
    console.log(`✓ Fetched ${regs.length} regularization records:`);
    regs.forEach(r => console.log(`   - #${r.id} (${r.user_name}): ${r.attendance_date} [${r.requested_clock_in} - ${r.requested_clock_out}] Status: ${r.status}`));

    // 7. Test announcements & holidays
    console.log('\n[7/8] Testing Announcements & 2026 Holidays in Neon...');
    const announcements = await sql`SELECT id, title, category, date, author FROM announcements ORDER BY id`;
    console.log(`✓ Fetched ${announcements.length} corporate announcements:`);
    announcements.forEach(a => console.log(`   - [${a.category}] ${a.title} by ${a.author}`));
    const holidays = await sql`SELECT id, name, date, type FROM holidays ORDER BY date LIMIT 4`;
    console.log(`✓ Fetched 2026 Gazetted Holidays: Sample -> ${holidays.map(h => `${h.name} (${h.date})`).join(', ')}`);

    // 8. Test aggregation query
    console.log('\n[8/8] Testing Aggregation Queries...');
    const [rev] = await sql`SELECT SUM(amount_inr) as total_rev FROM transactions WHERE status = 'completed'`;
    console.log(`✓ Total Settled Revenue calculated in Neon: ₹${Number(rev.total_rev).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);

    console.log('\n====================================================');
    console.log('ALL NEON SERVICES PROVED WORKING END-TO-END!');
    console.log('====================================================');
    process.exit(0);
  } catch (error) {
    console.error('Neon test failed:', error);
    process.exit(1);
  }
}

testNeon();

