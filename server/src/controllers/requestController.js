import { z } from "zod";
import { query } from "../db/pool.js";

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

        return res.status(201).json({
            success: true,
            message: "Blood request created successfully",
            request: result.rows[0],
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