import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";

export default function Applicants() {
  const { jobId } = useParams();
  const { token } = useContext(AuthContext);
  const [applicants, setApplicants] = useState([]);
  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicants();
    fetchJobDetails();
  }, [jobId]);

  async function fetchJobDetails() {
    try {
      const res = await api.get("/jobs");
      const job = res.data.find(j => j.id === parseInt(jobId));
      setJobDetails(job);
    } catch (err) {
      console.error("Error fetching job details:", err);
    }
  }

  async function fetchApplicants() {
    try {
      setLoading(true);
      const res = await api.get(`/applications/job/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplicants(res.data);
    } catch (err) {
      console.error("Error fetching applicants:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(applicationId, newStatus) {
    try {
      await api.patch(
        `/applications/${applicationId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      alert(`Application ${newStatus}`);
      fetchApplicants();
    } catch (err) {
      console.error("Error updating application:", err);
      alert("Failed to update application status");
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case "pending": return "#FFA500";
      case "accepted": return "#28A745";
      case "rejected": return "#DC3545";
      default: return "#6C757D";
    }
  }

  if (loading) return <div>Loading applicants...</div>;

  return (
    <div>
      <h2>Applicants for {jobDetails?.title}</h2>
      
      {jobDetails && (
        <div style={{ background: "#f5f5f5", padding: "10px", marginBottom: "20px" }}>
          <p><strong>Company:</strong> {jobDetails.company}</p>
          <p><strong>Location:</strong> {jobDetails.location || "Not specified"}</p>
        </div>
      )}

      {applicants.length === 0 ? (
        <p>No applications yet for this job.</p>
      ) : (
        <div>
          <p>Total Applications: {applicants.length}</p>
          {applicants.map((app) => (
            <div key={app.id} style={{ border: "1px solid #ccc", padding: "15px", margin: "10px 0" }}>
              <h3>Applicant: {app.applicant.name}</h3>
              <p><strong>Email:</strong> {app.applicant.email}</p>
              <p><strong>Applied on:</strong> {new Date(app.appliedAt).toLocaleDateString()}</p>
              <p>
                <strong>Status:</strong>{" "}
                <span style={{
                  color: getStatusColor(app.status),
                  fontWeight: "bold",
                  textTransform: "uppercase"
                }}>
                  {app.status}
                </span>
              </p>

              {app.status === "pending" && (
                <div>
                  <button
                    onClick={() => handleStatusUpdate(app.id, "accepted")}
                    style={{ background: "#28A745", color: "white", marginRight: "10px" }}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(app.id, "rejected")}
                    style={{ background: "#DC3545", color: "white" }}
                  >
                    Reject
                  </button>
                </div>
              )}

              {app.status !== "pending" && (
                <button
                  onClick={() => handleStatusUpdate(app.id, "pending")}
                  style={{ background: "#6C757D", color: "white" }}
                >
                  Reset to Pending
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
