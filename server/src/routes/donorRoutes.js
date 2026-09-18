import express from "express";
import {
    createOrUpdateDonorProfile,
    getMyDonorProfile,
} from "../controllers/donorController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
    "/profile",
    authenticate,
    createOrUpdateDonorProfile
);

router.get(
    "/profile",
    authenticate,
    getMyDonorProfile
);

export default router;