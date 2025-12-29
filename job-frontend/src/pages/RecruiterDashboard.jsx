import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, Outlet, useNavigate } from "react-router-dom";
import RecruiterNotificationBell from "../components/RecruiterNotificationBell";

export default function RecruiterDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    return <div>Please login first. <Link to="/login">Go to Login</Link></div>;
  }

  if (user.role !== "recruiter") {
    return <div>Access denied. Recruiters only. Your role: {user.role}</div>;
  }

  return (
    <div>
      <header>
        <h1>Recruiter Dashboard</h1>
        <p>Welcome, {user.name || user.email}</p>
        <button onClick={handleLogout}>Logout</button>
        <RecruiterNotificationBell />
      </header>

      <nav>
        <ul>
          <li><Link to="/recruiter/post-job">Post Job</Link></li>
          <li><Link to="/recruiter/my-jobs">My Jobs</Link></li>
        </ul>
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
