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

        // Notify the requester that a donor accepted the match
        try {
            const reqUserRes = await query(
                `
        SELECT br.requester_id, br.hospital_name, br.blood_group, u.full_name AS donor_name
        FROM donor_matches dm
        INNER JOIN blood_requests br ON br.id = dm.request_id
        INNER JOIN donor_profiles dp ON dp.id = dm.donor_id
        INNER JOIN users u ON u.id = dp.user_id
        WHERE dm.id = $1
        LIMIT 1
        `,
                [matchId]
            );

            if (reqUserRes.rows[0]) {
                const { requester_id, hospital_name, blood_group, donor_name } = reqUserRes.rows[0];
                await query(
                    `
          INSERT INTO notifications (user_id, match_id, title, message)
          VALUES ($1, $2, $3, $4)
          `,
                    [
                        requester_id,
                        matchId,
                        "Donor Accepted Emergency Request!",
                        `Donor ${donor_name || "Volunteer"} has ACCEPTED your ${blood_group} request for ${hospital_name}. Phone and contact details are now unlocked.`,
                    ]
                );
            }
        } catch (notifErr) {
            console.error("Error creating requester acceptance notification:", notifErr);
        }

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

export async function declineMatch(req, res) {
    try {
        const { matchId } = req.params;

        const result = await query(
            `
      UPDATE donor_matches dm
      SET
        status = 'declined'
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
                message: "Match not found or cannot be declined",
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
            message: "Match declined successfully",
            match: result.rows[0],
        });
    } catch (error) {
        console.error("Decline match error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to decline match",
        });
    }
}