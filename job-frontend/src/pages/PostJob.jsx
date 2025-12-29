import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function PostJob() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    skills: "",
    description: "",
    salaryMin: "",
    salaryMax: "",
    experienceRequired: "",
    jobType: "full-time"
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api.post("/jobs", form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Job posted successfully!");
      setForm({
        title: "",
        company: "",
        location: "",
        skills: "",
        description: "",
        salaryMin: "",
        salaryMax: "",
        experienceRequired: "",
        jobType: "full-time"
      });
      navigate("/recruiter/my-jobs");
    } catch (err) {
      console.error("Error posting job:", err);
      alert("Failed to post job");
    }
  }

  return (
    <div>
      <h2>Post a New Job</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Job Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="e.g., Senior Frontend Developer"
          />
        </div>

        <div>
          <label>Company</label>
          <input
            name="company"
            value={form.company}
            onChange={handleChange}
            required
            placeholder="e.g., Tech Corp"
          />
        </div>

        <div>
          <label>Location</label>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="e.g., Remote, New York"
          />
        </div>

        <div>
          <label>Skills (comma-separated)</label>
          <input
            name="skills"
            value={form.skills}
            onChange={handleChange}
            placeholder="e.g., JavaScript, React, Node.js"
          />
        </div>

        <div>
          <label>Salary Range (USD)</label>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              name="salaryMin"
              type="number"
              value={form.salaryMin}
              onChange={handleChange}
              placeholder="Min (e.g., 50000)"
              style={{ flex: 1 }}
            />
            <input
              name="salaryMax"
              type="number"
              value={form.salaryMax}
              onChange={handleChange}
              placeholder="Max (e.g., 80000)"
              style={{ flex: 1 }}
            />
          </div>
        </div>

        <div>
          <label>Experience Required (years)</label>
          <input
            name="experienceRequired"
            type="number"
            value={form.experienceRequired}
            onChange={handleChange}
            placeholder="e.g., 3"
            min="0"
          />
        </div>

        <div>
          <label>Job Type</label>
          <select
            name="jobType"
            value={form.jobType}
            onChange={handleChange}
            required
          >
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>

        <div>
          <label>Job Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows="6"
            placeholder="Enter job description..."
          />
        </div>

        <button type="submit">Post Job</button>
      </form>
    </div>
  );
}
