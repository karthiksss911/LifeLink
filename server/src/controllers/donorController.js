import { z } from "zod";
import { query } from "../db/pool.js";

const donorProfileSchema = z.object({
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
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    city: z.string().min(2).max(100),
    isAvailable: z.boolean().default(true),
});

export async function createOrUpdateDonorProfile(req, res) {
    try {
        const data = donorProfileSchema.parse(req.body);

        if (req.user.role !== "donor") {
            return res.status(403).json({
                success: false,
                message: "Only donor accounts can create donor profiles",
            });
        }

        const result = await query(
            `INSERT INTO donor_profiles
        (user_id, blood_group, location, city, is_available)
       VALUES (
         $1,
         $2,
         ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography,
         $5,
         $6
       )
       ON CONFLICT (user_id)
       DO UPDATE SET
         blood_group = EXCLUDED.blood_group,
         location = EXCLUDED.location,
         city = EXCLUDED.city,
         is_available = EXCLUDED.is_available,
         updated_at = NOW()
       RETURNING
         id,
         user_id,
         blood_group,
         city,
         is_available,
         created_at,
         updated_at`,
            [
                req.user.id,
                data.bloodGroup,
                data.longitude,
                data.latitude,
                data.city,
                data.isAvailable,
            ]
        );

        return res.status(200).json({
            success: true,
            message: "Donor profile saved successfully",
            profile: result.rows[0],
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: "Invalid donor profile data",
                errors: error.flatten().fieldErrors,
            });
        }

        console.error("Donor profile error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to save donor profile",
        });
    }
}

export async function getMyDonorProfile(req, res) {
    try {
        const result = await query(
            `SELECT
         id,
         user_id,
         blood_group,
         city,
         is_available,
         ST_Y(location::geometry) AS latitude,
         ST_X(location::geometry) AS longitude,
         created_at,
         updated_at
       FROM donor_profiles
       WHERE user_id = $1
       LIMIT 1`,
            [req.user.id]
        );

        if (!result.rows[0]) {
            return res.status(404).json({
                success: false,
                message: "Donor profile not found",
            });
        }

        return res.json({
            success: true,
            profile: result.rows[0],
        });
    } catch (error) {
        console.error("Get donor profile error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve donor profile",
        });
    }
}