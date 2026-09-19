import { query } from "../db/pool.js";

const DEFAULT_RADIUS_KM = 25;
const MIN_DONATION_INTERVAL_DAYS = 90;

export async function getMyMatches(req, res) {
  try {
    const result = await query(
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

      WHERE
        dp.user_id = $1

        AND (
          /*
           * Accepted and completed matches remain visible so the donor
           * can review their active and completed donations.
           */
          dm.status IN ('accepted', 'completed')

          OR

          /*
           * Pending matches must still be eligible.
           */
          (
            dm.status IN ('matched', 'notified', 'viewed')

            AND dp.is_available = TRUE

            AND br.status IN ('open', 'partially_fulfilled')

            AND dp.location IS NOT NULL
            AND br.location IS NOT NULL

            AND ST_DWithin(
              dp.location,
              br.location,
              $2
            )

            AND (
              dp.last_donation_date IS NULL
              OR
              dp.last_donation_date <=
                CURRENT_DATE -
                COALESCE(
                  dp.minimum_donation_interval_days,
                  $3
                )::integer
            )
          )
        )

      ORDER BY br.created_at DESC

      LIMIT 50
      `,
      [
        req.user.id,
        DEFAULT_RADIUS_KM * 1000,
        MIN_DONATION_INTERVAL_DAYS,
      ]
    );

    return res.json({
      success: true,
      matches: result.rows,
    });
  } catch (error) {
    console.error("Get donor matches error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve your matches",
    });
  }
}