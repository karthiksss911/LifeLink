import { query } from "./pool.js";

async function addCompletedEnum() {
  try {
    await query("ALTER TYPE match_status ADD VALUE IF NOT EXISTS 'completed'");
    console.log("✅ Successfully added 'completed' to match_status enum");
    
    const res = await query(`
      SELECT e.enumlabel
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname = 'match_status'
    `);
    console.log("Updated match_status enum values:");
    console.table(res.rows);
    process.exit(0);
  } catch (err) {
    console.error("Failed to alter enum:", err);
    process.exit(1);
  }
}

addCompletedEnum();
