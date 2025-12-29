import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import { useToast } from "../hooks/useToast";
import ToastContainer from "../components/ToastContainer";

export default function MyApplications() {
  const { token } = useContext(AuthContext);
  const toast = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    try {
      setLoading(true);
      const res = await api.get("/applications/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(res.data);
    } catch (err) {
      console.error("Error fetching applications:", err);
      toast.error("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  }

  const filteredApplications = filterStatus === 'all' 
    ? applications 
    : applications.filter(app => app.status === filterStatus);

  const statusCounts = {
    all: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    accepted: applications.filter(app => app.status === 'accepted').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
  };

  if (loading) {
    return (
      <>
        <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading applications...</p>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 style={styles.title}>My Applications</h1>
              <p style={styles.subtitle}>Track your job applications • {applications.length} total applications</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={styles.filterTabs}>
          <button
            onClick={() => setFilterStatus('all')}
            style={filterStatus === 'all' ? styles.activeTab : styles.tab}
          >
            All
            <span style={styles.tabCount}>{statusCounts.all}</span>
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            style={filterStatus === 'pending' ? styles.activeTab : styles.tab}
          >
            Pending
            <span style={styles.tabCount}>{statusCounts.pending}</span>
          </button>
          <button
            onClick={() => setFilterStatus('accepted')}
            style={filterStatus === 'accepted' ? styles.activeTab : styles.tab}
          >
            Accepted
            <span style={styles.tabCount}>{statusCounts.accepted}</span>
          </button>
          <button
            onClick={() => setFilterStatus('rejected')}
            style={filterStatus === 'rejected' ? styles.activeTab : styles.tab}
          >
            Rejected
            <span style={styles.tabCount}>{statusCounts.rejected}</span>
          </button>
        </div>

        {/* Applications Grid */}
        {filteredApplications.length === 0 ? (
          <div style={styles.emptyState}>
            <svg style={styles.emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 style={styles.emptyTitle}>
              {filterStatus === 'all' 
                ? "No applications yet" 
                : `No ${filterStatus} applications`}
            </h3>
            <p style={styles.emptyText}>
              {filterStatus === 'all' 
                ? "Start applying to jobs to track your applications here" 
                : `You have no ${filterStatus} applications at the moment`}
            </p>
          </div>
        ) : (
          <div style={styles.applicationsGrid}>
            {filteredApplications.map((app) => {
              const job = app.job;
              return (
                <div key={app.id} style={styles.applicationCard}>
                  <div style={styles.statusBadge(app.status)}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </div>

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

                  <div style={styles.applicationInfo}>
                    <div style={styles.appliedDate}>
                      <svg style={styles.dateIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Applied on {new Date(app.appliedAt).toLocaleDateString()}
                    </div>
                  </div>

                  {job.jobType && (
                    <div style={styles.jobFooter}>
                      <div style={styles.typeBadge}>
                        {job.jobType}
                      </div>
                    </div>
                  )}
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
    marginBottom: '24px',
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
    background: '#EDE9FE',
    color: '#8B5CF6',
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
  filterTabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '0',
  },
  tab: {
    padding: '12px 20px',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    fontSize: '14px',
    fontWeight: 500,
    color: '#6b7280',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s',
  },
  activeTab: {
    padding: '12px 20px',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid #8B5CF6',
    fontSize: '14px',
    fontWeight: 500,
    color: '#8B5CF6',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  tabCount: {
    padding: '2px 8px',
    background: '#F3F4F6',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 600,
  },
  applicationsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
    gap: '20px',
  },
  applicationCard: {
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px',
    position: 'relative',
  },
  statusBadge: (status) => ({
    position: 'absolute',
    top: '16px',
    right: '16px',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'capitalize',
    background: status === 'accepted' ? '#D1FAE5' : status === 'pending' ? '#FEF3C7' : '#FEE2E2',
    color: status === 'accepted' ? '#065F46' : status === 'pending' ? '#92400E' : '#991B1B',
  }),
  jobTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#111827',
    margin: '0 0 8px 0',
    paddingRight: '80px',
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
    marginBottom: '16px',
  },
  skillBadge: {
    padding: '4px 10px',
    background: '#F3F4F6',
    color: '#4b5563',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 500,
  },
  applicationInfo: {
    marginBottom: '12px',
  },
  appliedDate: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#8B5CF6',
    fontWeight: 500,
  },
  dateIcon: {
    width: '16px',
    height: '16px',
  },
  jobFooter: {
    display: 'flex',
    gap: '8px',
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
