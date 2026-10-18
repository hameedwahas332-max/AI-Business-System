import { query } from './server/db/index.js';

async function run() {
  const c = await query('SELECT * FROM customers LIMIT 1');
  console.log("Customer:", c.rows[0]);
}
run();
