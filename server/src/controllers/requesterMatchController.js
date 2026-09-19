import { query } from "../db/pool.js";

export async function getRequestMatches(req, res) {
    try {
        const { requestId } = req.params;

        const requestResult = await query(
            `
      SELECT id, requester_id, blood_group, units_required, status
      FROM blood_requests
      WHERE id = $1
      LIMIT 1
      `,
            [requestId]
        );

        const bloodRequest = requestResult.rows[0];

        if (!bloodRequest) {
            return res.status(404).json({
                success: false,
                message: "Blood request not found",
            });
        }

        if (
            bloodRequest.requester_id !== req.user.id &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to view these matches",
            });
        }

        const result = await query(
            `
      SELECT
        dm.id AS match_id,
        dm.id AS "matchId",
        dm.id AS id,
        dm.distance_km,
        dm.distance_km AS "distanceKm",
        dm.match_reason,
        dm.status AS match_status,
        dm.status AS status,
        dp.blood_group,
        dp.blood_group AS "bloodGroup",
        dp.city,
        dp.is_available
      FROM donor_matches dm
      INNER JOIN donor_profiles dp
        ON dp.id = dm.donor_id
      WHERE dm.request_id = $1
      ORDER BY dm.distance_km ASC
      `,
            [requestId]
        );

        return res.json({
            success: true,
            request: bloodRequest,
            matches: result.rows,
        });
    } catch (error) {
        console.error("Get request matches error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve request matches",
        });
    }
}