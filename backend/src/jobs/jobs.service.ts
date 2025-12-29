import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './job.entity';
import { CreateJobDto } from './create-job.dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { JobsGateway } from 'src/gateway/jobs.gateway';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobsRepo: Repository<Job>,
    private readonly jobsGateway: JobsGateway,
  ) {}

  async create(dto: CreateJobDto, recruiterId: number) {
    const job = this.jobsRepo.create({
      ...dto,
      postedBy: recruiterId,
    });

    const saved = await this.jobsRepo.save(job);

  // 🔵 REAL-TIME EVENT
  this.jobsGateway.notifyNewJob(saved);

  return saved;
}

  findAll() {
    return this.jobsRepo.find();
  }

  matchScore(jobSkills: string, userSkills: string) {
  if (!jobSkills || !userSkills) return 0;

  const jobArr = jobSkills.toLowerCase().split(',');
  const userArr = userSkills.toLowerCase().split(',');

  const matches = jobArr.filter(skill => userArr.includes(skill));

  return Math.round((matches.length / jobArr.length) * 100);
 }

 async recommendForUser(user: any, profile: any) {
  if (!profile || !profile.skills) {
    return [];
  }

  const jobs = await this.jobsRepo.find({ where: { status: 'open' } });

  const scored = jobs
    .map(job => ({
      ...job,
      score: this.matchScore(job.skills, profile.skills),
    }))
    .filter(job => job.score > 0) // Only return jobs with at least some match
    .sort((a, b) => b.score - a.score);

  // 🔵 send real-time matches (top 3)
  scored.slice(0, 3).forEach(job => {
    console.log('🔥 Sending match to user', user.id, 'job', job.id);
    this.jobsGateway.notifyMatch(user.id, job);
  });

  return scored;
}

 async searchJobs(filters: any) {
  // Get all open jobs
  const allJobs = await this.jobsRepo.find({
    where: { status: 'open' }
  });

  // Calculate max possible score based on filters applied
  let maxPossibleScore = 0;
  if (filters.keyword) maxPossibleScore += 16; // 5+3+4+2+2
  if (filters.location) maxPossibleScore += 3;
  if (filters.skills) {
    const skillCount = filters.skills.split(',').length;
    maxPossibleScore += skillCount * 4;
  }
  if (filters.minExp || filters.maxExp) maxPossibleScore += 3;
  if (filters.minSalary || filters.maxSalary) maxPossibleScore += 3;
  if (filters.jobType) maxPossibleScore += 2;

  // If no filters applied, default max score to show all jobs as 0%
  if (maxPossibleScore === 0) maxPossibleScore = 1;

  // Score each job based on filter matches
  const scoredJobs = allJobs.map(job => {
    let score = 0;

    // Keyword matching (highest weight - 5 points)
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      if (job.title?.toLowerCase().includes(kw)) score += 5;
      if (job.description?.toLowerCase().includes(kw)) score += 3;
      if (job.skills?.toLowerCase().includes(kw)) score += 4;
      if (job.company?.toLowerCase().includes(kw)) score += 2;
      if (job.location?.toLowerCase().includes(kw)) score += 2;
    }

    // Location matching (3 points)
    if (filters.location && job.location?.toLowerCase().includes(filters.location.toLowerCase())) {
      score += 3;
    }

    // Skills matching (4 points per skill)
    if (filters.skills) {
      const filterSkills = filters.skills.split(',').map(s => s.trim().toLowerCase());
      const jobSkills = job.skills?.toLowerCase() || '';
      filterSkills.forEach(skill => {
        if (jobSkills.includes(skill)) score += 4;
      });
    }

    // Experience matching (3 points if within range)
    if (filters.minExp || filters.maxExp) {
      const jobExp = job.experienceRequired || 0;
      const minExp = filters.minExp ? parseInt(filters.minExp) : 0;
      const maxExp = filters.maxExp ? parseInt(filters.maxExp) : 999;
      
      if (jobExp >= minExp && jobExp <= maxExp) {
        score += 3;
      }
    }

    // Salary matching (3 points if overlaps)
    if (filters.minSalary || filters.maxSalary) {
      const minSalary = filters.minSalary ? parseInt(filters.minSalary) : 0;
      const maxSalary = filters.maxSalary ? parseInt(filters.maxSalary) : 99999999;
      
      // Check if salary ranges overlap
      if (job.salaryMin && job.salaryMax) {
        if (job.salaryMax >= minSalary && job.salaryMin <= maxSalary) {
          score += 3;
        }
      }
    }

    // Job type matching (2 points)
    if (filters.jobType && job.jobType === filters.jobType) {
      score += 2;
    }

    // Calculate match percentage
    const matchPercentage = Math.round((score / maxPossibleScore) * 100);

    return { ...job, matchScore: score, matchPercentage };
  });

  // Sort by score (highest first), then by createdAt (newest first)
  scoredJobs.sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return scoredJobs;
}

async updateStatus(jobId: number, status: string, recruiterId: number) {

  const job = await this.jobsRepo.findOne({
    where: { id: jobId }
  });

  if (!job) {
    throw new NotFoundException('Job not found');
  }

  // Only owner can update
  if (job.postedBy !== recruiterId) {
    throw new ForbiddenException('Not your job');
  }

  const oldStatus = job.status;
  job.status = status;

  const saved = await this.jobsRepo.save(job);

  // Notify all jobseekers when a job reopens
  if (oldStatus !== 'open' && status === 'open') {
    this.jobsGateway.notifyJobReopened(saved);
  }

  return saved;
}


}


