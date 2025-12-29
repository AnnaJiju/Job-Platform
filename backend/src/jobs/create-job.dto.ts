export class CreateJobDto {
  title: string;
  company: string;
  skills?: string;
  location?: string;
  description: string;
  salaryMin?: number;
  salaryMax?: number;
  experienceRequired?: number;
  jobType?: string;
}
