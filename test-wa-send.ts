import { query } from './server/db/index.js';

async function run() {
  const c = await query("SELECT company_id, phone FROM customers WHERE phone IS NOT NULL LIMIT 1");
  console.log("Customer:", c.rows[0]);
  process.exit(0);
}
run();
