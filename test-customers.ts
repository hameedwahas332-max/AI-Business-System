import { query } from './server/db/index.js';

async function run() {
  const c = await query('SELECT * FROM customers LIMIT 1');
  console.log("Customer DB keys:", Object.keys(c.rows[0]));
  console.log("Customer Name:", c.rows[0].name);
  console.log("Customer Phone:", c.rows[0].phone);
  process.exit(0);
}
run();
