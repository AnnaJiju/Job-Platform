import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";

export default function Profile() {
  const { token } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    headline: "",
    experience: "",
    skills: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await api.get("/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
      setForm({
        headline: res.data.headline || "",
        experience: res.data.experience || "",
        skills: res.data.skills || ""
      });
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only PDF, DOC, and DOCX files are allowed');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    try {
      setUploading(true);
      await api.post("/profile/resume", formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert("Resume uploaded successfully!");
      fetchProfile();
    } catch (err) {
      console.error("Error uploading resume:", err);
      alert(err.response?.data?.message || "Failed to upload resume");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api.post("/profile", form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Profile updated successfully!");
      fetchProfile();
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile");
    }
  }

  if (!profile && !isEditing) {
    return (
      <div>
        <h2>Profile</h2>
        <p>No profile found. Create one to get personalized job recommendations!</p>
        <button onClick={() => setIsEditing(true)}>Create Profile</button>
      </div>
    );
  }

  return (
    <div>
      <h2>My Profile</h2>

      {!isEditing ? (
        <div>
          <p><strong>Headline:</strong> {profile?.headline || "Not set"}</p>
          <p><strong>Experience:</strong> {profile?.experience ? `${profile.experience} years` : "Not set"}</p>
          <p><strong>Skills:</strong> {profile?.skills || "Not set"}</p>
          
          <div style={{ marginTop: "20px", padding: "15px", border: "1px solid #ccc", borderRadius: "8px", background: "#f9f9f9" }}>
            <h3>Resume</h3>
            {profile?.resumeUrl ? (
              <div>
                <p style={{ color: "green" }}>✅ Resume uploaded</p>
                <a 
                  href={`http://localhost:3000${profile.resumeUrl}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: "blue", textDecoration: "underline" }}
                >
                  View Resume
                </a>
                <div style={{ marginTop: "10px" }}>
                  <label style={{ 
                    padding: "8px 16px", 
                    background: "#007bff", 
                    color: "white", 
                    borderRadius: "4px", 
                    cursor: "pointer" 
                  }}>
                    {uploading ? "Uploading..." : "Replace Resume"}
                    <input 
                      type="file" 
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ color: "orange" }}>⚠️ No resume uploaded. Upload your resume to apply for jobs.</p>
                <label style={{ 
                  padding: "8px 16px", 
                  background: "#28a745", 
                  color: "white", 
                  borderRadius: "4px", 
                  cursor: "pointer",
                  display: "inline-block"
                }}>
                  {uploading ? "Uploading..." : "Upload Resume"}
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    style={{ display: "none" }}
                  />
                </label>
                <p style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
                  Accepted formats: PDF, DOC, DOCX (Max 5MB)
                </p>
              </div>
            )}
          </div>
          
          <button onClick={() => setIsEditing(true)} style={{ marginTop: "20px" }}>Edit Profile</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Headline</label>
            <input
              name="headline"
              value={form.headline}
              onChange={handleChange}
              placeholder="e.g., Full Stack Developer"
            />
          </div>

          <div>
            <label>Experience (years)</label>
            <input
              name="experience"
              type="number"
              value={form.experience}
              onChange={handleChange}
              placeholder="e.g., 3"
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

          <button type="submit">Save Profile</button>
          <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
        </form>
      )}
    </div>
  );
}
