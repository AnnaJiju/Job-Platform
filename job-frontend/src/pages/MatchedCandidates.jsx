import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";

export default function MatchedCandidates() {
  const { jobId } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchMatchedCandidates();
  }, [jobId]);

  async function fetchMatchedCandidates() {
    try {
      setLoading(true);
      const res = await api.get(`/jobs/${jobId}/matched-candidates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error("Error fetching matched candidates:", err);
      alert(err.response?.data?.message || "Failed to fetch matched candidates");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Loading matched candidates...</div>;
  if (!data || !data.job) return <div>No data available</div>;

  const { job, candidates, totalMatches } = data;

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={() => navigate("/recruiter/my-jobs")} style={{ marginBottom: "20px" }}>
        ← Back to My Jobs
      </button>

      <h2>Matched Candidates</h2>
      
      <div style={{ 
        background: "#f8f9fa", 
        padding: "15px", 
        borderRadius: "8px", 
        marginBottom: "20px" 
      }}>
        <h3>{job.title}</h3>
        <p><strong>Company:</strong> {job.company}</p>
        <p><strong>Location:</strong> {job.location || "Not specified"}</p>
        <p><strong>Required Skills:</strong> {job.skills}</p>
        <p style={{ marginTop: "10px", color: "#28a745", fontWeight: "bold" }}>
          Total Matches: {totalMatches}
        </p>
      </div>

      {candidates.length === 0 ? (
        <p style={{ textAlign: "center", color: "#666", padding: "40px" }}>
          No matching candidates found. Candidates will appear here when their skills match your job requirements.
        </p>
      ) : (
        <div>
          {candidates.map((candidate) => (
            <div 
              key={candidate.userId} 
              style={{ 
                border: "1px solid #ddd", 
                padding: "20px", 
                margin: "15px 0", 
                borderRadius: "8px",
                background: "white",
                position: "relative"
              }}
            >
              <div style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                background: candidate.matchScore >= 75 ? "#28a745" : candidate.matchScore >= 50 ? "#ffc107" : "#17a2b8",
                color: "white",
                padding: "8px 15px",
                borderRadius: "20px",
                fontSize: "14px",
                fontWeight: "bold"
              }}>
                ✨ {candidate.matchScore}% Match
              </div>

              <h3 style={{ marginTop: 0 }}>{candidate.name}</h3>
              <p><strong>📧 Email:</strong> {candidate.email}</p>
              
              {candidate.headline && (
                <p><strong>📝 Headline:</strong> {candidate.headline}</p>
              )}

              {candidate.experience !== null && candidate.experience !== undefined && (
                <p><strong>💼 Experience:</strong> {candidate.experience} {candidate.experience === 1 ? 'year' : 'years'}</p>
              )}

              <p><strong>🔧 Skills:</strong> {candidate.skills}</p>

              {candidate.resumeUrl && (
                <p>
                  <strong>📄 Resume:</strong>{" "}
                  <a 
                    href={`http://localhost:3000/${candidate.resumeUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#007bff" }}
                  >
                    View Resume
                  </a>
                </p>
              )}

              <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #eee" }}>
                <p style={{ fontSize: "12px", color: "#666", margin: 0 }}>
                  <strong>Matching Skills:</strong> This candidate's skills align with your job requirements by {candidate.matchScore}%
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
