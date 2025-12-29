import { useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { io } from "socket.io-client";
import api from "../api/axios";

export default function NotificationBell() {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch persisted notifications from database
  async function fetchNotifications() {
    try {
      const res = await api.get("/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dbNotifications = res.data.map(notif => ({
        id: notif.id,
        type: notif.type,
        message: notif.message,
        timestamp: new Date(notif.createdAt),
        isRead: notif.isRead,
        ...notif.data
      }));
      setNotifications(dbNotifications);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  }

  useEffect(() => {
    if (!token || !user) return;

    // Fetch existing notifications
    fetchNotifications();

    const socket = io("http://localhost:3000", {
      auth: { token }
    });

    socket.on("connect", () => {
      console.log("✅ Connected to WebSocket");
      socket.emit("register", { userId: user.id, role: user.role });
    });

    socket.on("job:new", (data) => {
      console.log("📢 New job notification:", data);
      const notification = {
        id: Date.now(),
        type: "newJob",
        message: `New job posted: ${data.title} at ${data.company}`,
        timestamp: new Date()
      };
      setNotifications(prev => [notification, ...prev]);
    });

    socket.on("job:reopened", (data) => {
      console.log("📢 Job reopened notification:", data);
      const notification = {
        id: Date.now(),
        type: "jobReopened",
        message: `✨ ${data.matchScore}% Match! Job reopened: ${data.title} at ${data.company} is now accepting applications`,
        timestamp: new Date(),
        jobId: data.id,
        matchScore: data.matchScore
      };
      setNotifications(prev => [notification, ...prev]);
      // Refresh from database to get persistent notification
      fetchNotifications();
    });

    socket.on("job:recommended", (data) => {
      console.log("🔥 Recommended job notification:", data);
      const notification = {
        id: Date.now(),
        type: "recommendedJob",
        message: `✨ ${data.matchScore}% Match! New recommended job: ${data.title} at ${data.company}`,
        timestamp: new Date(),
        jobId: data.id,
        matchScore: data.matchScore
      };
      setNotifications(prev => [notification, ...prev]);
      // Refresh from database to get persistent notification
      fetchNotifications();
    });

    socket.on("app:status", (data) => {
      console.log("📢 Application update:", data);
      const statusMessage = data.status === "approved" 
        ? `🎉 Congratulations! Your application for "${data.jobTitle}" at ${data.company} has been approved`
        : data.status === "rejected"
        ? `❌ Your application for "${data.jobTitle}" at ${data.company} was rejected`
        : `Application for "${data.jobTitle}" status updated to: ${data.status}`;
      
      const notification = {
        id: Date.now(),
        type: "applicationUpdate",
        message: statusMessage,
        timestamp: new Date(),
        applicationId: data.appId,
        jobId: data.jobId
      };
      setNotifications(prev => [notification, ...prev]);
      // Refresh from database
      fetchNotifications();
    });

    return () => {
      socket.disconnect();
    };
  }, [token, user]);

  function handleNotificationClick(notification) {
    console.log("🔔 Notification clicked:", notification);
    setShowDropdown(false);
    navigate("/dashboard/applications");
  }

  return (
    <div style={{ position: "relative", display: "inline-block", marginLeft: "15px" }}>
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          padding: "8px 16px",
          cursor: "pointer",
          background: "#fff",
          border: "1px solid #ccc",
          borderRadius: "4px",
          fontSize: "16px"
        }}
      >
        🔔 {notifications.length > 0 && `(${notifications.length})`}
      </button>

      {showDropdown && (
        <div style={{
          position: "absolute",
          right: "auto",
          left: 0,
          top: "calc(100% + 5px)",
          background: "white",
          border: "1px solid #ccc",
          width: "400px",
          maxHeight: "500px",
          overflowY: "auto",
          zIndex: 1000,
          color: "black",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          borderRadius: "4px"
        }}>
          <h4 style={{ padding: "15px", margin: 0, borderBottom: "1px solid #ccc", background: "#f5f5f5" }}>
            Notifications
          </h4>

          {notifications.length === 0 ? (
            <p style={{ padding: "20px", textAlign: "center", color: "#666" }}>No new notifications</p>
          ) : (
            notifications.map(notif => (
              <div 
                key={notif.id} 
                onClick={() => handleNotificationClick(notif)}
                style={{ 
                  padding: "15px", 
                  borderBottom: "1px solid #eee",
                  cursor: "pointer",
                  transition: "background 0.2s",
                  background: "white"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#f9f9f9"}
                onMouseLeave={(e) => e.currentTarget.style.background = "white"}
              >
                <p style={{ margin: 0, fontSize: "15px", lineHeight: "1.5", pointerEvents: "none" }}>{notif.message}</p>
                <small style={{ color: "#666", fontSize: "12px", pointerEvents: "none" }}>
                  {notif.timestamp.toLocaleTimeString()}
                </small>
              </div>
            ))
          )}

          {notifications.length > 0 && (
            <button
              onClick={() => setNotifications([])}
              style={{ width: "100%", padding: "12px", background: "#f5f5f5", border: "none", cursor: "pointer" }}
            >
              Clear All
            </button>
          )}
        </div>
      )}
    </div>
  );
}
