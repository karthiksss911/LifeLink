import "dotenv/config";
import { query } from "./pool.js";

async function test() {
  try {
    // 1. Get a test user (requester)
    const userRes = await query("SELECT id, email, role FROM users WHERE role = 'requester' LIMIT 1");
    if (!userRes.rows[0]) {
      console.log("No requester user found!");
      process.exit(1);
    }
    const requester = userRes.rows[0];
    console.log("Found requester:", requester);

    // 2. Insert a request
    const result = await query(
      `INSERT INTO blood_requests
        (
          requester_id,
          blood_group,
          units_required,
          hospital_name,
          hospital_address,
          location,
          urgency,
          notes
        )
       VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5,
          ST_SetSRID(ST_MakePoint($6, $7), 4326)::geography,
          $8,
          $9
        )
       RETURNING id, blood_group, units_required, hospital_name, hospital_address, ST_Y(location::geometry) as lat, ST_X(location::geometry) as lng, status`,
      [
        requester.id,
        "O+",
        2,
        "City General Hospital",
        "742 Evergreen Terrace",
        77.5946,
        12.9716,
        "high",
        "Test notes",
      ]
    );
    console.log("Request created successfully:", result.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error("Failed to create request in DB:", err);
    process.exit(1);
  }
}

test();
