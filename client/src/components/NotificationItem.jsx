import { Bell, CheckCheck } from "lucide-react";

export default function NotificationItem({ notification, onMarkRead }) {
  const isUnread = !notification.is_read;

  return (
    <div className={`notification-card ${isUnread ? "unread" : ""}`}>
      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            background: isUnread ? "var(--coral)" : "var(--paper)",
            border: "1px solid var(--ink)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Bell size={18} style={{ color: isUnread ? "var(--ink)" : "var(--ink-soft)" }} />
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "16px" }}>
              {notification.title || "SYSTEM NOTIFICATION"}
            </span>
            {isUnread && (
              <span className="badge-editorial badge-coral" style={{ fontSize: "9px" }}>
                NEW
              </span>
            )}
          </div>

          <p style={{ margin: "6px 0", fontSize: "14px", color: "var(--ink-soft)" }}>
            {notification.message}
          </p>

          <div className="tech-label" style={{ fontSize: "10px" }}>
            RECEIVED: {new Date(notification.created_at || Date.now()).toLocaleTimeString()} — {new Date(notification.created_at || Date.now()).toLocaleDateString()}
          </div>
        </div>
      </div>

      {isUnread && onMarkRead && (
        <button
          onClick={() => onMarkRead(notification.id)}
          title="Mark as read"
          style={{
            background: "transparent",
            border: "1px solid var(--border-dark)",
            padding: "6px 10px",
            fontSize: "11px",
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <CheckCheck size={14} /> READ
        </button>
      )}
    </div>
  );
}
