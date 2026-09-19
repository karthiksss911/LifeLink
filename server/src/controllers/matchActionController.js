import { pool, query } from "../db/pool.js";

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

export async function completeMatch(req, res) {
    const client = await pool.connect();

    try {
        const { matchId } = req.params;

        await client.query("BEGIN");

        // Lock & fetch match, blood request, and donor profile
        const matchRes = await client.query(
            `
      SELECT
        dm.id AS match_id,
        dm.request_id,
        dm.donor_id,
        dm.status AS match_status,
        dp.user_id AS donor_user_id,
        br.requester_id,
        br.hospital_name,
        br.units_required,
        COALESCE(br.units_fulfilled, 0) AS units_fulfilled,
        br.status AS request_status
      FROM donor_matches dm
      INNER JOIN donor_profiles dp ON dp.id = dm.donor_id
      INNER JOIN blood_requests br ON br.id = dm.request_id
      WHERE dm.id = $1
      FOR UPDATE
      `,
            [matchId]
        );

        const matchRecord = matchRes.rows[0];

        if (!matchRecord) {
            await client.query("ROLLBACK");
            return res.status(404).json({
                success: false,
                message: "Match record not found",
            });
        }

        // Only the requester who owns the request OR an admin may mark donation completed
        if (
            matchRecord.requester_id !== req.user.id &&
            req.user.role !== "admin"
        ) {
            await client.query("ROLLBACK");
            return res.status(403).json({
                success: false,
                message: "Only the blood request owner or an admin can mark a donation as completed",
            });
        }

        if (matchRecord.match_status !== "accepted") {
            await client.query("ROLLBACK");
            return res.status(400).json({
                success: false,
                message: "Only accepted matches can be marked as completed",
            });
        }

        if (matchRecord.request_status === "cancelled") {
            await client.query("ROLLBACK");
            return res.status(400).json({
                success: false,
                message: "Cannot complete a donation for a cancelled blood request",
            });
        }

        // 1. Record donation in donation_history (donor_id references users.id)
        await client.query(
            `
      INSERT INTO donation_history
        (donor_id, donation_date, hospital_name, notes)
      VALUES
        ($1, CURRENT_DATE, $2, $3)
      `,
            [
                matchRecord.donor_user_id,
                matchRecord.hospital_name,
                `Donation completed for LifeLink request ${matchRecord.request_id}`,
            ]
        );

        // 2. Update donor profile's last_donation_date to current date
        await client.query(
            `
      UPDATE donor_profiles
      SET
        last_donation_date = CURRENT_DATE,
        updated_at = NOW()
      WHERE id = $1
      `,
            [matchRecord.donor_id]
        );

        // 3. Update match status to 'completed'
        const updatedMatchRes = await client.query(
            `
      UPDATE donor_matches
      SET
        status = 'completed',
        responded_at = COALESCE(responded_at, NOW())
      WHERE id = $1
      RETURNING id, status, request_id, donor_id
      `,
            [matchId]
        );

        // 4. Update blood_requests units_fulfilled and status
        const newUnitsFulfilled = Number(matchRecord.units_fulfilled) + 1;
        const newReqStatus =
            newUnitsFulfilled >= matchRecord.units_required
                ? "fulfilled"
                : "partially_fulfilled";

        await client.query(
            `
      UPDATE blood_requests
      SET
        units_fulfilled = $1,
        status = $2,
        updated_at = NOW()
      WHERE id = $3
      `,
            [newUnitsFulfilled, newReqStatus, matchRecord.request_id]
        );

        // 5. Create notification for donor
        await client.query(
            `
      INSERT INTO notifications (user_id, match_id, title, message)
      VALUES ($1, $2, $3, $4)
      `,
            [
                matchRecord.donor_user_id,
                matchId,
                "Donation Completed!",
                `Your blood donation for ${matchRecord.hospital_name} has been marked as completed. Thank you for saving a life!`,
            ]
        );

        await client.query("COMMIT");

        return res.json({
            success: true,
            message: "Donation marked as completed",
            match: {
                id: updatedMatchRes.rows[0].id,
                status: updatedMatchRes.rows[0].status,
            },
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Complete match error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to complete match",
        });
    } finally {
        client.release();
    }
}