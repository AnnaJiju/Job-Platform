import { useState, useEffect } from "react";
import axios from "axios";

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:3000/admin/analytics", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(res.data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      alert("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p>Loading analytics...</p>;
  if (!analytics) return <p>No data available</p>;

  return (
    <div>
      <h2>Analytics Overview</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginTop: "20px" }}>
        {/* Users Section */}
        <div style={{ border: "1px solid #ccc", padding: "20px", borderRadius: "8px", background: "#f9f9f9" }}>
          <h3>Users</h3>
          <p><strong>Total:</strong> {analytics.users.total}</p>
          <p><strong>Active:</strong> {analytics.users.active}</p>
          <p><strong>Suspended:</strong> {analytics.users.suspended}</p>
          <p style={{ color: "green", marginTop: "10px" }}>
            📈 New (7 days): {analytics.recent.newUsers7d}
          </p>
        </div>

        {/* Jobs Section */}
        <div style={{ border: "1px solid #ccc", padding: "20px", borderRadius: "8px", background: "#f9f9f9" }}>
          <h3>Jobs</h3>
          <p><strong>Total:</strong> {analytics.jobs.total}</p>
          <p><strong>Open:</strong> {analytics.jobs.open}</p>
          <p><strong>Closed:</strong> {analytics.jobs.closed}</p>
          <p><strong>Paused:</strong> {analytics.jobs.paused}</p>
          <p style={{ color: "green", marginTop: "10px" }}>
            📈 New (7 days): {analytics.recent.newJobs7d}
          </p>
        </div>

        {/* Applications Section */}
        <div style={{ border: "1px solid #ccc", padding: "20px", borderRadius: "8px", background: "#f9f9f9" }}>
          <h3>Applications</h3>
          <p><strong>Total:</strong> {analytics.applications.total}</p>
          <p><strong>Pending:</strong> {analytics.applications.pending}</p>
          <p><strong>Approved:</strong> {analytics.applications.approved}</p>
          <p><strong>Rejected:</strong> {analytics.applications.rejected}</p>
          <p style={{ color: "green", marginTop: "10px" }}>
            📈 New (7 days): {analytics.recent.newApplications7d}
          </p>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div style={{ marginTop: "30px", border: "1px solid #ccc", padding: "20px", borderRadius: "8px", background: "#fff3cd" }}>
        <h3>Engagement Metrics</h3>
        <p><strong>Average Applications per Job:</strong> {analytics.engagement.avgApplicationsPerJob}</p>
        <p><strong>Jobs with Applications:</strong> {analytics.engagement.jobsWithApplicationsPercent}%</p>
      </div>
    </div>
  );
}
