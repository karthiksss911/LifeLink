import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Brand from "./Brand.jsx";
import Button from "./Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../services/api.js";
import { LogOut, Bell, LayoutDashboard, HeartHandshake, ListOrdered } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  async function fetchUnreadCount() {
    try {
      const data = await api.get("/api/notifications/unread-count");
      if (data && data.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      // Silent error fallback
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const role = user?.role || "donor";
  const dashboardPath = role === "donor" ? "/donor" : "/requester";

  return (
    <header className="navbar-editorial">
      <div className="container-editorial">
        <div className="navbar-inner">
          <Brand to={user ? dashboardPath : "/login"} />

          {user && (
            <nav>
              <ul className="nav-links">
                <li>
                  <Link
                    to={dashboardPath}
                    className={`nav-item ${location.pathname === dashboardPath ? "active" : ""}`}
                  >
                    DASHBOARD
                  </Link>
                </li>

                {role === "requester" && (
                  <li>
                    <Link
                      to="/requests"
                      className={`nav-item ${location.pathname === "/requests" ? "active" : ""}`}
                    >
                      REQUESTS
                    </Link>
                  </li>
                )}

                <li>
                  <Link
                    to="/matches"
                    className={`nav-item ${location.pathname === "/matches" ? "active" : ""}`}
                  >
                    MATCHES
                  </Link>
                </li>

                <li>
                  <Link
                    to="/notifications"
                    className={`nav-item ${location.pathname === "/notifications" ? "active" : ""}`}
                  >
                    NOTIFICATIONS
                    {unreadCount > 0 && <span className="nav-badge-count">{unreadCount}</span>}
                  </Link>
                </li>
              </ul>
            </nav>
          )}

          <div className="nav-right">
            <div className="api-status-pill">
              <span className="status-dot" />
              <span>API CONNECTED</span>
            </div>

            {user ? (
              <div className="user-nav-profile">
                <span className="user-role-badge">{role.toUpperCase()}</span>
                <span style={{ fontSize: "13px", fontWeight: 700 }} className="font-mono">
                  {user.fullName || user.email}
                </span>
                <Button variant="secondary" size="sm" onClick={handleLogout} title="Sign Out">
                  <LogOut size={14} />
                </Button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "10px" }}>
                <Link to="/login">
                  <Button variant="secondary" size="sm">
                    SIGN IN
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="coral" size="sm">
                    JOIN LIFELINE
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
