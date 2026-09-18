import { query } from "../db/pool.js";

export async function getUnreadNotificationCount(req, res) {
    try {
        const result = await query(
            `
      SELECT COUNT(*)::int AS unread_count
      FROM notifications
      WHERE user_id = $1
        AND is_read = FALSE
      `,
            [req.user.id]
        );

        return res.json({
            success: true,
            unreadCount: result.rows[0].unread_count,
        });
    } catch (error) {
        console.error("Unread notification count error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve unread notification count",
        });
    }
}