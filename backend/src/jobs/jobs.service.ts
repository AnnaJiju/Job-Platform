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
  const query = this.jobsRepo
    .createQueryBuilder('job');

  if (filters.keyword) {
    query.andWhere(
      '(job.title ILIKE :kw OR job.description ILIKE :kw OR job.skills ILIKE :kw OR job.location ILIKE :kw OR job.company ILIKE :kw)',
      { kw: `%${filters.keyword}%` },
    );
  }

  if (filters.location) {
    query.andWhere('job.location ILIKE :loc', {
      loc: `%${filters.location}%`,
    });
  }

  if (filters.minExp) {
    query.andWhere('job.experience >= :min', { min: filters.minExp });
  }

  if (filters.maxExp) {
    query.andWhere('job.experience <= :max', { max: filters.maxExp });
  }

  if (filters.skills) {
    const skillList = filters.skills.split(',');
    skillList.forEach((skill, i) => {
      query.andWhere(`job.skills ILIKE :s${i}`, {
        [`s${i}`]: `%${skill.trim()}%`,
      });
    });
  }

  

  return query.getMany();
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

  job.status = status;

  return this.jobsRepo.save(job);
}


}


