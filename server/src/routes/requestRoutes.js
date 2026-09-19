import express from "express";
import {
    createBloodRequest,
    getMyBloodRequests,
    cancelBloodRequest,
} from "../controllers/requestController.js";
import { authenticate } from "../middleware/authMiddleware.js";

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

router.patch(
    "/:requestId/cancel",
    authenticate,
    cancelBloodRequest
);

export default router;