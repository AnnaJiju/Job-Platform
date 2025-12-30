import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import { useToast } from "../hooks/useToast";
import ToastContainer from "../components/ToastContainer";

export default function Jobs() {
  const { token } = useContext(AuthContext);
  const toast = useToast();
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    location: "",
    skills: "",
    minExp: "",
    maxExp: "",
    minSalary: "",
    maxSalary: "",
    jobType: ""
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      setLoading(true);
      const res = await api.get("/jobs");
      setJobs(res.data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      toast.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Build query params
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('keyword', searchQuery);
      if (filters.location.trim()) params.append('location', filters.location);
      if (filters.skills.trim()) params.append('skills', filters.skills);
      if (filters.minExp) params.append('minExp', filters.minExp);
      if (filters.maxExp) params.append('maxExp', filters.maxExp);
      if (filters.minSalary) params.append('minSalary', filters.minSalary);
      if (filters.maxSalary) params.append('maxSalary', filters.maxSalary);
      if (filters.jobType) params.append('jobType', filters.jobType);
      
      const queryString = params.toString();
      const url = queryString ? `/jobs/search?${queryString}` : '/jobs';
      
      const res = await api.get(url);
      setJobs(res.data);
      toast.success(`Found ${res.data.length} job(s)`);
    } catch (err) {
      console.error("Error searching jobs:", err);
      toast.error("Failed to search jobs");
    } finally {
      setLoading(false);
    }
  }

  function handleClearFilters() {
    setSearchQuery("");
    setFilters({
      location: "",
      skills: "",
      minExp: "",
      maxExp: "",
      minSalary: "",
      maxSalary: "",
      jobType: ""
    });
    fetchJobs();
    toast.success("Filters cleared");
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
          <p style={styles.loadingText}>Loading jobs...</p>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 style={styles.title}>Job Listings</h1>
              <p style={styles.subtitle}>Browse and apply to open positions • {jobs.length} jobs available</p>
            </div>
          </div>
        </div>

        {/* Search and Filters Section */}
        <div style={styles.searchContainer}>
          <form onSubmit={handleSearch} style={{ width: '100%' }}>
            <div style={styles.searchBar}>
              <svg style={styles.searchIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search jobs by title, skills, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
              <button type="submit" style={styles.searchButton}>
                Search
              </button>
            </div>

            <div style={styles.filterActions}>
              <button 
                type="button" 
                onClick={() => setShowFilters(!showFilters)}
                style={styles.filterToggleButton}
              >
                <svg style={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>
              <button 
                type="button" 
                onClick={handleClearFilters}
                style={styles.clearButton}
              >
                <svg style={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear All
              </button>
            </div>

            {showFilters && (
              <div style={styles.filtersContainer}>
                <div style={styles.filtersGrid}>
                  <div>
                    <label style={styles.filterLabel}>Location</label>
                    <input
                      type="text"
                      placeholder="e.g., New York"
                      value={filters.location}
                      onChange={(e) => setFilters({...filters, location: e.target.value})}
                      style={styles.filterInput}
                    />
                  </div>

                  <div>
                    <label style={styles.filterLabel}>Skills</label>
                    <input
                      type="text"
                      placeholder="e.g., React, Node.js"
                      value={filters.skills}
                      onChange={(e) => setFilters({...filters, skills: e.target.value})}
                      style={styles.filterInput}
                    />
                  </div>

                  <div>
                    <label style={styles.filterLabel}>Min Experience (years)</label>
                    <input
                      type="number"
                      placeholder="0"
                      min="0"
                      value={filters.minExp}
                      onChange={(e) => setFilters({...filters, minExp: e.target.value})}
                      style={styles.filterInput}
                    />
                  </div>

                  <div>
                    <label style={styles.filterLabel}>Max Experience (years)</label>
                    <input
                      type="number"
                      placeholder="20"
                      min="0"
                      value={filters.maxExp}
                      onChange={(e) => setFilters({...filters, maxExp: e.target.value})}
                      style={styles.filterInput}
                    />
                  </div>

                  <div>
                    <label style={styles.filterLabel}>Min Salary ($)</label>
                    <input
                      type="number"
                      placeholder="30000"
                      min="0"
                      step="1000"
                      value={filters.minSalary}
                      onChange={(e) => setFilters({...filters, minSalary: e.target.value})}
                      style={styles.filterInput}
                    />
                  </div>

                  <div>
                    <label style={styles.filterLabel}>Max Salary ($)</label>
                    <input
                      type="number"
                      placeholder="200000"
                      min="0"
                      step="1000"
                      value={filters.maxSalary}
                      onChange={(e) => setFilters({...filters, maxSalary: e.target.value})}
                      style={styles.filterInput}
                    />
                  </div>

                  <div>
                    <label style={styles.filterLabel}>Job Type</label>
                    <select
                      value={filters.jobType}
                      onChange={(e) => setFilters({...filters, jobType: e.target.value})}
                      style={styles.filterInput}
                    >
                      <option value="">All Types</option>
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Jobs Grid */}
        {jobs.length === 0 ? (
          <div style={styles.emptyState}>
            <svg style={styles.emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 style={styles.emptyTitle}>No jobs found</h3>
            <p style={styles.emptyText}>Try adjusting your search criteria or filters</p>
          </div>
        ) : (
          <div style={styles.jobsGrid}>
            {jobs.map((job) => (
              <div key={job.id} style={styles.jobCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  {job.matchPercentage > 0 && (
                    <div style={{
                      ...styles.matchBadge,
                      background: job.matchPercentage >= 75 ? '#10B981' : job.matchPercentage >= 50 ? '#F59E0B' : '#3B82F6',
                    }}>
                      <svg style={styles.matchIcon} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {job.matchPercentage}% Match
                    </div>
                  )}
                  {job.source && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '4px 10px',
                      backgroundColor: '#EEF2FF',
                      color: '#4F46E5',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '600',
                      marginLeft: 'auto',
                    }}>
                      <svg style={{ width: '14px', height: '14px', marginRight: '4px' }} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                      </svg>
                      {job.source}
                    </div>
                  )}
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

                <p style={styles.description}>
                  {job.description?.length > 150 
                    ? `${job.description.substring(0, 150)}...` 
                    : job.description}
                </p>

                <div style={styles.jobFooter}>
                  <div style={styles.statusBadge(job.status)}>
                    {job.status === 'open' ? 'Open' : job.status === 'paused' ? 'Paused' : 'Closed'}
                  </div>
                  {job.jobType && (
                    <div style={styles.typeBadge}>
                      {job.jobType}
                    </div>
                  )}
                </div>

                <div style={styles.cardActions}>
                  <button 
                    onClick={() => handleApply(job.id)}
                    disabled={job.status !== "open"}
                    style={{
                      ...styles.applyButton,
                      ...(job.status !== "open" && styles.disabledButton)
                    }}
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
    background: '#EFF6FF',
    color: '#3B82F6',
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
  searchContainer: {
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
    position: 'relative',
  },
  searchIcon: {
    width: '20px',
    height: '20px',
    color: '#9ca3af',
    position: 'absolute',
    left: '12px',
    pointerEvents: 'none',
  },
  searchInput: {
    flex: 1,
    padding: '10px 12px 10px 40px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
  },
  searchButton: {
    padding: '10px 20px',
    background: '#3B82F6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  filterActions: {
    display: 'flex',
    gap: '12px',
  },
  filterToggleButton: {
    padding: '10px 16px',
    background: '#F3F4F6',
    color: '#374151',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  clearButton: {
    padding: '10px 16px',
    background: '#FEE2E2',
    color: '#991B1B',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  buttonIcon: {
    width: '16px',
    height: '16px',
  },
  filtersContainer: {
    marginTop: '16px',
    padding: '20px',
    background: '#F9FAFB',
    borderRadius: '8px',
  },
  filtersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
  },
  filterLabel: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#374151',
  },
  filterInput: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
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
    margin: '0 0 16px 0',
  },
  jobFooter: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  },
  statusBadge: (status) => ({
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 500,
    textTransform: 'capitalize',
    background: status === 'open' ? '#D1FAE5' : status === 'paused' ? '#FEF3C7' : '#FEE2E2',
    color: status === 'open' ? '#065F46' : status === 'paused' ? '#92400E' : '#991B1B',
  }),
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
  disabledButton: {
    opacity: 0.5,
    cursor: 'not-allowed',
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
