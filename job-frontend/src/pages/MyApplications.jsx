import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";

export default function MyApplications() {
  const { token } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    try {
      setLoading(true);
      const res = await api.get("/applications/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(res.data);
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
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

  if (loading) return <div>Loading applications...</div>;

  return (
    <div>
      <h2>My Applications</h2>

      {applications.length === 0 ? (
        <p>You haven't applied to any jobs yet.</p>
      ) : (
        <div>
          {applications.map((app) => {
            const job = app.job;
            return (
              <div key={app.id} style={{ border: "1px solid #ccc", padding: "15px", margin: "10px 0" }}>
                <h3>{job.title}</h3>
                <p><strong>Company:</strong> {job.company}</p>
                <p><strong>Location:</strong> {job.location || "Not specified"}</p>
                <p><strong>Skills:</strong> {job.skills || "Not specified"}</p>
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
