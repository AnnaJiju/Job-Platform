// Interface for normalized external job data
export interface ExternalJob {
  externalId: string;
  title: string;
  company: string;
  description: string;
  skills?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  jobType?: string;
  sourceUrl?: string;
  source: string; // 'Adzuna', 'Reed', 'RemoteOK', etc.
}

// Interface for API providers
export interface JobApiProvider {
  getName(): string;
  fetchJobs(): Promise<ExternalJob[]>;
}
