import { query } from "../db/pool.js";

export async function acceptMatch(req, res) {
    try {
        const { matchId } = req.params;

        const result = await query(
            `
      UPDATE donor_matches dm
      SET
        status = 'accepted'
      FROM donor_profiles dp
      WHERE dm.id = $1
        AND dm.donor_id = dp.id
        AND dp.user_id = $2
        AND dm.status IN ('matched', 'notified', 'viewed')
      RETURNING
        dm.id,
        dm.request_id,
        dm.donor_id,
        dm.distance_km,
        dm.status
      `,
            [matchId, req.user.id]
        );

        if (!result.rows[0]) {
            return res.status(404).json({
                success: false,
                message: "Match not found or cannot be accepted",
            });
        }

        await query(
            `
      UPDATE notifications
      SET is_read = TRUE
      WHERE match_id = $1
        AND user_id = $2
      `,
            [matchId, req.user.id]
        );

        return res.json({
            success: true,
            message: "You accepted the blood donation request",
            match: result.rows[0],
        });
    } catch (error) {
        console.error("Accept match error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to accept match",
        });
    }
}