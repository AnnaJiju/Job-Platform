import { useState, useEffect } from "react";
import axios from "axios";

export default function ManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:3000/admin/jobs", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(res.data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      alert("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }

  async function updateJobStatus(jobId, newStatus) {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:3000/admin/jobs/${jobId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Job status updated to ${newStatus}`);
      fetchJobs(); // Refresh list
    } catch (err) {
      console.error("Error updating job:", err);
      alert("Failed to update job status");
    }
  }

  async function deleteJob(jobId, jobTitle) {
    const confirmed = window.confirm(`Are you sure you want to permanently delete the job "${jobTitle}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:3000/admin/jobs/${jobId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Job deleted successfully. Recruiter has been notified.");
      fetchJobs(); // Refresh list
    } catch (err) {
      console.error("Error deleting job:", err);
      alert("Failed to delete job");
    }
  }

  if (loading) return <p>Loading jobs...</p>;

  return (
    <div>
      <h2>Manage Jobs</h2>
      <p>Total Jobs: {jobs.length}</p>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr style={{ background: "#f0f0f0", textAlign: "left" }}>
            <th style={{ padding: "10px", border: "1px solid #ccc" }}>ID</th>
            <th style={{ padding: "10px", border: "1px solid #ccc" }}>Title</th>
            <th style={{ padding: "10px", border: "1px solid #ccc" }}>Company</th>
            <th style={{ padding: "10px", border: "1px solid #ccc" }}>Location</th>
            <th style={{ padding: "10px", border: "1px solid #ccc" }}>Salary</th>
            <th style={{ padding: "10px", border: "1px solid #ccc" }}>Exp</th>
            <th style={{ padding: "10px", border: "1px solid #ccc" }}>Type</th>
            <th style={{ padding: "10px", border: "1px solid #ccc" }}>Status</th>
            <th style={{ padding: "10px", border: "1px solid #ccc" }}>Posted</th>
            <th style={{ padding: "10px", border: "1px solid #ccc" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map(job => (
            <tr key={job.id}>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>{job.id}</td>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>{job.title}</td>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>{job.company}</td>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>{job.location}</td>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                {job.salaryMin && job.salaryMax 
                  ? `$${(job.salaryMin/1000).toFixed(0)}k-${(job.salaryMax/1000).toFixed(0)}k`
                  : "N/A"}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                {job.experienceRequired !== null && job.experienceRequired !== undefined 
                  ? `${job.experienceRequired}y` 
                  : "N/A"}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                <span style={{
                  padding: "3px 6px",
                  borderRadius: "3px",
                  background: "#e3f2fd",
                  color: "#1976d2",
                  fontSize: "11px",
                  textTransform: "capitalize"
                }}>
                  {job.jobType || "N/A"}
                </span>
              </td>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                <span style={{
                  padding: "4px 8px",
                  borderRadius: "4px",
                  background: job.status === "open" ? "#28a745" : job.status === "closed" ? "#dc3545" : "#ffc107",
                  color: "white",
                  fontSize: "12px"
                }}>
                  {job.status}
                </span>
              </td>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                {new Date(job.createdAt).toLocaleDateString()}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                <div style={{ display: "flex", gap: "5px" }}>
                  {job.status !== "open" && (
                    <button
                      onClick={() => updateJobStatus(job.id, "open")}
                      style={{
                        padding: "6px 12px",
                        background: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px"
                      }}
                    >
                      Approve
                    </button>
                  )}
                  {job.status !== "paused" && (
                    <button
                      onClick={() => updateJobStatus(job.id, "paused")}
                      style={{
                        padding: "6px 12px",
                        background: "#ffc107",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px"
                      }}
                    >
                      Pause
                    </button>
                  )}
                  <button
                    onClick={() => deleteJob(job.id, job.title)}
                    style={{
                      padding: "6px 12px",
                      background: "#6c757d",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px"
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
