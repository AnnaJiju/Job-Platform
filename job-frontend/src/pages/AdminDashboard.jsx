import { Outlet, Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function AdminDashboard() {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user?.email} (Admin)</p>
      <button onClick={handleLogout}>Logout</button>

      <nav style={{ margin: "20px 0" }}>
        <Link to="/admin/analytics" style={{ marginRight: "15px" }}>Analytics</Link>
        <Link to="/admin/users" style={{ marginRight: "15px" }}>Manage Users</Link>
        <Link to="/admin/jobs" style={{ marginRight: "15px" }}>Manage Jobs</Link>
      </nav>

      <hr />
      <Outlet />
    </div>
  );
}
