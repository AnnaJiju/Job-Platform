import { useState, useEffect } from "react";
import axios from "axios";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p>Loading users...</p>;

  return (
    <div>
      <h2>Manage Users</h2>
      <p>Total Users: {users.length}</p>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr style={{ background: "#f0f0f0", textAlign: "left" }}>
            <th style={{ padding: "10px", border: "1px solid #ccc" }}>ID</th>
            <th style={{ padding: "10px", border: "1px solid #ccc" }}>Email</th>
            <th style={{ padding: "10px", border: "1px solid #ccc" }}>Role</th>
            <th style={{ padding: "10px", border: "1px solid #ccc" }}>Status</th>
            <th style={{ padding: "10px", border: "1px solid #ccc" }}>Created</th>
            <th style={{ padding: "10px", border: "1px solid #ccc" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>{user.id}</td>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>{user.email}</td>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                <span style={{
                  padding: "4px 8px",
                  borderRadius: "4px",
                  background: user.role === "admin" ? "#ffc107" : user.role === "recruiter" ? "#17a2b8" : "#28a745",
                  color: "white",
                  fontSize: "12px"
                }}>
                  {user.role}
                </span>
              </td>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                <span style={{
                  padding: "4px 8px",
                  borderRadius: "4px",
                  background: user.status === "active" ? "#28a745" : "#dc3545",
                  color: "white",
                  fontSize: "12px"
                }}>
                  {user.status}
                </span>
              </td>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                {user.status === "active" ? (
                  <button
                    onClick={() => updateUserStatus(user.id, "suspended")}
                    style={{
                      padding: "6px 12px",
                      background: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    Ban User
                  </button>
                ) : (
                  <button
                    onClick={() => updateUserStatus(user.id, "active")}
                    style={{
                      padding: "6px 12px",
                      background: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    Approve User
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
