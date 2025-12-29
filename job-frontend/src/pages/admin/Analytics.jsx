import { useState, useEffect } from "react";
import axios from "axios";

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    fetchAnalytics();
    
    // Auto-refresh every 30 seconds if enabled
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchAnalytics, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

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

  // Check if trends data exists
  const hasTrends = analytics.trends && analytics.trends.monthly && analytics.trends.monthly.length > 0;
  const maxTrendValue = hasTrends 
    ? Math.max(...analytics.trends.monthly.map(m => Math.max(m.users, m.jobs, m.applications)))
    : 0;

  return (
    <div style={{ padding: "20px" }}>
      {/* Header with Auto-refresh Toggle */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>📊 Analytics Dashboard</h2>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh (30s)
          </label>
          <button
            onClick={fetchAnalytics}
            style={{
              padding: "8px 16px",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "30px" }}>
        <MetricCard
          title="Total Users"
          value={analytics.users.total}
          subtitle={`${analytics.users.active} active`}
          trend={`+${analytics.recent?.last7Days?.newUsers || 0} this week`}
          icon="👥"
          color="#4CAF50"
        />
        <MetricCard
          title="Total Jobs"
          value={analytics.jobs.total}
          subtitle={`${analytics.jobs.open} open`}
          trend={`+${analytics.recent?.last7Days?.newJobs || 0} this week`}
          icon="💼"
          color="#2196F3"
        />
        <MetricCard
          title="Total Applications"
          value={analytics.applications.total}
          subtitle={`${analytics.applications.pending} pending`}
          trend={`+${analytics.recent?.last7Days?.newApplications || 0} this week`}
          icon="📝"
          color="#FF9800"
        />
        <MetricCard
          title="Acceptance Rate"
          value={`${analytics.engagement?.acceptanceRate || 0}%`}
          subtitle={`${analytics.applications.approved} approved`}
          trend={`Avg ${analytics.engagement?.avgApplicationsPerJob || 0} apps/job`}
          icon="✅"
          color="#9C27B0"
        />
      </div>

      {/* User Breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "30px" }}>
        {/* Users by Role */}
        <div style={{ border: "1px solid #e0e0e0", padding: "20px", borderRadius: "8px", background: "white" }}>
          <h3 style={{ marginTop: 0 }}>👥 Users by Role</h3>
          <div style={{ marginTop: "15px" }}>
            <ProgressBar
              label="Jobseekers"
              value={analytics.users?.byRole?.jobseekers || 0}
              total={(analytics.users?.byRole?.jobseekers || 0) + (analytics.users?.byRole?.recruiters || 0)}
              color="#4CAF50"
            />
            <ProgressBar
              label="Recruiters"
              value={analytics.users?.byRole?.recruiters || 0}
              total={(analytics.users?.byRole?.jobseekers || 0) + (analytics.users?.byRole?.recruiters || 0)}
              color="#2196F3"
            />
          </div>
        </div>

        {/* Jobs Status */}
        <div style={{ border: "1px solid #e0e0e0", padding: "20px", borderRadius: "8px", background: "white" }}>
          <h3 style={{ marginTop: 0 }}>💼 Jobs by Status</h3>
          <div style={{ marginTop: "15px" }}>
            <ProgressBar
              label="Open"
              value={analytics.jobs.open}
              total={analytics.jobs.total}
              color="#4CAF50"
            />
            <ProgressBar
              label="Paused"
              value={analytics.jobs.paused}
              total={analytics.jobs.total}
              color="#FF9800"
            />
            <ProgressBar
              label="Closed"
              value={analytics.jobs.closed}
              total={analytics.jobs.total}
              color="#f44336"
            />
          </div>
        </div>

        {/* Applications Status */}
        <div style={{ border: "1px solid #e0e0e0", padding: "20px", borderRadius: "8px", background: "white" }}>
          <h3 style={{ marginTop: 0 }}>📝 Applications Status</h3>
          <div style={{ marginTop: "15px" }}>
            <ProgressBar
              label="Pending"
              value={analytics.applications.pending}
              total={analytics.applications.total}
              color="#FF9800"
            />
            <ProgressBar
              label="Approved"
              value={analytics.applications.approved}
              total={analytics.applications.total}
              color="#4CAF50"
            />
            <ProgressBar
              label="Rejected"
              value={analytics.applications.rejected}
              total={analytics.applications.total}
              color="#f44336"
            />
          </div>
        </div>
      </div>

      {/* Growth Trends Chart */}
      {hasTrends && (
        <div style={{ border: "1px solid #e0e0e0", padding: "20px", borderRadius: "8px", background: "white", marginBottom: "30px" }}>
          <h3 style={{ marginTop: 0 }}>📈 12-Month Growth Trends</h3>
          <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div style={{ width: "20px", height: "3px", background: "#4CAF50" }}></div>
              <span style={{ fontSize: "12px" }}>Users</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div style={{ width: "20px", height: "3px", background: "#2196F3" }}></div>
              <span style={{ fontSize: "12px" }}>Jobs</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div style={{ width: "20px", height: "3px", background: "#FF9800" }}></div>
              <span style={{ fontSize: "12px" }}>Applications</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "5px", height: "200px" }}>
            {analytics.trends.monthly.map((month, idx) => (
              <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px", alignItems: "center" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: "2px", width: "100%" }}>
                  <div
                    style={{
                      height: `${(month.applications / maxTrendValue) * 100}%`,
                      background: "#FF9800",
                      borderRadius: "3px 3px 0 0",
                      minHeight: month.applications > 0 ? "3px" : "0"
                    }}
                    title={`Applications: ${month.applications}`}
                  ></div>
                  <div
                    style={{
                      height: `${(month.jobs / maxTrendValue) * 100}%`,
                      background: "#2196F3",
                      minHeight: month.jobs > 0 ? "3px" : "0"
                    }}
                    title={`Jobs: ${month.jobs}`}
                  ></div>
                  <div
                    style={{
                      height: `${(month.users / maxTrendValue) * 100}%`,
                      background: "#4CAF50",
                      minHeight: month.users > 0 ? "3px" : "0"
                    }}
                    title={`Users: ${month.users}`}
                  ></div>
                </div>
                <span style={{ fontSize: "10px", color: "#666", writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                  {month.month}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Section: Top Categories and Recruiters */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Top Job Categories */}
        <div style={{ border: "1px solid #e0e0e0", padding: "20px", borderRadius: "8px", background: "white" }}>
          <h3 style={{ marginTop: 0 }}>🏆 Top Job Categories</h3>
          {analytics.trends?.topCategories && analytics.trends.topCategories.length > 0 ? (
            <div style={{ marginTop: "15px" }}>
              {analytics.trends.topCategories.map((cat, idx) => (
                <div key={idx} style={{ marginBottom: "15px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <span style={{ fontSize: "14px", textTransform: "capitalize" }}>
                      {cat.category || "Not specified"}
                    </span>
                    <span style={{ fontSize: "14px", fontWeight: "bold", color: "#2196F3" }}>
                      {cat.count} apps
                    </span>
                  </div>
                  <div style={{ height: "8px", background: "#e0e0e0", borderRadius: "4px", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        background: "#2196F3",
                        width: `${(cat.count / analytics.trends.topCategories[0].count) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#999" }}>No data available</p>
          )}
        </div>

        {/* Top Recruiters */}
        <div style={{ border: "1px solid #e0e0e0", padding: "20px", borderRadius: "8px", background: "white" }}>
          <h3 style={{ marginTop: 0 }}>🌟 Most Active Recruiters</h3>
          {analytics.trends?.topRecruiters && analytics.trends.topRecruiters.length > 0 ? (
            <div style={{ marginTop: "15px" }}>
              {analytics.trends.topRecruiters.map((rec, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px",
                    background: idx % 2 === 0 ? "#f9f9f9" : "white",
                    borderRadius: "4px",
                    marginBottom: "5px"
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "500", fontSize: "14px" }}>
                      {rec.recruiterName || "Unknown"}
                    </div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      {rec.recruiterEmail}
                    </div>
                  </div>
                  <div style={{
                    background: "#4CAF50",
                    color: "white",
                    padding: "5px 10px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center"
                  }}>
                    {rec.jobCount} jobs
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#999" }}>No data available</p>
          )}
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div style={{ marginTop: "30px", border: "1px solid #e0e0e0", padding: "20px", borderRadius: "8px", background: "#f0f7ff" }}>
        <h3 style={{ marginTop: 0 }}>📅 Recent Activity</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div>
            <h4 style={{ marginTop: 0, color: "#2196F3" }}>Last 7 Days</h4>
            <p>👥 New Users: <strong>{analytics.recent?.last7Days?.newUsers || 0}</strong></p>
            <p>💼 New Jobs: <strong>{analytics.recent?.last7Days?.newJobs || 0}</strong></p>
            <p>📝 New Applications: <strong>{analytics.recent?.last7Days?.newApplications || 0}</strong></p>
          </div>
          <div>
            <h4 style={{ marginTop: 0, color: "#4CAF50" }}>Last 30 Days</h4>
            <p>👥 New Users: <strong>{analytics.recent?.last30Days?.newUsers || 0}</strong></p>
            <p>💼 New Jobs: <strong>{analytics.recent?.last30Days?.newJobs || 0}</strong></p>
            <p>📝 New Applications: <strong>{analytics.recent?.last30Days?.newApplications || 0}</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Components
function MetricCard({ title, value, subtitle, trend, icon, color }) {
  return (
    <div style={{
      border: "1px solid #e0e0e0",
      padding: "20px",
      borderRadius: "8px",
      background: "white",
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>{title}</div>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: color }}>{value}</div>
          <div style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>{subtitle}</div>
        </div>
        <div style={{ fontSize: "32px" }}>{icon}</div>
      </div>
      <div style={{
        marginTop: "10px",
        padding: "5px 10px",
        background: "#f0f7ff",
        borderRadius: "4px",
        fontSize: "11px",
        color: "#2196F3"
      }}>
        {trend}
      </div>
    </div>
  );
}

function ProgressBar({ label, value, total, color }) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  
  return (
    <div style={{ marginBottom: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", fontSize: "13px" }}>
        <span>{label}</span>
        <span style={{ fontWeight: "bold" }}>{value} ({percentage}%)</span>
      </div>
      <div style={{ height: "8px", background: "#e0e0e0", borderRadius: "4px", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            background: color,
            width: `${percentage}%`,
            transition: "width 0.3s ease"
          }}
        ></div>
      </div>
    </div>
  );
}
