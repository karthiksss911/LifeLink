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
    createBloodRequest
);

router.get(
    "/mine",
    authenticate,
    getMyBloodRequests
);

export default router;