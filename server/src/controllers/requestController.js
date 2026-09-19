import { z } from "zod";
import { query } from "../db/pool.js";
import { findEligibleDonors } from "../services/matching.service.js";
import { createNotification } from "../services/notification.service.js";

const requestSchema = z.object({
    bloodGroup: z.enum([
        "A+",
        "A-",
        "B+",
        "B-",
        "AB+",
        "AB-",
        "O+",
        "O-",
    ]),
    unitsRequired: z.coerce.number().int().min(1).max(20),
    hospitalName: z.string().min(2).max(200),
    hospitalAddress: z.string().min(2).max(300),
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
    urgency: z
        .enum(["low", "normal", "high", "critical"])
        .default("normal"),
    notes: z.string().max(1000).optional().nullable().transform((v) => v || ""),
});

export async function createBloodRequest(req, res) {
    try {
        const data = requestSchema.parse(req.body);

        const result = await query(
            `INSERT INTO blood_requests
        (
          requester_id,
          blood_group,
          units_required,
          hospital_name,
          hospital_address,
          location,
          urgency,
          notes
        )
       VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5,
          ST_SetSRID(ST_MakePoint($6, $7), 4326)::geography,
          $8,
          $9
        )
       RETURNING
         id,
         requester_id,
         blood_group,
         units_required,
         hospital_name,
         hospital_address,
         ST_Y(location::geometry) AS latitude,
         ST_X(location::geometry) AS longitude,
         urgency,
         notes,
         status,
         created_at`,
            [
                req.user.id,
                data.bloodGroup,
                data.unitsRequired,
                data.hospitalName,
                data.hospitalAddress,
                data.longitude,
                data.latitude,
                data.urgency,
                data.notes,
            ]
        );

        const createdRequest = result.rows[0];

        // Automatically trigger donor matching for the new request
        try {
            console.log(`[MATCH] request created: ${createdRequest.id}`);

            const eligibleDonors = await findEligibleDonors({
                bloodGroup: data.bloodGroup,
                latitude: Number(data.latitude),
                longitude: Number(data.longitude),
                radiusKm: 25,
            });

            console.log(`[MATCH] eligible donors: ${eligibleDonors.length}`);

            let matchesCreated = 0;
            let notificationsCreated = 0;

            if (eligibleDonors.length === 0) {
                console.log(`[MATCH] 0 eligible donors found within 25km for blood group ${data.bloodGroup} at location (${data.latitude}, ${data.longitude})`);
            }

            for (const donor of eligibleDonors) {
                const matchResult = await query(
                    `INSERT INTO donor_matches
            (request_id, donor_id, distance_km, match_reason, status)
           VALUES ($1, $2, $3, $4::jsonb, 'matched')
           ON CONFLICT (request_id, donor_id) DO NOTHING
           RETURNING id`,
                    [
                        createdRequest.id,
                        donor.donor_profile_id,
                        donor.distance_km,
                        JSON.stringify({
                            bloodGroupCompatible: true,
                            donorAvailable: true,
                            donationIntervalSatisfied: true,
                            withinRadius: true,
                        }),
                    ]
                );

                if (matchResult.rows[0]) {
                    matchesCreated++;
                    const notif = await createNotification({
                        userId: donor.donor_id,
                        matchId: matchResult.rows[0].id,
                        title: "Blood Request Near You",
                        message: `Emergency request for ${data.bloodGroup} blood at ${data.hospitalName} (${data.urgency.toUpperCase()} urgency, approx ${donor.distance_km} km away).`,
                    });
                    if (notif) notificationsCreated++;
                }
            }

            console.log(`[MATCH] matches created: ${matchesCreated}`);
            console.log(`[MATCH] notifications created: ${notificationsCreated}`);
        } catch (matchErr) {
            console.error("Automatic matching error:", matchErr);
        }

        return res.status(201).json({
            success: true,
            message: "Blood request created successfully",
            request: createdRequest,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: "Invalid blood request data",
                errors: error.flatten().fieldErrors,
            });
        }

        console.error("Create blood request error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to create blood request",
        });
    }
}

export async function getMyBloodRequests(req, res) {
    try {
        const result = await query(
            `SELECT
         id,
         blood_group,
         units_required,
         units_fulfilled,
         hospital_name,
         hospital_address,
         ST_Y(location::geometry) AS latitude,
         ST_X(location::geometry) AS longitude,
         urgency,
         notes,
         status,
         created_at,
         updated_at
       FROM blood_requests
       WHERE requester_id = $1
       ORDER BY created_at DESC`,
            [req.user.id]
        );

        return res.json({
            success: true,
            requests: result.rows,
        });
    } catch (error) {
        console.error("Get blood requests error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve blood requests",
        });
    }
}

export async function cancelBloodRequest(req, res) {
    try {
        const { requestId } = req.params;

        const requestResult = await query(
            `SELECT id, requester_id, status FROM blood_requests WHERE id = $1 LIMIT 1`,
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
                message: "You do not have permission to cancel this request",
            });
        }

        if (bloodRequest.status === "fulfilled") {
            return res.status(400).json({
                success: false,
                message: "Fulfilled blood requests cannot be cancelled",
            });
        }

        if (bloodRequest.status === "cancelled") {
            return res.status(400).json({
                success: false,
                message: "Blood request is already cancelled",
            });
        }

        const result = await query(
            `UPDATE blood_requests
       SET status = 'cancelled', updated_at = NOW()
       WHERE id = $1
       RETURNING id, status, updated_at`,
            [requestId]
        );

        // Update pending matches to cancelled
        await query(
            `UPDATE donor_matches
       SET status = 'cancelled'
       WHERE request_id = $1 AND status IN ('matched', 'notified', 'viewed')`,
            [requestId]
        );

        return res.json({
            success: true,
            message: "Blood request cancelled successfully",
            request: result.rows[0],
        });
    } catch (error) {
        console.error("Cancel blood request error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to cancel blood request",
        });
    }
}