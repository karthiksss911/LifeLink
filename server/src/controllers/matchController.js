import { z } from "zod";
import { query } from "../db/pool.js";
import { findEligibleDonors } from "../services/matching.service.js";
import { createNotification } from "../services/notification.service.js";

const matchSchema = z.object({
    requestId: z.string().uuid(),
    radiusKm: z.number().min(1).max(100).default(25),
});

export async function matchDonorsToRequest(req, res) {
    try {
        const data = matchSchema.parse(req.body);

        const requestResult = await query(
            `SELECT
         id,
         requester_id,
         blood_group,
         status,
         ST_Y(location::geometry) AS latitude,
         ST_X(location::geometry) AS longitude
       FROM blood_requests
       WHERE id = $1
       LIMIT 1`,
            [data.requestId]
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
                message: "You do not have permission to match this request",
            });
        }

        if (bloodRequest.status === "fulfilled") {
            return res.status(400).json({
                success: false,
                message: "This blood request has already been fulfilled",
            });
        }

        const eligibleDonors = await findEligibleDonors({
            bloodGroup: bloodRequest.blood_group,
            latitude: Number(bloodRequest.latitude),
            longitude: Number(bloodRequest.longitude),
            radiusKm: data.radiusKm,
        });

        const matches = [];

        for (const donor of eligibleDonors) {
            const existingMatch = await query(
                `SELECT id, status
         FROM donor_matches
         WHERE request_id = $1
           AND donor_id = $2
         LIMIT 1`,
                [bloodRequest.id, donor.donor_profile_id]
            );

            let match = existingMatch.rows[0];

            if (!match) {
                const matchResult = await query(
                    `INSERT INTO donor_matches
            (
              request_id,
              donor_id,
              distance_km,
              match_reason,
              status
            )
           VALUES
            ($1, $2, $3, $4::jsonb, 'matched')
           RETURNING
             id,
             request_id,
             donor_id,
             distance_km,
             match_reason,
             status`,
                    [
                        bloodRequest.id,
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

                match = matchResult.rows[0];

                await createNotification({
                    userId: donor.donor_id,
                    matchId: match.id,
                    title: "Blood donation request nearby",
                    message: `A ${bloodRequest.blood_group} blood request has matched you within ${donor.distance_km} km. Open the request to review and respond.`,
                });
            }

            matches.push({
                matchId: match.id,
                match_id: match.id,
                id: match.id,
                donorId: donor.donor_id,
                donor_id: donor.donor_id,
                donorProfileId: donor.donor_profile_id,
                donor_profile_id: donor.donor_profile_id,
                bloodGroup: donor.blood_group,
                blood_group: donor.blood_group,
                city: donor.city,
                distanceKm: donor.distance_km,
                distance_km: donor.distance_km,
                status: match.status,
                match_status: match.status,
            });
        }

        return res.json({
            success: true,
            requestId: bloodRequest.id,
            matchedDonors: matches,
            totalMatches: matches.length,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: "Invalid matching request",
                errors: error.flatten().fieldErrors,
            });
        }

        console.error("Donor matching error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to find eligible donors",
        });
    }
}