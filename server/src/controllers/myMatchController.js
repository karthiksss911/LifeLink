import { query } from "../db/pool.js";

export async function getMyMatches(req, res) {
    try {
        const result = await query(
            `
      SELECT
        dm.id AS match_id,
        dm.request_id,
        dm.distance_km,
        dm.match_reason,
        dm.status,
        br.blood_group,
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
      WHERE dp.user_id = $1
      ORDER BY br.created_at DESC
      LIMIT 50
      `,
            [req.user.id]
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