import express from "express";
import { authenticate, requireRole } from "../middleware/authMiddleware.js";
import { acceptMatch } from "../controllers/matchActionController.js";

const router = express.Router();

router.patch(
    "/:matchId/accept",
    authenticate,
    requireRole("donor"),
    acceptMatch
);

export default router;