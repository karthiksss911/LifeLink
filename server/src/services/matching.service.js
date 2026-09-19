import { query } from "../db/pool.js";

const DEFAULT_RADIUS_KM = 25;
const MIN_DONATION_INTERVAL_DAYS = 90;

export async function findEligibleDonors({
    bloodGroup,
    latitude,
    longitude,
    radiusKm = DEFAULT_RADIUS_KM,
}) {
    const radiusMeters = radiusKm * 1000;

    const result = await query(
        `
    SELECT
      dp.id AS donor_profile_id,
      dp.user_id AS donor_id,
      dp.blood_group,
      dp.city,
      dp.is_available,

      ROUND(
        (
          ST_Distance(
            dp.location,
            ST_SetSRID(
              ST_MakePoint($2, $1),
              4326
            )::geography
          ) / 1000
        )::numeric,
        2
      ) AS distance_km,

      MAX(dh.donation_date) AS last_donation_date

    FROM donor_profiles dp

    INNER JOIN blood_compatibility bc
      ON bc.donor_group = dp.blood_group
      AND bc.recipient_group = $3
      AND bc.compatible = TRUE

    LEFT JOIN donation_history dh
      ON dh.donor_id = dp.user_id

    WHERE dp.is_available = TRUE

      AND ST_DWithin(
        dp.location,
        ST_SetSRID(
          ST_MakePoint($2, $1),
          4326
        )::geography,
        $4
      )

    GROUP BY
      dp.id,
      dp.user_id,
      dp.blood_group,
      dp.city,
      dp.is_available,
      dp.location,
      dp.last_donation_date,
      dp.minimum_donation_interval_days

    HAVING
      (
        dp.last_donation_date IS NULL
        AND MAX(dh.donation_date) IS NULL
      )
      OR
      (
        GREATEST(
          COALESCE(dp.last_donation_date, '1970-01-01'::date),
          COALESCE(MAX(dh.donation_date), '1970-01-01'::date)
        ) <= CURRENT_DATE - COALESCE(dp.minimum_donation_interval_days, $5)::integer
      )

    ORDER BY distance_km ASC

    LIMIT 50
    `,
        [
            latitude,
            longitude,
            bloodGroup,
            radiusMeters,
            MIN_DONATION_INTERVAL_DAYS,
        ]
    );

    return result.rows;
}