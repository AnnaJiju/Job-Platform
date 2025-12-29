import { useState, useEffect } from "react";
import axios from "axios";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, admin, recruiter, jobseeker
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:3000/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
      alert("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  async function updateUserStatus(userId, newStatus) {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:3000/admin/users/${userId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`User status updated to ${newStatus}`);
      fetchUsers(); // Refresh list
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Failed to update user status");
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === "all" || user.role === filter;
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getRoleIcon = (role) => {
    switch(role) {
      case 'admin': return '👑';
      case 'recruiter': return '💼';
      case 'jobseeker': return '👤';
      default: return '👤';
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading users...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.iconCircle}>
            <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor" style={{color: '#3B82F6'}}>
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
            </svg>
          </div>
          <div>
            <h2 style={styles.pageTitle}>Manage Users</h2>
            <p style={styles.pageSubtitle}>{filteredUsers.length} users found</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div style={styles.filterSection}>
        <div style={styles.searchBox}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" style={{color: '#9ca3af'}}>
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
          </svg>
          <input
            type="text"
            placeholder="Search users by email or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <div style={styles.filterButtons}>
          {['all', 'admin', 'recruiter', 'jobseeker'].map(role => (
            <button
              key={role}
              onClick={() => setFilter(role)}
              style={{
                ...styles.filterButton,
                ...(filter === role ? styles.filterButtonActive : {})
              }}
            >
              {role === 'all' ? 'All Users' : role.charAt(0).toUpperCase() + role.slice(1) + 's'}
            </button>
          ))}
        </div>
      </div>

      {/* Users Grid */}
      <div style={styles.usersGrid}>
        {filteredUsers.map(user => (
          <div key={user.id} style={styles.userCard}>
            <div style={styles.userCardHeader}>
              <div style={styles.userAvatar}>
                {getRoleIcon(user.role)}
              </div>
              <div style={styles.userInfo}>
                <h3 style={styles.userEmail}>{user.email}</h3>
                {user.name && <p style={styles.userName}>{user.name}</p>}
              </div>
            </div>

            <div style={styles.userDetails}>
              <div style={styles.userDetailRow}>
                <span style={styles.detailLabel}>ID</span>
                <span style={styles.detailValue}>#{user.id}</span>
              </div>
              <div style={styles.userDetailRow}>
                <span style={styles.detailLabel}>Role</span>
                <span style={{
                  ...styles.badge,
                  backgroundColor: user.role === "admin" ? "#FEF3C7" : user.role === "recruiter" ? "#DBEAFE" : "#D1FAE5",
                  color: user.role === "admin" ? "#92400E" : user.role === "recruiter" ? "#1E40AF" : "#065F46"
                }}>
                  {user.role}
                </span>
              </div>
              <div style={styles.userDetailRow}>
                <span style={styles.detailLabel}>Status</span>
                <span style={{
                  ...styles.badge,
                  backgroundColor: user.status === "active" ? "#D1FAE5" : "#FEE2E2",
                  color: user.status === "active" ? "#065F46" : "#991B1B"
                }}>
                  {user.status}
                </span>
              </div>
              <div style={styles.userDetailRow}>
                <span style={styles.detailLabel}>Joined</span>
                <span style={styles.detailValue}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div style={styles.userActions}>
              {user.role !== "admin" && (
                <>
                  {user.status === "active" ? (
                    <button
                      onClick={() => updateUserStatus(user.id, "suspended")}
                      style={styles.banButton}
                    >
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd"/>
                      </svg>
                      Suspend User
                    </button>
                  ) : (
                    <button
                      onClick={() => updateUserStatus(user.id, "active")}
                      style={styles.approveButton}
                    >
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      Activate User
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div style={styles.emptyState}>
          <svg width="64" height="64" viewBox="0 0 20 20" fill="currentColor" style={{color: '#d1d5db', marginBottom: '16px'}}>
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
          </svg>
          <p style={styles.emptyText}>No users found matching your criteria</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: '16px',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #3B82F6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: '#6b7280',
    fontSize: '16px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  iconCircle: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    backgroundColor: '#EFF6FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0,
  },
  pageSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '4px 0 0 0',
  },
  filterSection: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  searchBox: {
    flex: 1,
    minWidth: '300px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    color: '#1f2937',
  },
  filterButtons: {
    display: 'flex',
    gap: '8px',
  },
  filterButton: {
    padding: '10px 16px',
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6b7280',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
    color: 'white',
    borderColor: '#3B82F6',
  },
  usersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
  userCard: {
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px',
    transition: 'all 0.2s',
  },
  userCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: '1px solid #f3f4f6',
  },
  userAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    backgroundColor: '#EFF6FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
  },
  userInfo: {
    flex: 1,
  },
  userEmail: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0,
    wordBreak: 'break-word',
  },
  userName: {
    fontSize: '13px',
    color: '#6b7280',
    margin: '2px 0 0 0',
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '16px',
  },
  userDetailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: '13px',
    color: '#6b7280',
  },
  detailValue: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#1f2937',
  },
  badge: {
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  userActions: {
    display: 'flex',
    gap: '8px',
  },
  banButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px',
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  approveButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px',
    backgroundColor: '#D1FAE5',
    color: '#059669',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '64px 32px',
    textAlign: 'center',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: '16px',
  },
};
