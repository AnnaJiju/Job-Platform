import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import { useToast } from "../hooks/useToast";
import ToastContainer from "../components/ToastContainer";

export default function Profile() {
  const { token, user } = useContext(AuthContext);
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
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
    } finally {
      setLoading(false);
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
      toast.warning('Only PDF, DOC, and DOCX files are allowed');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.warning('File size must be less than 5MB');
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
      toast.success("Resume uploaded successfully!");
      fetchProfile();
    } catch (err) {
      console.error("Error uploading resume:", err);
      toast.error(err.response?.data?.message || "Failed to upload resume");
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
      toast.success("Profile updated successfully!");
      fetchProfile();
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Failed to update profile");
    }
  }

  if (!profile && !isEditing) {
    return (
      <>
        <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
        <div>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.iconCircle}>
              <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor" style={{color: '#3B82F6'}}>
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
              </svg>
            </div>
            <div>
              <h2 style={styles.pageTitle}>My Profile</h2>
              <p style={styles.pageSubtitle}>Create your profile to get started</p>
            </div>
          </div>
        </div>

        <div style={styles.emptyState}>
          <svg width="64" height="64" viewBox="0 0 20 20" fill="currentColor" style={{color: '#d1d5db', marginBottom: '16px'}}>
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
          </svg>
          <p style={styles.emptyText}>No profile found. Create one to get personalized job recommendations!</p>
          <button onClick={() => setIsEditing(true)} style={styles.createButton}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
            </svg>
            Create Profile
          </button>
        </div>
      </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading profile...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
      <div>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.iconCircle}>
            <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor" style={{color: '#3B82F6'}}>
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
            </svg>
          </div>
          <div>
            <h2 style={styles.pageTitle}>My Profile</h2>
            <p style={styles.pageSubtitle}>{isEditing ? 'Edit your profile information' : 'View and manage your profile'}</p>
          </div>
        </div>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} style={styles.editButton}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
            </svg>
            Edit Profile
          </button>
        )}
      </div>

      {!isEditing ? (
        <div style={styles.profileGrid}>
          {/* Profile Info Card */}
          <div style={styles.profileCard}>
            <h3 style={styles.cardTitle}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" style={{marginRight: '8px', verticalAlign: 'text-bottom'}}>
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd"/>
              </svg>
              Profile Information
            </h3>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Headline</span>
                <span style={styles.infoValue}>{profile?.headline || "Not set"}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Experience</span>
                <span style={styles.infoValue}>{profile?.experience ? `${profile.experience} years` : "Not set"}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Skills</span>
                <span style={styles.infoValue}>{profile?.skills || "Not set"}</span>
              </div>
            </div>
          </div>

          {/* Resume Card */}
          <div style={styles.profileCard}>
            <h3 style={styles.cardTitle}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" style={{marginRight: '8px', verticalAlign: 'text-bottom'}}>
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"/>
              </svg>
              Resume
            </h3>
            {profile?.resumeUrl ? (
              <div style={styles.resumeSection}>
                <div style={styles.resumeSuccess}>
                  <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor" style={{color: '#059669'}}>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Resume uploaded</span>
                </div>
                <a 
                  href={`http://localhost:3000${profile.resumeUrl}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={styles.resumeLink}
                >
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
                  </svg>
                  View Resume
                </a>
                <label style={styles.uploadButton}>
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
            ) : (
              <div style={styles.resumeSection}>
                <div style={styles.resumeWarning}>
                  <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor" style={{color: '#D97706'}}>
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  <span>No resume uploaded. Upload your resume to apply for jobs.</span>
                </div>
                <label style={styles.uploadButton}>
                  {uploading ? "Uploading..." : "Upload Resume"}
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    style={{ display: "none" }}
                  />
                </label>
                <p style={styles.uploadHint}>Accepted formats: PDF, DOC, DOCX (Max 5MB)</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={styles.formCard}>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{marginRight: '8px', verticalAlign: 'text-bottom'}}>
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                </svg>
                Headline
              </label>
              <input
                name="headline"
                value={form.headline}
                onChange={handleChange}
                placeholder="e.g., Full Stack Developer"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{marginRight: '8px', verticalAlign: 'text-bottom'}}>
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                </svg>
                Experience (years)
              </label>
              <input
                name="experience"
                type="number"
                value={form.experience}
                onChange={handleChange}
                placeholder="e.g., 3"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{marginRight: '8px', verticalAlign: 'text-bottom'}}>
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                </svg>
                Skills (comma-separated)
              </label>
              <input
                name="skills"
                value={form.skills}
                onChange={handleChange}
                placeholder="e.g., JavaScript, React, Node.js"
                style={styles.input}
              />
            </div>

            <div style={styles.formActions}>
              <button type="button" onClick={() => setIsEditing(false)} style={styles.cancelButton}>
                Cancel
              </button>
              <button type="submit" style={styles.saveButton}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z"/>
                </svg>
                Save Profile
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
    </>
  );
}
const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: '16px',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #3B82F6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: '#6b7280',
    fontSize: '16px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  iconCircle: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    backgroundColor: '#EFF6FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0,
  },
  pageSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '4px 0 0 0',
  },
  editButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: '#3B82F6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  createButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#3B82F6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  profileGrid: {
    display: 'grid',
    gap: '20px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
  },
  profileCard: {
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '24px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 20px 0',
    display: 'flex',
    alignItems: 'center',
  },
  infoGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    paddingBottom: '12px',
    borderBottom: '1px solid #f3f4f6',
  },
  infoLabel: {
    fontSize: '13px',
    color: '#6b7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: '14px',
    color: '#1f2937',
  },
  resumeSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  resumeSuccess: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#D1FAE5',
    color: '#065F46',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
  },
  resumeWarning: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#FEF3C7',
    color: '#92400E',
    borderRadius: '8px',
    fontSize: '14px',
  },
  resumeLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    backgroundColor: '#DBEAFE',
    color: '#1E40AF',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
    width: 'fit-content',
  },
  uploadButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 16px',
    backgroundColor: '#3B82F6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    width: 'fit-content',
  },
  uploadHint: {
    fontSize: '12px',
    color: '#6b7280',
    margin: 0,
  },
  formCard: {
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '32px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '20px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    padding: '12px 16px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1f2937',
    outline: 'none',
    transition: 'all 0.2s',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px',
    paddingTop: '24px',
    borderTop: '1px solid #e5e7eb',
  },
  cancelButton: {
    padding: '12px 24px',
    backgroundColor: 'white',
    color: '#6b7280',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#3B82F6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '64px 32px',
    textAlign: 'center',
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: '16px',
    marginBottom: '16px',
  },
};
