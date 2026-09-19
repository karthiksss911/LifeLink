import { query } from "../db/pool.js";

export async function getAcceptedDonorContact(req, res) {
    try {
        const { matchId } = req.params;

        const result = await query(
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
      LIMIT 1
      `,
            [matchId]
        );

        if (!result.rows[0]) {
            return res.status(403).json({
                success: false,
                message: "Donor contact details are available only after the donor accepts",
            });
        }

        return res.json({
            success: true,
            contact: result.rows[0],
        });
    } catch (error) {
        console.error("Get donor contact error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve donor contact details",
        });
    }
}