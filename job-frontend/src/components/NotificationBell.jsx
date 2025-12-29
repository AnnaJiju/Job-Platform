import { useEffect, useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { io } from "socket.io-client";

export default function NotificationBell() {
  const { token, user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!token || !user) return;

    const socket = io("http://localhost:3000", {
      auth: { token }
    });

    socket.on("connect", () => {
      console.log("✅ Connected to WebSocket");
      socket.emit("register", { userId: user.id, role: user.role });
    });

    socket.on("newJob", (data) => {
      console.log("📢 New job notification:", data);
      const notification = {
        id: Date.now(),
        type: "newJob",
        message: `New job posted: ${data.title} at ${data.company}`,
        timestamp: new Date()
      };
      setNotifications(prev => [notification, ...prev]);
    });

    socket.on("applicationUpdate", (data) => {
      console.log("📢 Application update:", data);
      const notification = {
        id: Date.now(),
        type: "applicationUpdate",
        message: `Your application status changed to: ${data.status}`,
        timestamp: new Date()
      };
      setNotifications(prev => [notification, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, [token, user]);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button onClick={() => setShowDropdown(!showDropdown)}>
        🔔 {notifications.length > 0 && `(${notifications.length})`}
      </button>

      {showDropdown && (
        <div style={{
          position: "absolute",
          right: 0,
          top: "100%",
          background: "white",
          border: "1px solid #ccc",
          width: "300px",
          maxHeight: "400px",
          overflowY: "auto",
          zIndex: 1000,
          color: "black"
        }}>
          <h4 style={{ padding: "10px", margin: 0, borderBottom: "1px solid #ccc" }}>
            Notifications
          </h4>

          {notifications.length === 0 ? (
            <p style={{ padding: "10px" }}>No new notifications</p>
          ) : (
            notifications.map(notif => (
              <div key={notif.id} style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
                <p style={{ margin: 0, fontSize: "14px" }}>{notif.message}</p>
                <small style={{ color: "#666" }}>
                  {notif.timestamp.toLocaleTimeString()}
                </small>
              </div>
            ))
          )}

          {notifications.length > 0 && (
            <button
              onClick={() => setNotifications([])}
              style={{ width: "100%", padding: "10px" }}
            >
              Clear All
            </button>
          )}
        </div>
      )}
    </div>
  );
}
