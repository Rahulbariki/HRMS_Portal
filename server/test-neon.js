import sql from './db.js';

async function testNeon() {
  console.log('====================================================');
  console.log('       TESTING NEON POSTGRESQL END-TO-END           ');
  console.log('====================================================');

  try {
    // 1. Test basic probe
    console.log('[1/5] Testing Neon Connection Probe...');
    const [probe] = await sql`SELECT NOW() AS current_time, current_database() AS db, current_user AS user`;
    console.log(`✓ Neon Connected successfully! DB: ${probe.db}, User: ${probe.user}, Time: ${probe.current_time}`);

    // 2. Test users table
    console.log('\n[2/5] Testing Users in Neon...');
    const users = await sql`SELECT id, email, role, first_name, last_name, designation FROM users ORDER BY id`;
    console.log(`✓ Fetched ${users.length} users from Neon:`);
    users.forEach(u => console.log(`   - [${u.role.toUpperCase()}] ${u.email} (${u.first_name} ${u.last_name})`));

    // 3. Test companies table
    console.log('\n[3/5] Testing Tenant Companies in Neon...');
    const companies = await sql`SELECT id, name, subdomain, plan, status FROM companies ORDER BY id`;
    console.log(`✓ Fetched ${companies.length} corporate tenants:`);
    companies.forEach(c => console.log(`   - ${c.name} (${c.subdomain}) - ${c.plan} [${c.status}]`));

    // 4. Test financial transactions in INR
    console.log('\n[4/5] Testing Transactions in Neon (INR ₹)...');
    const txns = await sql`SELECT id, company_name, plan, amount_inr, gateway, status FROM transactions ORDER BY created_at DESC`;
    console.log(`✓ Fetched ${txns.length} financial transactions:`);
    txns.forEach(t => console.log(`   - ${t.id}: ₹${Number(t.amount_inr).toLocaleString('en-IN', { minimumFractionDigits: 2 })} by ${t.company_name} via ${t.gateway} [${t.status}]`));

    // 5. Test aggregation query
    console.log('\n[5/5] Testing Aggregation Queries...');
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
