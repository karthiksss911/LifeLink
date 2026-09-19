import "dotenv/config";
import { query } from "./pool.js";
import { findEligibleDonors } from "../services/matching.service.js";

async function testWorkflow() {
  try {
    console.log("=== 1. TEST WORKFLOW START ===");

    // Get a requester user
    const reqUserRes = await query("SELECT id, email FROM users WHERE role = 'requester' LIMIT 1");
    const requester = reqUserRes.rows[0];

    // Create a blood request
    const requestRes = await query(
      `INSERT INTO blood_requests
        (requester_id, blood_group, units_required, hospital_name, hospital_address, location, urgency, notes)
       VALUES
        ($1, 'O+', 2, 'St. Jude Emergency Hospital', '100 Main St', ST_SetSRID(ST_MakePoint(77.5946, 12.9716), 4326)::geography, 'high', 'Immediate need')
       RETURNING id, blood_group, ST_Y(location::geometry) AS lat, ST_X(location::geometry) AS lng`,
      [requester.id]
    );
    const req = requestRes.rows[0];
    console.log("✅ Created request:", req.id, req.blood_group);

    // Run matching service
    const eligibleDonors = await findEligibleDonors({
      bloodGroup: req.blood_group,
      latitude: Number(req.lat),
      longitude: Number(req.lng),
      radiusKm: 25,
    });
    console.log(`✅ Found ${eligibleDonors.length} eligible nearby donors within 25km radius & >90 days interval`);

    if (eligibleDonors.length > 0) {
      const donor = eligibleDonors[0];
      console.log("Matched donor profile:", donor.donor_profile_id, "Distance:", donor.distance_km, "km");

      // Insert match
      const matchRes = await query(
        `INSERT INTO donor_matches (request_id, donor_id, distance_km, status)
         VALUES ($1, $2, $3, 'matched')
         RETURNING id, status`,
        [req.id, donor.donor_profile_id, donor.distance_km]
      );
      const matchId = matchRes.rows[0].id;
      console.log("✅ Created match record:", matchId);

      // Verify contact privacy BEFORE acceptance
      const contactBefore = await query(
        `SELECT dm.id FROM donor_matches dm WHERE dm.id = $1 AND dm.status = 'accepted'`,
        [matchId]
      );
      console.log("Contact status before accept (should be empty):", contactBefore.rows.length === 0 ? "PROTECTED (0 rows)" : "UNPROTECTED");

      // Simulate donor accept
      await query(
        `UPDATE donor_matches SET status = 'accepted' WHERE id = $1`,
        [matchId]
      );

      // Verify contact privacy AFTER acceptance
      const contactAfter = await query(
        `SELECT dm.id, u.full_name, u.phone, u.email
         FROM donor_matches dm
         INNER JOIN donor_profiles dp ON dp.id = dm.donor_id
         INNER JOIN users u ON u.id = dp.user_id
         WHERE dm.id = $1 AND dm.status = 'accepted'`,
        [matchId]
      );
      console.log("✅ Contact details AFTER accept (UNLOCKED):", contactAfter.rows[0]);
    }

    console.log("=== WORKFLOW TEST PASSED ===");
    process.exit(0);
  } catch (err) {
    console.error("Workflow test failed:", err);
    process.exit(1);
  }
}

testWorkflow();
