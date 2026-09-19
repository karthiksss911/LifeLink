import { query } from "./pool.js";

async function checkOwners() {
  const res = await query(`
    SELECT br.id, br.hospital_name, br.requester_id, u.email, br.status
    FROM blood_requests br
    LEFT JOIN users u ON u.id = br.requester_id
    ORDER BY br.created_at DESC
  `);
  console.log("=== ALL BLOOD REQUESTS AND OWNERS ===");
  console.table(res.rows);
  process.exit(0);
}

checkOwners();
