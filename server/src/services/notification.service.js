import { query } from "../db/pool.js";

export async function createNotification({
    userId,
    matchId,
    title,
    message,
}) {
    const result = await query(
        `
    INSERT INTO notifications
      (
        user_id,
        match_id,
        title,
        message
      )
    VALUES
      ($1, $2, $3, $4)
    RETURNING
      id,
      user_id,
      match_id,
      title,
      message,
      is_read
    `,
        [
            userId,
            matchId,
            title,
            message,
        ]
    );

    return result.rows[0];
}

export async function getUserNotifications(userId) {
    const result = await query(
        `
    SELECT
      id,
      match_id,
      title,
      message,
      is_read
    FROM notifications
    WHERE user_id = $1
    ORDER BY id DESC
    LIMIT 100
    `,
        [userId]
    );

    return result.rows;
}