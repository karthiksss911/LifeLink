import express from "express";
import { authenticate, requireRole } from "../middleware/authMiddleware.js";
import { acceptMatch, declineMatch, completeMatch } from "../controllers/matchActionController.js";

const router = express.Router();

router.patch(
    "/:matchId/accept",
    authenticate,
    requireRole("donor"),
    acceptMatch
);

router.patch(
    "/:matchId/decline",
    authenticate,
    requireRole("donor"),
    declineMatch
);

router.patch(
    "/:matchId/complete",
    authenticate,
    completeMatch
);

export default router;