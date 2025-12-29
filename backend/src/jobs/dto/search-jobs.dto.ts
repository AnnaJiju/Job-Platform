export class SearchJobsDto {
  keyword?: string;
  location?: string;
  skills?: string;
  minExp?: number;
  maxExp?: number;
  minSalary?: number;
  maxSalary?: number;
  jobType?: string;
}
