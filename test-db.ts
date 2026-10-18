import { query } from './server/db/index.js';

async function test() {
  const users = await query('SELECT COUNT(*) as c FROM users');
  const companies = await query('SELECT COUNT(*) as c FROM companies');
  const states = await query('SELECT state FROM production_onboarding_states');
  console.log(`Users: ${users.rows[0].c}, Companies: ${companies.rows[0].c}`);
  console.log('States:', states.rows);
  process.exit(0);
}

test();
