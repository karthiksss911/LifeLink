import "dotenv/config";
import { query } from "./pool.js";

async function inspectData() {
  try {
    const users = await query("SELECT id, full_name, email, phone, role FROM users");
    console.log("=== USERS ===");
    console.table(users.rows);

    const profiles = await query(`
      SELECT id, user_id, blood_group, city, is_available, last_donation_date, minimum_donation_interval_days,
             ST_Y(location::geometry) AS lat, ST_X(location::geometry) AS lng
      FROM donor_profiles
    `);
    console.log("\n=== DONOR PROFILES ===");
    console.table(profiles.rows);

    const requests = await query(`
      SELECT id, requester_id, blood_group, units_required, hospital_name, hospital_address, status, urgency,
             ST_Y(location::geometry) AS lat, ST_X(location::geometry) AS lng
      FROM blood_requests
    `);
    console.log("\n=== BLOOD REQUESTS ===");
    console.table(requests.rows);

    const history = await query("SELECT * FROM donation_history");
    console.log("\n=== DONATION HISTORY ===");
    console.table(history.rows);

    const matches = await query("SELECT * FROM donor_matches");
    console.log("\n=== DONOR MATCHES ===");
    console.table(matches.rows);

    const comp = await query("SELECT * FROM blood_compatibility");
    console.log("\n=== BLOOD COMPATIBILITY COUNT ===", comp.rows.length);

    process.exit(0);
  } catch (err) {
    console.error("Inspect error:", err);
    process.exit(1);
  }
}

inspectData();
