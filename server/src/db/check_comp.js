import { query } from "./pool.js";

async function checkCompatibility() {
  const res = await query("SELECT donor_group, recipient_group, compatible FROM blood_compatibility");
  console.log("=== BLOOD COMPATIBILITY TABLE ===");
  console.table(res.rows);
  process.exit(0);
}

checkCompatibility();
