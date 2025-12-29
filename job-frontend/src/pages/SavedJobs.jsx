import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";

export default function SavedJobs() {
  const { token } = useContext(AuthContext);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  async function fetchSavedJobs() {
    try {
      setLoading(true);
      const res = await api.get("/jobs/saved", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedJobs(res.data);
    } catch (err) {
      console.error("Error fetching saved jobs:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(jobId) {
    try {
      await api.delete(`/jobs/${jobId}/save`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Job removed from saved list!");
      fetchSavedJobs();
    } catch (err) {
      console.error("Error removing saved job:", err);
      alert("Failed to remove job");
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

  if (loading) return <div>Loading saved jobs...</div>;

  return (
    <div>
      <h2>Saved Jobs</h2>

      {savedJobs.length === 0 ? (
        <p>You haven't saved any jobs yet.</p>
      ) : (
        <div>
          {savedJobs.map((savedJob) => {
            const job = savedJob.job;
            return (
              <div key={savedJob.id} style={{ border: "1px solid #ccc", padding: "15px", margin: "10px 0" }}>
                <h3>{job.title}</h3>
                <p><strong>Company:</strong> {job.company}</p>
                <p><strong>Location:</strong> {job.location || "Not specified"}</p>
                <p><strong>Skills:</strong> {job.skills || "Not specified"}</p>
                <p><strong>Description:</strong> {job.description}</p>
                <p><strong>Saved on:</strong> {new Date(savedJob.savedAt).toLocaleDateString()}</p>
                <div>
                  <button onClick={() => handleApply(job.id)}>Apply</button>
                  <button onClick={() => handleRemove(job.id)}>Remove</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
