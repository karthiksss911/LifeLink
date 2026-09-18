import express from "express";
import {
    createBloodRequest,
    getMyBloodRequests,
} from "../controllers/requestController.js";
import { authenticate, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
    "/",
    authenticate,
    requireRole("requester", "admin"),
    createBloodRequest
);

router.get(
    "/mine",
    authenticate,
    requireRole("requester", "admin"),
    getMyBloodRequests
);

export default router;