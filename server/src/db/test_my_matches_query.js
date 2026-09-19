import { query } from "./pool.js";

async function testMyMatchesQuery() {
  try {
    // Pick a donor user_id
    const donorUserRes = await query("SELECT user_id FROM donor_profiles LIMIT 1");
    if (!donorUserRes.rows.length) {
      console.log("No donor profile found");
      process.exit(0);
    }
    const donorUserId = donorUserRes.rows[0].user_id;

    const res = await query(
      `
      SELECT
        dm.id AS match_id,
        dm.id AS "matchId",
        dm.id AS id,
        dm.request_id,
        ROUND(
          (
            ST_Distance(
              dp.location,
              br.location
            ) / 1000
          )::numeric,
          2
        ) AS distance_km,
        ROUND(
          (
            ST_Distance(
              dp.location,
              br.location
            ) / 1000
          )::numeric,
          2
        ) AS "distanceKm",
        dm.match_reason,
        dm.status,
        dm.status AS match_status,
        br.blood_group,
        br.blood_group AS "bloodGroup",
        br.units_required,
        br.hospital_name,
        br.hospital_address,
        br.urgency,
        br.status AS request_status,
        br.created_at
      FROM donor_matches dm
      INNER JOIN donor_profiles dp
        ON dp.id = dm.donor_id
      INNER JOIN blood_requests br
        ON br.id = dm.request_id
      INNER JOIN blood_compatibility bc
        ON bc.donor_group = dp.blood_group
        AND bc.recipient_group = br.blood_group
        AND bc.compatible = TRUE
      LEFT JOIN donation_history dh
        ON dh.donor_id = dp.user_id
      WHERE dp.user_id = $1
        AND dp.location IS NOT NULL
        AND br.location IS NOT NULL
        AND (
          dm.status = 'accepted'
          OR (
            dm.status IN ('matched', 'notified', 'viewed')
            AND dp.is_available = TRUE
            AND br.status IN ('open', 'partially_fulfilled')
            AND ST_DWithin(dp.location, br.location, 25000)
          )
        )
      GROUP BY
        dm.id,
        dm.request_id,
        dp.location,
        br.location,
        dm.match_reason,
        dm.status,
        br.blood_group,
        br.units_required,
        br.hospital_name,
        br.hospital_address,
        br.urgency,
        br.status,
        br.created_at,
        dp.last_donation_date,
        dp.minimum_donation_interval_days
      HAVING
        dm.status = 'accepted'
        OR (
          (
            dp.last_donation_date IS NULL
            AND MAX(dh.donation_date) IS NULL
          )
          OR (
            GREATEST(
              COALESCE(dp.last_donation_date, '1970-01-01'::date),
              COALESCE(MAX(dh.donation_date), '1970-01-01'::date)
            ) <= CURRENT_DATE - COALESCE(dp.minimum_donation_interval_days, 90)::integer
          )
        )
      ORDER BY br.created_at DESC
      LIMIT 50
      `,
      [donorUserId]
    );

    console.log("✅ Query executed successfully! Returned rows count:", res.rows.length);
    if (res.rows.length > 0) {
      console.log("Sample row:", res.rows[0]);
    }
    process.exit(0);
  } catch (err) {
    console.error("❌ Query execution failed:", err);
    process.exit(1);
  }
}

testMyMatchesQuery();
