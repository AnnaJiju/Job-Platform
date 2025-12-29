import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";

export default function Jobs() {
  const { token } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    location: "",
    skills: "",
    minExp: "",
    maxExp: "",
    minSalary: "",
    maxSalary: "",
    jobType: ""
  });

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
    
    try {
      setLoading(true);
      
      // Build query params
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('keyword', searchQuery);
      if (filters.location.trim()) params.append('location', filters.location);
      if (filters.skills.trim()) params.append('skills', filters.skills);
      if (filters.minExp) params.append('minExp', filters.minExp);
      if (filters.maxExp) params.append('maxExp', filters.maxExp);
      if (filters.minSalary) params.append('minSalary', filters.minSalary);
      if (filters.maxSalary) params.append('maxSalary', filters.maxSalary);
      if (filters.jobType) params.append('jobType', filters.jobType);
      
      const queryString = params.toString();
      const url = queryString ? `/jobs/search?${queryString}` : '/jobs';
      
      const res = await api.get(url);
      setJobs(res.data);
    } catch (err) {
      console.error("Error searching jobs:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleClearFilters() {
    setSearchQuery("");
    setFilters({
      location: "",
      skills: "",
      minExp: "",
      maxExp: "",
      minSalary: "",
      maxSalary: "",
      jobType: ""
    });
    fetchJobs();
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
    <div style={{ padding: "20px" }}>
      <h2>Job Listings</h2>

      <form onSubmit={handleSearch} style={{ marginBottom: "20px" }}>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="text"
            placeholder="Search jobs by title, skills, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "70%", padding: "10px", marginRight: "10px" }}
          />
          <button type="submit" style={{ padding: "10px 20px" }}>Search</button>
          <button 
            type="button" 
            onClick={() => setShowFilters(!showFilters)}
            style={{ padding: "10px 20px", marginLeft: "10px", background: "#6c757d" }}
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          <button 
            type="button" 
            onClick={handleClearFilters}
            style={{ padding: "10px 20px", marginLeft: "10px", background: "#dc3545" }}
          >
            Clear All
          </button>
        </div>

        {showFilters && (
          <div style={{ 
            background: "#f8f9fa", 
            padding: "20px", 
            borderRadius: "8px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "15px"
          }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Location</label>
              <input
                type="text"
                placeholder="e.g., New York"
                value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
                style={{ width: "100%", padding: "8px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Skills</label>
              <input
                type="text"
                placeholder="e.g., React, Node.js"
                value={filters.skills}
                onChange={(e) => setFilters({...filters, skills: e.target.value})}
                style={{ width: "100%", padding: "8px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Min Experience (years)</label>
              <input
                type="number"
                placeholder="0"
                min="0"
                value={filters.minExp}
                onChange={(e) => setFilters({...filters, minExp: e.target.value})}
                style={{ width: "100%", padding: "8px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Max Experience (years)</label>
              <input
                type="number"
                placeholder="20"
                min="0"
                value={filters.maxExp}
                onChange={(e) => setFilters({...filters, maxExp: e.target.value})}
                style={{ width: "100%", padding: "8px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Min Salary ($)</label>
              <input
                type="number"
                placeholder="30000"
                min="0"
                step="1000"
                value={filters.minSalary}
                onChange={(e) => setFilters({...filters, minSalary: e.target.value})}
                style={{ width: "100%", padding: "8px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Max Salary ($)</label>
              <input
                type="number"
                placeholder="200000"
                min="0"
                step="1000"
                value={filters.maxSalary}
                onChange={(e) => setFilters({...filters, maxSalary: e.target.value})}
                style={{ width: "100%", padding: "8px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Job Type</label>
              <select
                value={filters.jobType}
                onChange={(e) => setFilters({...filters, jobType: e.target.value})}
                style={{ width: "100%", padding: "8px" }}
              >
                <option value="">All Types</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>
        )}
      </form>

      {jobs.length === 0 ? (
        <p>No jobs found</p>
      ) : (
        <div>
          {jobs.map((job) => (
            <div key={job.id} style={{ 
              border: "1px solid #ccc", 
              padding: "15px", 
              margin: "10px 0", 
              borderRadius: "8px",
              background: job.matchPercentage > 0 ? "#f8f9fa" : "white",
              position: "relative"
            }}>
              {job.matchPercentage > 0 && (
                <div style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  background: job.matchPercentage >= 75 ? "#28a745" : job.matchPercentage >= 50 ? "#ffc107" : "#17a2b8",
                  color: "white",
                  padding: "5px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "bold"
                }}>
                  ✨ {job.matchPercentage}% Match
                </div>
              )}
              <h3>{job.title}</h3>
              <p><strong>Company:</strong> {job.company}</p>
              <p><strong>Location:</strong> {job.location || "Not specified"}</p>
              
              <div style={{ display: "flex", gap: "20px", margin: "10px 0" }}>
                {job.salaryMin && job.salaryMax && (
                  <p>
                    <strong>💰 Salary:</strong> ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
                  </p>
                )}
                {job.experienceRequired !== null && job.experienceRequired !== undefined && (
                  <p>
                    <strong>📊 Experience:</strong> {job.experienceRequired} {job.experienceRequired === 1 ? 'year' : 'years'}
                  </p>
                )}
                {job.jobType && (
                  <p>
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
