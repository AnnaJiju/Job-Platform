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
    description: ""
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
        description: ""
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
