import express from "express";
import { authenticate, requireRole } from "../middleware/authMiddleware.js";
import { getMyMatches } from "../controllers/myMatchController.js";

const router = express.Router();

router.get(
    "/",
    authenticate,
    requireRole("donor"),
    getMyMatches
);

export default router;