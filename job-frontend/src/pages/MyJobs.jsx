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

  function viewMatchedCandidates(jobId) {
    navigate(`/recruiter/matched-candidates/${jobId}`);
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
            <div key={job.id} style={{ border: "1px solid #ccc", padding: "15px", margin: "10px 0", borderRadius: "8px" }}>
              <h3>{job.title}</h3>
              <p><strong>Company:</strong> {job.company}</p>
              <p><strong>Location:</strong> {job.location || "Not specified"}</p>
              
              <div style={{ display: "flex", gap: "20px", margin: "10px 0", flexWrap: "wrap" }}>
                {job.salaryMin && job.salaryMax && (
                  <p style={{ margin: 0 }}>
                    <strong>💰 Salary:</strong> ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
                  </p>
                )}
                {job.experienceRequired !== null && job.experienceRequired !== undefined && (
                  <p style={{ margin: 0 }}>
                    <strong>📊 Experience:</strong> {job.experienceRequired} {job.experienceRequired === 1 ? 'year' : 'years'}
                  </p>
                )}
                {job.jobType && (
                  <p style={{ margin: 0 }}>
                    <strong>💼 Type:</strong> 
                    <span style={{
                      marginLeft: "5px",
                      padding: "3px 8px",
                      borderRadius: "3px",
                      background: "#e3f2fd",
                      color: "#1976d2",
                      fontSize: "12px",
                      textTransform: "capitalize"
                    }}>
                      {job.jobType}
                    </span>
                  </p>
                )}
              </div>
              
              <p><strong>Skills:</strong> {job.skills || "Not specified"}</p>
              <p><strong>Description:</strong> {job.description}</p>
              <p><strong>Posted on:</strong> {new Date(job.createdAt).toLocaleDateString()}</p>
              <p><strong>Status:</strong> {job.status}</p>

              <div>
                <button onClick={() => viewApplicants(job.id)}>
                  View Applicants
                </button>
                <button 
                  onClick={() => viewMatchedCandidates(job.id)}
                  style={{ background: "#17a2b8", marginLeft: "10px" }}
                >
                  👥 View Matched Candidates
                </button>

                {(job.status === "paused" || job.status === "closed") && (
                  <button onClick={() => handleStatusChange(job.id, "open")}>
                    Reopen Job
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
