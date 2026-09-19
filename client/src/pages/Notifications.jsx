import { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import NotificationItem from "../components/NotificationItem.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Button from "../components/Button.jsx";
import { api } from "../services/api.js";
import { Bell, RefreshCw, CheckCheck } from "lucide-react";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const data = await api.get("/api/notifications");
      if (data?.notifications) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.log("Error fetching notifications", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkRead(id) {
    try {
      await api.patch(`/api/notifications/${id}/read`, {});
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.log("Error marking notification read", err);
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="main-content">
        <div className="container-editorial">
          <SectionHeader
            category="DISTRICT DISPATCH NOTIFICATIONS"
            title="Notifications"
            subtitle={`System notifications and emergency dispatch alerts. (${unreadCount} unread)`}
            action={
              <Button variant="secondary" size="sm" onClick={fetchNotifications} icon={RefreshCw}>
                REFRESH
              </Button>
            }
          />

          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", fontFamily: "var(--font-mono)" }}>
              LOADING NOTIFICATIONS...
            </div>
          ) : notifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="No Notifications Yet"
              description="You will receive alerts here when emergency blood requests match your profile or when donors respond."
            />
          ) : (
            <div className="notification-list">
              {notifications.map((n, idx) => (
                <NotificationItem key={n.id || n.notification_id || `notif-${idx}`} notification={n} onMarkRead={handleMarkRead} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
