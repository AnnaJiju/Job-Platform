import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, Outlet, useNavigate } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";

export default function JobseekerDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  console.log("Dashboard - Current user:", user);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    return <div>Please login first. <Link to="/login">Go to Login</Link></div>;
  }

  if (user.role !== "jobseeker") {
    return <div>Access denied. Jobseekers only. Your role: {user.role}</div>;
  }

  return (
    <div>
      <header>
        <h1>Jobseeker Dashboard</h1>
        <p>Welcome, {user.name || user.email}</p>
        <button onClick={handleLogout}>Logout</button>
        <NotificationBell />
      </header>

      <nav>
        <ul>
          <li><Link to="/dashboard/profile">Profile</Link></li>
          <li><Link to="/dashboard/jobs">Job Listings</Link></li>
          <li><Link to="/dashboard/recommended">Recommended Jobs</Link></li>
          <li><Link to="/dashboard/saved">Saved Jobs</Link></li>
          <li><Link to="/dashboard/applications">My Applications</Link></li>
        </ul>
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
