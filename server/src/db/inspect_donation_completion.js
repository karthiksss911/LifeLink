import { query } from "./pool.js";

async function inspectSchema() {
  try {
    const enumRes = await query(`
      SELECT e.enumlabel
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname = 'match_status'
    `);
    console.log("=== MATCH_STATUS ENUM VALUES ===");
    console.table(enumRes.rows);

    const brCols = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'blood_requests'
    `);
    console.log("=== BLOOD_REQUESTS COLUMNS ===");
    console.table(brCols.rows);

    const dhCols = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'donation_history'
    `);
    console.log("=== DONATION_HISTORY COLUMNS ===");
    console.table(dhCols.rows);

    const reqStatusEnum = await query(`
      SELECT e.enumlabel
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname = 'request_status'
    `);
    console.log("=== REQUEST_STATUS ENUM VALUES ===");
    console.table(reqStatusEnum.rows);

    process.exit(0);
  } catch (err) {
    console.error("Schema inspection error:", err);
    process.exit(1);
  }
}

inspectSchema();
