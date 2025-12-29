import { useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { io } from "socket.io-client";
import api from "../api/axios";

export default function RecruiterNotificationBell() {
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
      console.log("✅ Recruiter Connected to WebSocket");
      socket.emit("register", { userId: user.id, role: user.role });
    });

    socket.on("job:status", (data) => {
      console.log("📢 Job status update:", data);
      const statusMessage = data.newStatus === "open" 
        ? `✅ Your job "${data.jobTitle}" has been approved and is now live`
        : data.newStatus === "paused"
        ? `⏸️ Your job "${data.jobTitle}" has been paused by admin`
        : `🔴 Your job "${data.jobTitle}" has been closed`;
      
      const notification = {
        id: Date.now(),
        type: "jobStatus",
        message: statusMessage,
        timestamp: new Date(),
        jobId: data.jobId,
        status: data.newStatus
      };
      setNotifications(prev => [notification, ...prev]);
      // Refresh from database
      fetchNotifications();
    });

    socket.on("app:new", (data) => {
      console.log("📢 New application:", data);
      const notification = {
        id: Date.now(),
        type: "newApplication",
        message: `New application received for your job`,
        timestamp: new Date(),
        applicationId: data.id
      };
      setNotifications(prev => [notification, ...prev]);
      // Refresh from database
      fetchNotifications();
    });

    socket.on("job:deleted", (data) => {
      console.log("🗑️ Job deleted notification:", data);
      const notification = {
        id: Date.now(),
        type: "jobDeleted",
        message: `🗑️ Admin removed your job: "${data.jobTitle}"`,
        timestamp: new Date(),
        jobId: data.jobId
      };
      setNotifications(prev => [notification, ...prev]);
      // Refresh from database
      fetchNotifications();
    });

    socket.on("account:banned", (data) => {
      console.log("🚫 Account banned notification:", data);
      const notification = {
        id: Date.now(),
        type: "accountBanned",
        message: data.message,
        timestamp: new Date()
      };
      setNotifications(prev => [notification, ...prev]);
      // Refresh from database
      fetchNotifications();
    });

    socket.on("account:unbanned", (data) => {
      console.log("✅ Account unbanned notification:", data);
      const notification = {
        id: Date.now(),
        type: "accountUnbanned",
        message: data.message,
        timestamp: new Date()
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
    if (notification.type === "jobStatus" || notification.type === "newApplication") {
      navigate("/recruiter/my-jobs");
    }
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
