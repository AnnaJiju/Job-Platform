import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import { useToast } from "../hooks/useToast";
import ToastContainer from "../components/ToastContainer";

export default function SavedJobs() {
  const { token } = useContext(AuthContext);
  const toast = useToast();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  async function fetchSavedJobs() {
    try {
      setLoading(true);
      const res = await api.get("/jobs/saved", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedJobs(res.data);
    } catch (err) {
      console.error("Error fetching saved jobs:", err);
      toast.error("Failed to fetch saved jobs");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(jobId) {
    try {
      await api.delete(`/jobs/${jobId}/save`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Job removed from saved list!");
      fetchSavedJobs();
    } catch (err) {
      console.error("Error removing saved job:", err);
      toast.error("Failed to remove job");
    }
  }

  async function handleApply(jobId) {
    try {
      await api.post(`/applications/${jobId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Application submitted successfully!");
    } catch (err) {
      console.error("Error applying:", err);
      toast.error(err.response?.data?.message || "Failed to apply");
    }
  }

  if (loading) {
    return (
      <>
        <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading saved jobs...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
      <div style={styles.container}>
        {/* Header Section */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.iconCircle}>
              <svg style={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <div>
              <h1 style={styles.title}>Saved Jobs</h1>
              <p style={styles.subtitle}>Your bookmarked opportunities • {savedJobs.length} jobs saved</p>
            </div>
          </div>
        </div>

        {/* Jobs Grid */}
        {savedJobs.length === 0 ? (
          <div style={styles.emptyState}>
            <svg style={styles.emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <h3 style={styles.emptyTitle}>No saved jobs yet</h3>
            <p style={styles.emptyText}>Start saving jobs you're interested in to build your collection</p>
          </div>
        ) : (
          <div style={styles.jobsGrid}>
            {savedJobs.map((savedJob) => {
              const job = savedJob.job;
              return (
                <div key={savedJob.id} style={styles.jobCard}>
                  <h3 style={styles.jobTitle}>{job.title}</h3>
                  <p style={styles.company}>{job.company}</p>

                  <div style={styles.jobDetails}>
                    {job.location && (
                      <div style={styles.jobDetail}>
                        <svg style={styles.detailIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {job.location}
                      </div>
                    )}
                    {job.salaryMin && job.salaryMax && (
                      <div style={styles.jobDetail}>
                        <svg style={styles.detailIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
                      </div>
                    )}
                    {job.experienceRequired !== null && job.experienceRequired !== undefined && (
                      <div style={styles.jobDetail}>
                        <svg style={styles.detailIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        {job.experienceRequired} {job.experienceRequired === 1 ? 'year' : 'years'}
                      </div>
                    )}
                  </div>

                  {job.skills && (
                    <div style={styles.skillsSection}>
                      {job.skills.split(',').slice(0, 5).map((skill, idx) => (
                        <span key={idx} style={styles.skillBadge}>
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  <p style={styles.description}>
                    {job.description?.length > 150 
                      ? `${job.description.substring(0, 150)}...` 
                      : job.description}
                  </p>

                  <div style={styles.savedInfo}>
                    <svg style={styles.savedIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Saved on {new Date(savedJob.savedAt).toLocaleDateString()}
                  </div>

                  <div style={styles.jobFooter}>
                    {job.jobType && (
                      <div style={styles.typeBadge}>
                        {job.jobType}
                      </div>
                    )}
                  </div>

                  <div style={styles.cardActions}>
                    <button 
                      onClick={() => handleApply(job.id)}
                      style={styles.applyButton}
                    >
                      <svg style={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Apply Now
                    </button>
                    <button 
                      onClick={() => handleRemove(job.id)}
                      style={styles.removeButton}
                    >
                      <svg style={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '32px',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  iconCircle: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    background: '#FCE7F3',
    color: '#EC4899',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  icon: {
    width: '28px',
    height: '28px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#111827',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '4px 0 0 0',
  },
  jobsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
    gap: '20px',
  },
  jobCard: {
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px',
    transition: 'box-shadow 0.2s',
  },
  jobTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#111827',
    margin: '0 0 8px 0',
  },
  company: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 16px 0',
  },
  jobDetails: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '16px',
  },
  jobDetail: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#6b7280',
  },
  detailIcon: {
    width: '16px',
    height: '16px',
    color: '#9ca3af',
  },
  skillsSection: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '12px',
  },
  skillBadge: {
    padding: '4px 10px',
    background: '#F3F4F6',
    color: '#4b5563',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 500,
  },
  description: {
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.5',
    margin: '0 0 12px 0',
  },
  savedInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#EC4899',
    marginBottom: '12px',
  },
  savedIcon: {
    width: '16px',
    height: '16px',
  },
  jobFooter: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  },
  typeBadge: {
    padding: '4px 10px',
    background: '#EFF6FF',
    color: '#1E40AF',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 500,
    textTransform: 'capitalize',
  },
  cardActions: {
    display: 'flex',
    gap: '12px',
  },
  applyButton: {
    flex: 1,
    padding: '10px 16px',
    background: '#3B82F6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  },
  removeButton: {
    flex: 1,
    padding: '10px 16px',
    background: '#EF4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  },
  buttonIcon: {
    width: '16px',
    height: '16px',
  },
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
    fontSize: '16px',
    color: '#6b7280',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  emptyIcon: {
    width: '64px',
    height: '64px',
    color: '#d1d5db',
    margin: '0 auto 16px',
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#374151',
    margin: '0 0 8px 0',
  },
  emptyText: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },
};
