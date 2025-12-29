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

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div style={styles.container}>
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        style={styles.bellButton}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
        </svg>
        {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
      </button>

      {showDropdown && (
        <div style={styles.dropdown}>
          <div style={styles.dropdownHeader}>
            <h4 style={styles.dropdownTitle}>Notifications</h4>
            {notifications.length > 0 && (
              <span style={styles.notificationCount}>{notifications.length}</span>
            )}
          </div>

          <div style={styles.notificationList}>
            {notifications.length === 0 ? (
              <div style={styles.emptyState}>
                <svg width="48" height="48" viewBox="0 0 20 20" fill="#9ca3af" opacity="0.5">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
                </svg>
                <p style={styles.emptyText}>No new notifications</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif.id} 
                  onClick={() => handleNotificationClick(notif)}
                  style={{
                    ...styles.notificationItem,
                    backgroundColor: notif.isRead ? 'white' : '#eff6ff'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notif.isRead ? 'white' : '#eff6ff'}
                >
                  <p style={styles.notificationMessage}>{notif.message}</p>
                  <small style={styles.notificationTime}>
                    {notif.timestamp.toLocaleTimeString()}
                  </small>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div style={styles.dropdownFooter}>
              <button
                onClick={() => setNotifications([])}
                style={styles.clearButton}
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    display: 'inline-block',
  },
  bellButton: {
    position: 'relative',
    padding: '10px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  badge: {
    position: 'absolute',
    top: '6px',
    right: '6px',
    backgroundColor: '#ef4444',
    color: 'white',
    borderRadius: '10px',
    padding: '2px 6px',
    fontSize: '11px',
    fontWeight: '600',
    minWidth: '18px',
    textAlign: 'center',
  },
  dropdown: {
    position: 'absolute',
    right: 0,
    top: 'calc(100% + 8px)',
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    width: '380px',
    maxHeight: '500px',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    overflow: 'hidden',
  },
  dropdownHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#fafafa',
  },
  dropdownTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
  },
  notificationCount: {
    backgroundColor: '#3B82F6',
    color: 'white',
    borderRadius: '12px',
    padding: '4px 10px',
    fontSize: '12px',
    fontWeight: '600',
  },
  notificationList: {
    maxHeight: '400px',
    overflowY: 'auto',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 20px',
    color: '#9ca3af',
  },
  emptyText: {
    margin: '12px 0 0 0',
    fontSize: '14px',
    color: '#6b7280',
  },
  notificationItem: {
    padding: '16px 20px',
    borderBottom: '1px solid #f3f4f6',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  notificationMessage: {
    margin: 0,
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#1f2937',
    pointerEvents: 'none',
  },
  notificationTime: {
    color: '#9ca3af',
    fontSize: '12px',
    pointerEvents: 'none',
    marginTop: '4px',
    display: 'block',
  },
  dropdownFooter: {
    borderTop: '1px solid #e5e7eb',
    padding: '12px',
  },
  clearButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
};
