import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function MyJobs() {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyJobs();
  }, []);

  async function fetchMyJobs() {
    try {
      setLoading(true);
      const res = await api.get("/jobs");
      // Filter jobs posted by current recruiter
      const myJobs = res.data.filter(job => job.postedBy === user.id);
      setJobs(myJobs);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(jobId, newStatus) {
    try {
      await api.patch(`/jobs/${jobId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      alert(`Job status updated to ${newStatus}`);
      fetchMyJobs();
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update job status");
    }
  }

  function viewApplicants(jobId) {
    navigate(`/recruiter/applicants/${jobId}`);
  }

  if (loading) return <div>Loading your jobs...</div>;

  return (
    <div>
      <h2>My Posted Jobs</h2>

      {jobs.length === 0 ? (
        <p>You haven't posted any jobs yet.</p>
      ) : (
        <div>
          {jobs.map((job) => (
            <div key={job.id} style={{ border: "1px solid #ccc", padding: "15px", margin: "10px 0" }}>
              <h3>{job.title}</h3>
              <p><strong>Company:</strong> {job.company}</p>
              <p><strong>Location:</strong> {job.location || "Not specified"}</p>
              <p><strong>Skills:</strong> {job.skills || "Not specified"}</p>
              <p><strong>Description:</strong> {job.description}</p>
              <p><strong>Posted on:</strong> {new Date(job.createdAt).toLocaleDateString()}</p>
              <p><strong>Status:</strong> {job.status}</p>

              <div>
                <button onClick={() => viewApplicants(job.id)}>
                  View Applicants
                </button>

                {job.status === "open" && (
                  <>
                    <button onClick={() => handleStatusChange(job.id, "paused")}>
                      Pause
                    </button>
                    <button onClick={() => handleStatusChange(job.id, "closed")}>
                      Close
                    </button>
                  </>
                )}

                {job.status === "paused" && (
                  <button onClick={() => handleStatusChange(job.id, "open")}>
                    Reopen
                  </button>
                )}

                {job.status === "closed" && (
                  <button onClick={() => handleStatusChange(job.id, "open")}>
                    Reopen
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
