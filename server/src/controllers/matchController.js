import { z } from "zod";
import { query } from "../db/pool.js";
import { findEligibleDonors } from "../services/matching.service.js";

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

        const donors = await findEligibleDonors({
            bloodGroup: bloodRequest.blood_group,
            latitude: Number(bloodRequest.latitude),
            longitude: Number(bloodRequest.longitude),
            radiusKm: data.radiusKm,
        });

        return res.json({
            success: true,
            requestId: bloodRequest.id,
            matchedDonors: donors,
            totalMatches: donors.length,
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