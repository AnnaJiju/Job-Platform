import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";

export default function Jobs() {
  const { token } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      setLoading(true);
      const res = await api.get("/jobs");
      setJobs(res.data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchJobs();
      return;
    }

    try {
      setLoading(true);
      const res = await api.get(`/jobs/search?keyword=${searchQuery}`);
      setJobs(res.data);
    } catch (err) {
      console.error("Error searching jobs:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleApply(jobId) {
    try {
      await api.post(`/applications/${jobId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Application submitted successfully!");
    } catch (err) {
      console.error("Error applying:", err);
      alert(err.response?.data?.message || "Failed to apply");
    }
  }

  async function handleSave(jobId) {
    try {
      await api.post(`/jobs/${jobId}/save`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Job saved successfully!");
    } catch (err) {
      console.error("Error saving job:", err);
      alert(err.response?.data?.message || "Failed to save job");
    }
  }

  if (loading) return <div>Loading jobs...</div>;

  return (
    <div>
      <h2>Job Listings</h2>

      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search jobs by title, skills, or company..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit">Search</button>
        <button type="button" onClick={fetchJobs}>Clear</button>
      </form>

      {jobs.length === 0 ? (
        <p>No jobs found</p>
      ) : (
        <div>
          {jobs.map((job) => (
            <div key={job.id} style={{ border: "1px solid #ccc", padding: "15px", margin: "10px 0" }}>
              <h3>{job.title}</h3>
              <p><strong>Company:</strong> {job.company}</p>
              <p><strong>Location:</strong> {job.location || "Not specified"}</p>
              <p><strong>Skills:</strong> {job.skills || "Not specified"}</p>
              <p><strong>Description:</strong> {job.description}</p>
              <p>
                <strong>Status:</strong> 
                <span style={{
                  marginLeft: "8px",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  background: job.status === "open" ? "#28a745" : job.status === "paused" ? "#ffc107" : "#dc3545",
                  color: "white",
                  fontSize: "12px"
                }}>
                  {job.status}
                </span>
              </p>
              <div>
                <button 
                  onClick={() => handleApply(job.id)}
                  disabled={job.status !== "open"}
                  style={{
                    opacity: job.status !== "open" ? 0.5 : 1,
                    cursor: job.status !== "open" ? "not-allowed" : "pointer"
                  }}
                >
                  {job.status === "open" ? "Apply" : "Not Accepting Applications"}
                </button>
                <button onClick={() => handleSave(job.id)}>Save</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
