import express from "express";
import { authenticate, requireRole } from "../middleware/authMiddleware.js";
import { getAcceptedDonorContact } from "../controllers/contactController.js";

const router = express.Router();

router.get(
    "/:matchId",
    authenticate,
    requireRole("requester", "admin"),
    getAcceptedDonorContact
);

export default router;