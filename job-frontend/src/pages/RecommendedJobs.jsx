import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";

export default function RecommendedJobs() {
  const { token } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRecommendations();
  }, []);

  async function fetchRecommendations() {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/jobs/recommend", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(res.data);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setError(err.response?.data?.message || "Failed to fetch recommendations. Please create your profile first.");
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

  if (loading) return <div>Loading recommended jobs...</div>;

  if (error) return <div><p>{error}</p></div>;

  return (
    <div>
      <h2>Recommended Jobs for You</h2>

      {jobs.length === 0 ? (
        <p>No recommendations available. Complete your profile to get personalized job suggestions!</p>
      ) : (
        <div>
          <p>Showing {jobs.length} job(s) matching your skills</p>
          {jobs.map((job) => (
            <div key={job.id} style={{ border: "1px solid #ccc", padding: "15px", margin: "10px 0" }}>
              <h3>{job.title}</h3>
              {job.score && <p style={{ color: "green", fontWeight: "bold" }}>Match: {job.score}%</p>}
              <p><strong>Company:</strong> {job.company}</p>
              <p><strong>Location:</strong> {job.location || "Not specified"}</p>
              <p><strong>Skills:</strong> {job.skills || "Not specified"}</p>
              <p><strong>Description:</strong> {job.description}</p>
              <div>
                <button onClick={() => handleApply(job.id)}>Apply</button>
                <button onClick={() => handleSave(job.id)}>Save</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
