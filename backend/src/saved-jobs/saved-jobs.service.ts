import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedJob } from './saved-job.entity';
import { Job } from 'src/jobs/job.entity';
import { User } from 'src/users/user.entity';

@Injectable()
export class SavedJobsService {
  constructor(
    @InjectRepository(SavedJob)
    private repo: Repository<SavedJob>,

    @InjectRepository(Job)
    private jobsRepo: Repository<Job>,
  ) {}

  async saveJob(userId: number, jobId: number) {
  const existing = await this.repo.findOne({
    where: {
      user: { id: userId },
      job: { id: jobId },
    },
  });

  if (existing) {
    return existing;   // or throw error if you prefer
  }

  const job = await this.jobsRepo.findOne({ where: { id: jobId } });

  if (!job) {
    throw new NotFoundException('Job not found');
  }

  return this.repo.save({
    user: { id: userId },
    job,
  });
}


  async removeSaved(userId: number, jobId: number) {
    const record = await this.repo.findOne({
      where: { user: { id: userId }, job: { id: jobId } },
    });

    if (!record) throw new NotFoundException('Job not saved');

    return this.repo.remove(record);
  }

  findForUser(userId: number) {
    return this.repo.find({
      where: { user: { id: userId } },
      order: { savedAt: 'DESC' },
    });
  }
}
