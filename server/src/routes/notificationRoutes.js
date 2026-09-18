import express from "express";
import {
    getMyNotifications,
    markNotificationAsRead,
} from "../controllers/notificationController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
    "/",
    authenticate,
    getMyNotifications
);

router.patch(
    "/:notificationId/read",
    authenticate,
    markNotificationAsRead
);

export default router;