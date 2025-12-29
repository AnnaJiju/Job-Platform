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

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading analytics...</p>
      </div>
    );
  }
  
  if (!analytics) {
    return (
      <div style={styles.emptyState}>
        <p>No data available</p>
      </div>
    );
  }

  // Check if trends data exists
  const hasTrends = analytics.trends && analytics.trends.monthly && analytics.trends.monthly.length > 0;
  const maxTrendValue = hasTrends 
    ? Math.max(...analytics.trends.monthly.map(m => Math.max(m.users, m.jobs, m.applications)))
    : 0;

  return (
    <div>
      {/* Header with Auto-refresh Toggle */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.iconCircle}>
            <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor" style={{color: '#3B82F6'}}>
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
            </svg>
          </div>
          <div>
            <h2 style={styles.pageTitle}>Analytics Dashboard</h2>
            <p style={styles.pageSubtitle}>Monitor your platform performance</p>
          </div>
        </div>
        <div style={styles.headerActions}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              style={styles.checkbox}
            />
            <span>Auto-refresh (30s)</span>
          </label>
          <button onClick={fetchAnalytics} style={styles.refreshButton}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div style={styles.metricsGrid}>
        <MetricCard
          title="Total Users"
          value={analytics.users.total}
          subtitle={`${analytics.users.active} active`}
          trend={`+${analytics.recent?.last7Days?.newUsers || 0} this week`}
          icon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
            </svg>
          }
          color="#10B981"
        />
        <MetricCard
          title="Total Jobs"
          value={analytics.jobs.total}
          subtitle={`${analytics.jobs.open} open`}
          trend={`+${analytics.recent?.last7Days?.newJobs || 0} this week`}
          icon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"/>
              <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z"/>
            </svg>
          }
          color="#3B82F6"
        />
        <MetricCard
          title="Total Applications"
          value={analytics.applications.total}
          subtitle={`${analytics.applications.pending} pending`}
          trend={`+${analytics.recent?.last7Days?.newApplications || 0} this week`}
          icon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
            </svg>
          }
          color="#F59E0B"
        />
        <MetricCard
          title="Acceptance Rate"
          value={`${analytics.engagement?.acceptanceRate || 0}%`}
          subtitle={`${analytics.applications.approved} approved`}
          trend={`Avg ${analytics.engagement?.avgApplicationsPerJob || 0} apps/job`}
          icon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
          }
          color="#8B5CF6"
        />
      </div>

      {/* User Breakdown */}
      <div style={styles.breakdownGrid}>
        {/* Users by Role */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" style={{color: '#10B981'}}>
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
            </svg>
            Users by Role
          </h3>
          <div style={styles.progressSection}>
            <ProgressBar
              label="Jobseekers"
              value={analytics.users?.byRole?.jobseekers || 0}
              total={(analytics.users?.byRole?.jobseekers || 0) + (analytics.users?.byRole?.recruiters || 0)}
              color="#10B981"
            />
            <ProgressBar
              label="Recruiters"
              value={analytics.users?.byRole?.recruiters || 0}
              total={(analytics.users?.byRole?.jobseekers || 0) + (analytics.users?.byRole?.recruiters || 0)}
              color="#3B82F6"
            />
          </div>
        </div>

        {/* Jobs Status */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" style={{color: '#3B82F6'}}>
              <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"/>
              <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z"/>
            </svg>
            Jobs by Status
          </h3>
          <div style={styles.progressSection}>
            <ProgressBar
              label="Open"
              value={analytics.jobs.open}
              total={analytics.jobs.total}
              color="#10B981"
            />
            <ProgressBar
              label="Paused"
              value={analytics.jobs.paused}
              total={analytics.jobs.total}
              color="#F59E0B"
            />
            <ProgressBar
              label="Closed"
              value={analytics.jobs.closed}
              total={analytics.jobs.total}
              color="#EF4444"
            />
          </div>
        </div>

        {/* Applications Status */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" style={{color: '#F59E0B'}}>
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
            </svg>
            Applications Status
          </h3>
          <div style={styles.progressSection}>
            <ProgressBar
              label="Pending"
              value={analytics.applications.pending}
              total={analytics.applications.total}
              color="#F59E0B"
            />
            <ProgressBar
              label="Approved"
              value={analytics.applications.approved}
              total={analytics.applications.total}
              color="#10B981"
            />
            <ProgressBar
              label="Rejected"
              value={analytics.applications.rejected}
              total={analytics.applications.total}
              color="#EF4444"
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
    <div style={styles.metricCard}>
      <div style={styles.metricHeader}>
        <div>
          <div style={styles.metricTitle}>{title}</div>
          <div style={{...styles.metricValue, color}}>{value}</div>
          <div style={styles.metricSubtitle}>{subtitle}</div>
        </div>
        <div style={{...styles.metricIcon, backgroundColor: `${color}15`, color}}>
          {icon}
        </div>
      </div>
      <div style={styles.metricTrend}>
        {trend}
      </div>
    </div>
  );
}

function ProgressBar({ label, value, total, color }) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  
  return (
    <div style={styles.progressBarContainer}>
      <div style={styles.progressBarHeader}>
        <span style={styles.progressBarLabel}>{label}</span>
        <span style={styles.progressBarValue}>{value} ({percentage}%)</span>
      </div>
      <div style={styles.progressBarTrack}>
        <div style={{...styles.progressBarFill, backgroundColor: color, width: `${percentage}%`}} />
      </div>
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
  emptyState: {
    textAlign: 'center',
    padding: '48px',
    color: '#9ca3af',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px',
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
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#4b5563',
    cursor: 'pointer',
  },
  checkbox: {
    cursor: 'pointer',
  },
  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#3B82F6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },
  metricCard: {
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '24px',
    transition: 'all 0.2s',
  },
  metricHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },
  metricTitle: {
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '8px',
    fontWeight: '500',
  },
  metricValue: {
    fontSize: '32px',
    fontWeight: '700',
    marginBottom: '4px',
    lineHeight: '1',
  },
  metricSubtitle: {
    fontSize: '13px',
    color: '#9ca3af',
  },
  metricIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricTrend: {
    padding: '8px 12px',
    backgroundColor: '#EFF6FF',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#3B82F6',
    fontWeight: '500',
  },
  breakdownGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },
  card: {
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '24px',
  },
  cardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 20px 0',
  },
  progressSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  progressBarContainer: {
    marginBottom: '4px',
  },
  progressBarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '14px',
  },
  progressBarLabel: {
    color: '#4b5563',
  },
  progressBarValue: {
    fontWeight: '600',
    color: '#1f2937',
  },
  progressBarTrack: {
    height: '8px',
    backgroundColor: '#f3f4f6',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    transition: 'width 0.3s ease',
    borderRadius: '4px',
  },
};
