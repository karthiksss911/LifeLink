import { query } from "./pool.js";

async function debugLocation() {
  try {
    const profiles = await query(`
      SELECT id, user_id, blood_group, city,
             ST_AsText(location::geometry) AS location_wkt,
             ST_Y(location::geometry) AS lat,
             ST_X(location::geometry) AS lng
      FROM donor_profiles
    `);
    console.log("=== DONOR PROFILES LOCATIONS ===");
    console.table(profiles.rows);

    const requests = await query(`
      SELECT id, requester_id, blood_group, hospital_name,
             ST_AsText(location::geometry) AS location_wkt,
             ST_Y(location::geometry) AS lat,
             ST_X(location::geometry) AS lng
      FROM blood_requests
    `);
    console.log("\n=== BLOOD REQUESTS LOCATIONS ===");
    console.table(requests.rows);

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

debugLocation();
