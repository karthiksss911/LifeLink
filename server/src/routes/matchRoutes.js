import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { matchDonorsToRequest } from "../controllers/matchController.js";

const router = express.Router();

router.post(
    "/find",
    authenticate,
    matchDonorsToRequest
);

export default router;