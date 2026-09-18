import { query } from "../db/pool.js";
import { getUserNotifications } from "../services/notification.service.js";

export async function getMyNotifications(req, res) {
    try {
        const notifications = await getUserNotifications(req.user.id);

        return res.json({
            success: true,
            notifications,
        });
    } catch (error) {
        console.error("Get notifications error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve notifications",
        });
    }
}

export async function markNotificationAsRead(req, res) {
    try {
        const { notificationId } = req.params;

        const result = await query(
            `
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = $1
        AND user_id = $2
      RETURNING
        id,
        is_read
      `,
            [notificationId, req.user.id]
        );

        if (!result.rows[0]) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        return res.json({
            success: true,
            message: "Notification marked as read",
            notification: result.rows[0],
        });
    } catch (error) {
        console.error("Mark notification error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update notification",
        });
    }
}