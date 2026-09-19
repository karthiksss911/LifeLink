import "dotenv/config";
import { query } from "./pool.js";

async function testContact() {
  try {
    const matches = await query(`
      SELECT dm.id AS match_id, dm.status AS match_status, dm.request_id, dm.donor_id,
             br.requester_id, dp.user_id AS donor_user_id
      FROM donor_matches dm
      INNER JOIN blood_requests br ON br.id = dm.request_id
      INNER JOIN donor_profiles dp ON dp.id = dm.donor_id
      WHERE dm.status = 'accepted'
    `);

    console.log("Found accepted matches in DB:", matches.rows.length);
    console.table(matches.rows);

    for (const m of matches.rows) {
      // Test query as requester
      const reqQuery = await query(
        `
        SELECT
          dm.id AS match_id,
          dm.status AS match_status,
          u.full_name,
          u.phone,
          u.email
        FROM donor_matches dm
        INNER JOIN donor_profiles dp
          ON dp.id = dm.donor_id
        INNER JOIN users u
          ON u.id = dp.user_id
        INNER JOIN blood_requests br
          ON br.id = dm.request_id
        WHERE dm.id = $1
          AND dm.status = 'accepted'
          AND (br.requester_id = $2 OR dp.user_id = $2 OR $3 = 'admin')
        LIMIT 1
        `,
        [m.match_id, m.requester_id, 'requester']
      );

      console.log(`Query result for match ${m.match_id} as requester ${m.requester_id}:`, reqQuery.rows[0]);
    }

    process.exit(0);
  } catch (err) {
    console.error("Test contact error:", err);
    process.exit(1);
  }
}

testContact();
