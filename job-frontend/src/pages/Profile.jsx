import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";

export default function Profile() {
  const { token } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    headline: "",
    experience: "",
    skills: "",
    resumeUrl: ""
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
        skills: res.data.skills || "",
        resumeUrl: res.data.resumeUrl || ""
      });
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
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
          <p><strong>Resume URL:</strong> {profile?.resumeUrl || "Not set"}</p>
          <button onClick={() => setIsEditing(true)}>Edit Profile</button>
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

          <div>
            <label>Resume URL</label>
            <input
              name="resumeUrl"
              value={form.resumeUrl}
              onChange={handleChange}
              placeholder="e.g., https://drive.google.com/..."
            />
          </div>

          <button type="submit">Save Profile</button>
          <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
        </form>
      )}
    </div>
  );
}
