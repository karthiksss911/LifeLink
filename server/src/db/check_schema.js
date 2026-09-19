import { query } from "./pool.js";

async function checkUsersSchema() {
  const res = await query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'users'
  `);
  console.log("=== USERS TABLE COLUMNS ===");
  console.table(res.rows);

  const dpRes = await query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'donor_profiles'
  `);
  console.log("=== DONOR_PROFILES TABLE COLUMNS ===");
  console.table(dpRes.rows);

  const dmRes = await query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'donor_matches'
  `);
  console.log("=== DONOR_MATCHES TABLE COLUMNS ===");
  console.table(dmRes.rows);

  process.exit(0);
}

checkUsersSchema();
