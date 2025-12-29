import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import { useToast } from "../hooks/useToast";
import ToastContainer from "../components/ToastContainer";

export default function RecommendedJobs() {
  const { token } = useContext(AuthContext);
  const toast = useToast();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRecommendations();
  }, []);

  async function fetchRecommendations() {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/jobs/recommend", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(res.data);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      const errorMsg = err.response?.data?.message || "Failed to fetch recommendations. Please create your profile first.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
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

  async function handleSave(jobId) {
    try {
      await api.post(`/jobs/${jobId}/save`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Job saved successfully!");
    } catch (err) {
      console.error("Error saving job:", err);
      toast.error(err.response?.data?.message || "Failed to save job");
    }
  }

  if (loading) {
    return (
      <>
        <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Finding perfect matches for you...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
        <div style={styles.container}>
          <div style={styles.header}>
            <div style={styles.headerContent}>
              <div style={styles.iconCircle}>
                <svg style={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div>
                <h1 style={styles.title}>Recommended Jobs</h1>
                <p style={styles.subtitle}>Personalized job matches based on your profile</p>
              </div>
            </div>
          </div>

          <div style={styles.errorState}>
            <svg style={styles.errorIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 style={styles.errorTitle}>Profile Required</h3>
            <p style={styles.errorText}>{error}</p>
            <p style={styles.errorSubtext}>Complete your profile with your skills and experience to get personalized job recommendations</p>
          </div>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div>
              <h1 style={styles.title}>Recommended Jobs</h1>
              <p style={styles.subtitle}>Personalized matches based on your skills • {jobs.length} jobs found</p>
            </div>
          </div>
        </div>

        {/* Jobs Grid */}
        {jobs.length === 0 ? (
          <div style={styles.emptyState}>
            <svg style={styles.emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <h3 style={styles.emptyTitle}>No recommendations available</h3>
            <p style={styles.emptyText}>Complete your profile to get personalized job suggestions!</p>
          </div>
        ) : (
          <div style={styles.jobsGrid}>
            {jobs.map((job) => (
              <div key={job.id} style={styles.jobCard}>
                {/* Match Score Badge */}
                {job.score && (
                  <div style={{
                    ...styles.matchBadge,
                    background: job.score >= 75 ? '#10B981' : job.score >= 50 ? '#F59E0B' : '#3B82F6',
                  }}>
                    <svg style={styles.matchIcon} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {job.score}% Match
                  </div>
                )}

                <h3 style={styles.jobTitle}>{job.title}</h3>
                <p style={styles.company}>{job.company}</p>

                {/* Match Score Visual Bar */}
                {job.score && (
                  <div style={styles.scoreBarContainer}>
                    <div style={styles.scoreBarLabel}>
                      <span>Skill Match</span>
                      <span style={styles.scorePercent}>{job.score}%</span>
                    </div>
                    <div style={styles.scoreBar}>
                      <div style={{
                        ...styles.scoreBarFill,
                        width: `${job.score}%`,
                        background: job.score >= 75 ? '#10B981' : job.score >= 50 ? '#F59E0B' : '#3B82F6',
                      }}></div>
                    </div>
                  </div>
                )}

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
                    <div style={styles.matchLabel}>
                      <svg style={styles.matchLabelIcon} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Matching Skills
                    </div>
                    <div style={styles.skillsWrap}>
                      {job.skills.split(',').slice(0, 6).map((skill, idx) => (
                        <span key={idx} style={styles.skillBadge}>
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <p style={styles.description}>
                  {job.description?.length > 150 
                    ? `${job.description.substring(0, 150)}...` 
                    : job.description}
                </p>

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
                    onClick={() => handleSave(job.id)}
                    style={styles.saveButton}
                  >
                    <svg style={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    Save
                  </button>
                </div>
              </div>
            ))}
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
    background: '#FEF3C7',
    color: '#F59E0B',
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
    position: 'relative',
    transition: 'box-shadow 0.2s',
  },
  matchBadge: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  matchIcon: {
    width: '14px',
    height: '14px',
  },
  jobTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#111827',
    margin: '0 0 8px 0',
    paddingRight: '100px',
  },
  company: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 16px 0',
  },
  scoreBarContainer: {
    marginBottom: '16px',
  },
  scoreBarLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    fontSize: '13px',
    color: '#6b7280',
  },
  scorePercent: {
    fontWeight: 600,
    color: '#111827',
  },
  scoreBar: {
    width: '100%',
    height: '8px',
    background: '#F3F4F6',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    transition: 'width 0.3s ease',
    borderRadius: '4px',
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
    marginBottom: '16px',
  },
  matchLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#10B981',
    marginBottom: '8px',
  },
  matchLabelIcon: {
    width: '16px',
    height: '16px',
  },
  skillsWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
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
    margin: '0 0 16px 0',
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
  saveButton: {
    flex: 1,
    padding: '10px 16px',
    background: '#10B981',
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
    borderTop: '4px solid #F59E0B',
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
  errorState: {
    textAlign: 'center',
    padding: '60px 20px',
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
  },
  errorIcon: {
    width: '64px',
    height: '64px',
    color: '#F59E0B',
    margin: '0 auto 16px',
  },
  errorTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#111827',
    margin: '0 0 8px 0',
  },
  errorText: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 8px 0',
  },
  errorSubtext: {
    fontSize: '13px',
    color: '#9ca3af',
    margin: 0,
  },
};
