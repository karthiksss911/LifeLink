import express from "express";
import {
    authenticate,
    requireRole,
} from "../middleware/authMiddleware.js";
import { getRequestMatches } from "../controllers/requesterMatchController.js";

const router = express.Router();

router.get(
    "/:requestId",
    authenticate,
    requireRole("requester", "admin"),
    getRequestMatches
);

export default router;