import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";

export default function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    return (
      <div style={styles.errorContainer}>
        <p>Please login first.</p>
        <Link to="/login" style={styles.errorLink}>Go to Login</Link>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div style={styles.errorContainer}>
        <p>Access denied. Admins only. Your role: {user.role}</p>
      </div>
    );
  }

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: "/admin/analytics", label: "Analytics", icon: AnalyticsIcon },
    { path: "/admin/users", label: "Manage Users", icon: UsersIcon },
    { path: "/admin/jobs", label: "Manage Jobs", icon: JobsIcon },
  ];

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={{...styles.sidebar, width: sidebarOpen ? '260px' : '80px'}}>
        {/* Logo */}
        <div style={styles.logoContainer}>
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
            <path d="M8 32L20 8L32 32H8Z" fill="#3B82F6" opacity="0.3"/>
            <path d="M14 24L20 14L26 24H14Z" fill="#3B82F6"/>
          </svg>
          {sidebarOpen && <span style={styles.logoText}>StepUp</span>}
        </div>

        {/* Toggle Button */}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={styles.toggleButton}
        >
          {sidebarOpen ? '←' : '→'}
        </button>

        {/* Navigation Menu */}
        <nav style={styles.nav}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...styles.menuItem,
                ...(isActive(item.path) ? styles.menuItemActive : {})
              }}
            >
              <item.icon />
              {sidebarOpen && <span style={styles.menuLabel}>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User Info at Bottom */}
        <div style={styles.userInfo}>
          <div style={styles.userAvatar}>
            {(user.name || user.email).charAt(0).toUpperCase()}
          </div>
          {sidebarOpen && (
            <div style={styles.userDetails}>
              <p style={styles.userName}>{user.name || 'Admin'}</p>
              <p style={styles.userEmail}>{user.email}</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={styles.mainContainer}>
        {/* Top Navbar */}
        <header style={styles.navbar}>
          <div style={styles.navbarLeft}>
            <h2 style={styles.pageTitle}>
              {menuItems.find(item => isActive(item.path))?.label || 'Admin Dashboard'}
            </h2>
          </div>

          <div style={styles.navbarRight}>
            {/* Notification Bell */}
            <div style={styles.notificationWrapper}>
              <NotificationBell />
            </div>

            {/* Logout Button */}
            <button onClick={handleLogout} style={styles.logoutButton}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/>
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main style={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Icon Components
const AnalyticsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
  </svg>
);

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
  </svg>
);

const JobsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"/>
    <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z"/>
  </svg>
);

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    backgroundColor: '#f3f4f6',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  sidebar: {
    backgroundColor: 'white',
    borderRight: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    padding: '24px 20px',
    borderBottom: '1px solid #e5e7eb',
    gap: '12px',
  },
  logoText: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#3B82F6',
    whiteSpace: 'nowrap',
  },
  toggleButton: {
    position: 'absolute',
    top: '30px',
    right: '-12px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    border: '1px solid #e5e7eb',
    backgroundColor: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    color: '#6b7280',
    zIndex: 10,
  },
  nav: {
    flex: 1,
    padding: '20px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    textDecoration: 'none',
    color: '#6b7280',
    fontSize: '15px',
    transition: 'all 0.2s',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  menuItemActive: {
    backgroundColor: '#eff6ff',
    color: '#3B82F6',
    fontWeight: '500',
  },
  menuLabel: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    borderTop: '1px solid #e5e7eb',
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#3B82F6',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '600',
    flexShrink: 0,
  },
  userDetails: {
    flex: 1,
    overflow: 'hidden',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1f2937',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userEmail: {
    fontSize: '12px',
    color: '#6b7280',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  mainContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  navbar: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    padding: '20px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '72px',
    boxSizing: 'border-box',
  },
  navbarLeft: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0,
    lineHeight: '1',
  },
  navbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    height: '100%',
  },
  notificationWrapper: {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    height: '40px',
    boxSizing: 'border-box',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '32px',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f3f4f6',
    gap: '16px',
  },
  errorLink: {
    color: '#3B82F6',
    textDecoration: 'none',
    fontWeight: '500',
  },
};
