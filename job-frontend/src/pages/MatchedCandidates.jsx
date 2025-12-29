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
  const [sortBy, setSortBy] = useState("score"); // score or name

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

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Finding matched candidates...</p>
      </div>
    );
  }

  if (!data || !data.job) {
    return (
      <div style={styles.emptyState}>
        <p style={styles.emptyText}>No data available</p>
      </div>
    );
  }

  const { job, candidates, totalMatches } = data;

  const sortedCandidates = [...candidates].sort((a, b) => {
    if (sortBy === "score") {
      return b.matchScore - a.matchScore;
    } else {
      return a.name.localeCompare(b.name);
    }
  });

  const getMatchLevel = (score) => {
    if (score >= 80) return { label: "Excellent", color: "#059669", bg: "#D1FAE5" };
    if (score >= 60) return { label: "Good", color: "#0891B2", bg: "#CFFAFE" };
    if (score >= 40) return { label: "Fair", color: "#F59E0B", bg: "#FEF3C7" };
    return { label: "Low", color: "#DC2626", bg: "#FEE2E2" };
  };

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate("/recruiter/my-jobs")} style={styles.backButton}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
          </svg>
          Back to My Jobs
        </button>
      </div>

      <div style={styles.titleSection}>
        <div style={styles.headerLeft}>
          <div style={styles.iconCircle}>
            <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor" style={{color: '#EC4899'}}>
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
            </svg>
          </div>
          <div>
            <h2 style={styles.pageTitle}>Matched Candidates</h2>
            <p style={styles.pageSubtitle}>{totalMatches} {totalMatches === 1 ? 'match' : 'matches'} found</p>
          </div>
        </div>
      </div>
      
      {/* Job Details Card */}
      <div style={styles.jobCard}>
        <div style={styles.jobCardHeader}>
          <div>
            <h3 style={styles.jobTitle}>{job.title}</h3>
            <p style={styles.jobCompany}>{job.company}</p>
          </div>
          <span style={{
            ...styles.badge,
            backgroundColor: "#D1FAE5",
            color: "#065F46"
          }}>
            {totalMatches} Matches
          </span>
        </div>
        
        <div style={styles.jobDetails}>
          <div style={styles.detailItem}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={styles.detailIcon}>
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
            </svg>
            <span>{job.location || "Not specified"}</span>
          </div>
          {job.skills && (
            <div style={styles.detailItem}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={styles.detailIcon}>
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
              </svg>
              <span>Required: {job.skills}</span>
            </div>
          )}
        </div>
      </div>

      {/* Sort Controls */}
      {candidates.length > 0 && (
        <div style={styles.sortSection}>
          <span style={styles.sortLabel}>Sort by:</span>
          <div style={styles.sortButtons}>
            <button
              onClick={() => setSortBy("score")}
              style={{
                ...styles.sortButton,
                ...(sortBy === "score" ? styles.sortButtonActive : {})
              }}
            >
              Match Score
            </button>
            <button
              onClick={() => setSortBy("name")}
              style={{
                ...styles.sortButton,
                ...(sortBy === "name" ? styles.sortButtonActive : {})
              }}
            >
              Name
            </button>
          </div>
        </div>
      )}

      {/* Candidates List */}
      {candidates.length === 0 ? (
        <div style={styles.emptyState}>
          <svg width="64" height="64" viewBox="0 0 20 20" fill="currentColor" style={{color: '#d1d5db', marginBottom: '16px'}}>
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
          </svg>
          <p style={styles.emptyText}>No matching candidates found</p>
          <p style={styles.emptySubtext}>
            Candidates will appear here when their skills match your job requirements
          </p>
        </div>
      ) : (
        <div style={styles.candidatesGrid}>
          {sortedCandidates.map((candidate) => {
            const matchLevel = getMatchLevel(candidate.matchScore);
            return (
              <div key={candidate.userId} style={styles.candidateCard}>
                <div style={styles.candidateHeader}>
                  <div style={styles.candidateAvatar}>
                    {candidate.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div style={styles.candidateInfo}>
                    <h3 style={styles.candidateName}>{candidate.name}</h3>
                    <p style={styles.candidateEmail}>{candidate.email}</p>
                  </div>
                  <div style={{
                    ...styles.matchBadge,
                    backgroundColor: matchLevel.bg,
                    color: matchLevel.color
                  }}>
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    {candidate.matchScore}%
                  </div>
                </div>

                <div style={styles.matchLevelBar}>
                  <div style={{
                    ...styles.matchLevelFill,
                    width: `${candidate.matchScore}%`,
                    backgroundColor: matchLevel.color
                  }} />
                </div>

                <div style={{...styles.matchLevelLabel, color: matchLevel.color}}>
                  {matchLevel.label} Match
                </div>

                <div style={styles.candidateDetails}>
                  {candidate.headline && (
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Headline</span>
                      <span style={styles.detailValue}>{candidate.headline}</span>
                    </div>
                  )}
                  {candidate.experience !== null && candidate.experience !== undefined && (
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Experience</span>
                      <span style={styles.detailValue}>
                        {candidate.experience} {candidate.experience === 1 ? 'year' : 'years'}
                      </span>
                    </div>
                  )}
                  {candidate.skills && (
                    <div style={styles.skillsSection}>
                      <span style={styles.detailLabel}>Skills</span>
                      <div style={styles.skillsContainer}>
                        {candidate.skills.split(',').slice(0, 5).map((skill, idx) => (
                          <span key={idx} style={styles.skillBadge}>
                            {skill.trim()}
                          </span>
                        ))}
                        {candidate.skills.split(',').length > 5 && (
                          <span style={styles.skillBadge}>
                            +{candidate.skills.split(',').length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {candidate.resumeUrl && (
                  <a 
                    href={`http://localhost:3000/${candidate.resumeUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.resumeButton}
                  >
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
                    </svg>
                    View Resume
                  </a>
                )}

                <div style={styles.matchNote}>
                  This candidate's skills align {candidate.matchScore}% with your job requirements
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
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
    borderTop: '4px solid #EC4899',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: '#6b7280',
    fontSize: '16px',
  },
  header: {
    marginBottom: '24px',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#4b5563',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  titleSection: {
    marginBottom: '24px',
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
    backgroundColor: '#FCE7F3',
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
  jobCard: {
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px',
  },
  jobCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: '1px solid #f3f4f6',
  },
  jobTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0,
  },
  jobCompany: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '4px 0 0 0',
  },
  jobDetails: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    color: '#4b5563',
  },
  detailIcon: {
    color: '#9ca3af',
  },
  badge: {
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  sortSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
  },
  sortLabel: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500',
  },
  sortButtons: {
    display: 'flex',
    gap: '8px',
  },
  sortButton: {
    padding: '8px 16px',
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6b7280',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  sortButtonActive: {
    backgroundColor: '#EC4899',
    color: 'white',
    borderColor: '#EC4899',
  },
  candidatesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
    gap: '20px',
  },
  candidateCard: {
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px',
    transition: 'all 0.2s',
    position: 'relative',
  },
  candidateHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '12px',
  },
  candidateAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    backgroundColor: '#FCE7F3',
    color: '#EC4899',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: '600',
    flexShrink: 0,
  },
  candidateInfo: {
    flex: 1,
    minWidth: 0,
  },
  candidateName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0,
  },
  candidateEmail: {
    fontSize: '13px',
    color: '#6b7280',
    margin: '2px 0 0 0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  matchBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 10px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '700',
    flexShrink: 0,
  },
  matchLevelBar: {
    height: '6px',
    backgroundColor: '#f3f4f6',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '8px',
  },
  matchLevelFill: {
    height: '100%',
    transition: 'width 0.3s ease',
    borderRadius: '3px',
  },
  matchLevelLabel: {
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: '1px solid #f3f4f6',
  },
  candidateDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '16px',
  },
  detailRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  detailLabel: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: '14px',
    color: '#1f2937',
  },
  skillsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  skillsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  skillBadge: {
    padding: '4px 8px',
    backgroundColor: '#F3F4F6',
    color: '#4b5563',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '500',
  },
  resumeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px',
    backgroundColor: '#FCE7F3',
    color: '#EC4899',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    textDecoration: 'none',
    marginBottom: '12px',
    transition: 'all 0.2s',
  },
  matchNote: {
    fontSize: '12px',
    color: '#9ca3af',
    textAlign: 'center',
    paddingTop: '12px',
    borderTop: '1px solid #f3f4f6',
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
    marginBottom: '8px',
  },
  emptySubtext: {
    color: '#d1d5db',
    fontSize: '14px',
  },
};
