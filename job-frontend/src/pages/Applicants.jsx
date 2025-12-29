import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import { useToast } from "../hooks/useToast";
import ToastContainer from "../components/ToastContainer";

export default function Applicants() {
  const { jobId } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState([]);
  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const toast = useToast();

  useEffect(() => {
    fetchApplicants();
    fetchJobDetails();
  }, [jobId]);

  async function fetchJobDetails() {
    try {
      const res = await api.get("/jobs");
      const job = res.data.find(j => j.id === parseInt(jobId));
      setJobDetails(job);
    } catch (err) {
      console.error("Error fetching job details:", err);
    }
  }

  async function fetchApplicants() {
    try {
      setLoading(true);
      const res = await api.get(`/applications/job/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplicants(res.data);
    } catch (err) {
      console.error("Error fetching applicants:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(applicationId, newStatus) {
    try {
      await api.patch(
        `/applications/${applicationId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      toast.success(`Application ${newStatus}`);
      fetchApplicants();
    } catch (err) {
      console.error("Error updating application:", err);
      toast.error("Failed to update application status");
    }
  }

  const filteredApplicants = filterStatus === "all" 
    ? applicants 
    : applicants.filter(app => app.status === filterStatus);

  const statusCounts = {
    all: applicants.length,
    pending: applicants.filter(a => a.status === "pending").length,
    accepted: applicants.filter(a => a.status === "accepted").length,
    rejected: applicants.filter(a => a.status === "rejected").length,
  };

  if (loading) {
    return (
      <>
        <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading applicants...</p>
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
            <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor" style={{color: '#3B82F6'}}>
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
            </svg>
          </div>
          <div>
            <h2 style={styles.pageTitle}>Applicants</h2>
            <p style={styles.pageSubtitle}>{jobDetails?.title}</p>
          </div>
        </div>
      </div>
      
      {/* Job Details Card */}
      {jobDetails && (
        <div style={styles.jobCard}>
          <div style={styles.jobCardHeader}>
            <div>
              <h3 style={styles.jobTitle}>{jobDetails.title}</h3>
              <p style={styles.jobCompany}>{jobDetails.company}</p>
            </div>
            <span style={{
              ...styles.badge,
              backgroundColor: jobDetails.status === "open" ? "#D1FAE5" : "#FEE2E2",
              color: jobDetails.status === "open" ? "#065F46" : "#991B1B"
            }}>
              {jobDetails.status}
            </span>
          </div>
          
          <div style={styles.jobDetails}>
            <div style={styles.detailItem}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={styles.detailIcon}>
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
              </svg>
              <span>{jobDetails.location || "Not specified"}</span>
            </div>
            {jobDetails.salaryMin && jobDetails.salaryMax && (
              <div style={styles.detailItem}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={styles.detailIcon}>
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                </svg>
                <span>${jobDetails.salaryMin.toLocaleString()} - ${jobDetails.salaryMax.toLocaleString()}</span>
              </div>
            )}
            {jobDetails.experienceRequired !== null && (
              <div style={styles.detailItem}>
                <span style={{...styles.badge, backgroundColor: "#DBEAFE", color: "#1E40AF"}}>
                  {jobDetails.experienceRequired} years exp
                </span>
              </div>
            )}
            {jobDetails.jobType && (
              <div style={styles.detailItem}>
                <span style={{...styles.badge, backgroundColor: "#F3E8FF", color: "#6B21A8"}}>
                  {jobDetails.jobType}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={styles.filterTabs}>
        {[
          { key: 'all', label: 'All' },
          { key: 'pending', label: 'Pending' },
          { key: 'accepted', label: 'Accepted' },
          { key: 'rejected', label: 'Rejected' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            style={{
              ...styles.filterTab,
              ...(filterStatus === tab.key ? styles.filterTabActive : {})
            }}
          >
            {tab.label}
            <span style={styles.tabCount}>({statusCounts[tab.key]})</span>
          </button>
        ))}
      </div>

      {/* Applicants List */}
      {filteredApplicants.length === 0 ? (
        <div style={styles.emptyState}>
          <svg width="64" height="64" viewBox="0 0 20 20" fill="currentColor" style={{color: '#d1d5db', marginBottom: '16px'}}>
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
          </svg>
          <p style={styles.emptyText}>
            {applicants.length === 0 ? "No applications yet for this job" : `No ${filterStatus} applications`}
          </p>
        </div>
      ) : (
        <div style={styles.applicantsGrid}>
          {filteredApplicants.map((app) => (
            <div key={app.id} style={styles.applicantCard}>
              <div style={styles.applicantHeader}>
                <div style={styles.applicantAvatar}>
                  {app.applicant.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div style={styles.applicantInfo}>
                  <h3 style={styles.applicantName}>{app.applicant.name}</h3>
                  <p style={styles.applicantEmail}>{app.applicant.email}</p>
                </div>
                <span style={{
                  ...styles.statusBadge,
                  backgroundColor: app.status === "accepted" ? "#D1FAE5" : app.status === "rejected" ? "#FEE2E2" : "#FEF3C7",
                  color: app.status === "accepted" ? "#065F46" : app.status === "rejected" ? "#991B1B" : "#92400E"
                }}>
                  {app.status}
                </span>
              </div>

              <div style={styles.applicationDate}>
                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" style={{color: '#9ca3af'}}>
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                </svg>
                Applied on {new Date(app.appliedAt).toLocaleDateString()}
              </div>

              {/* Profile Information */}
              {app.profile && (
                <div style={styles.profileSection}>
                  <h4 style={styles.sectionTitle}>Profile Details</h4>
                  {app.profile.headline && (
                    <div style={styles.profileRow}>
                      <span style={styles.profileLabel}>Headline:</span>
                      <span style={styles.profileValue}>{app.profile.headline}</span>
                    </div>
                  )}
                  {app.profile.experience !== null && (
                    <div style={styles.profileRow}>
                      <span style={styles.profileLabel}>Experience:</span>
                      <span style={styles.profileValue}>{app.profile.experience} years</span>
                    </div>
                  )}
                  {app.profile.skills && (
                    <div style={styles.profileRow}>
                      <span style={styles.profileLabel}>Skills:</span>
                      <div style={styles.skillsContainer}>
                        {app.profile.skills.split(',').slice(0, 4).map((skill, idx) => (
                          <span key={idx} style={styles.skillBadge}>
                            {skill.trim()}
                          </span>
                        ))}
                        {app.profile.skills.split(',').length > 4 && (
                          <span style={styles.skillBadge}>+{app.profile.skills.split(',').length - 4}</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {app.profile.resumeUrl && (
                    <a 
                      href={`http://localhost:3000${app.profile.resumeUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.resumeLink}
                    >
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
                      </svg>
                      Download Resume
                    </a>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div style={styles.actionButtons}>
                {app.status === "pending" ? (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(app.id, "accepted")}
                      style={styles.acceptButton}
                    >
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      Accept
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(app.id, "rejected")}
                      style={styles.rejectButton}
                    >
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                      </svg>
                      Reject
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleStatusUpdate(app.id, "pending")}
                    style={styles.resetButton}
                  >
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
                    </svg>
                    Reset to Pending
                  </button>
                )}
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
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  filterTabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '0',
  },
  filterTab: {
    padding: '12px 20px',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6b7280',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  filterTabActive: {
    color: '#3B82F6',
    borderBottomColor: '#3B82F6',
  },
  tabCount: {
    padding: '2px 8px',
    backgroundColor: '#f3f4f6',
    borderRadius: '12px',
    fontSize: '12px',
  },
  applicantsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '20px',
  },
  applicantCard: {
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px',
    transition: 'all 0.2s',
  },
  applicantHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '12px',
  },
  applicantAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    backgroundColor: '#EFF6FF',
    color: '#3B82F6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: '600',
    flexShrink: 0,
  },
  applicantInfo: {
    flex: 1,
    minWidth: 0,
  },
  applicantName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0,
  },
  applicantEmail: {
    fontSize: '13px',
    color: '#6b7280',
    margin: '2px 0 0 0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'capitalize',
    flexShrink: 0,
  },
  applicationDate: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: '1px solid #f3f4f6',
  },
  profileSection: {
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 12px 0',
  },
  profileRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '12px',
  },
  profileLabel: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: '500',
  },
  profileValue: {
    fontSize: '14px',
    color: '#1f2937',
  },
  skillsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  skillBadge: {
    padding: '4px 8px',
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    color: '#4b5563',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '500',
  },
  resumeLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    backgroundColor: '#EFF6FF',
    color: '#3B82F6',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    textDecoration: 'none',
    marginTop: '8px',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
  },
  acceptButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px',
    backgroundColor: '#D1FAE5',
    color: '#059669',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  rejectButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px',
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  resetButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px',
    backgroundColor: '#F3F4F6',
    color: '#4B5563',
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
  },
};
