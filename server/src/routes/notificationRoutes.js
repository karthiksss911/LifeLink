import express from "express";
import {
    getMyNotifications,
    markNotificationAsRead,
} from "../controllers/notificationController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { getUnreadNotificationCount } from "../controllers/donorNotificationController.js";
const router = express.Router();

router.get(
    "/",
    authenticate,
    getMyNotifications
);
router.get(
    "/unread-count",
    authenticate,
    getUnreadNotificationCount
);
router.patch(
    "/:notificationId/read",
    authenticate,
    markNotificationAsRead
);

export default router;