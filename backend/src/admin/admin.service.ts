import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan} from 'typeorm';
import { User } from '../users/user.entity';
import { Job } from '../jobs/job.entity';
import { Application } from '../applications/application.entity';
import { JobsGateway } from '../gateway/jobs.gateway';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,

    @InjectRepository(Job)
    private jobsRepo: Repository<Job>,

    @InjectRepository(Application)
    private appsRepo: Repository<Application>,

    private jobsGateway: JobsGateway,
  ) {}


    async getAnalytics() {

    const totalUsers = await this.usersRepo.count();
    const activeUsers = await this.usersRepo.count({ where: { status: 'active' } });
    const suspendedUsers = await this.usersRepo.count({ where: { status: 'suspended' } });

    const totalJobs = await this.jobsRepo.count();
    const openJobs = await this.jobsRepo.count({ where: { status: 'open' } });
    const closedJobs = await this.jobsRepo.count({ where: { status: 'closed' } });
    const pausedJobs = await this.jobsRepo.count({ where: { status: 'paused' } });

    const totalApps = await this.appsRepo.count();
    const pendingApps = await this.appsRepo.count({ where: { status: 'pending' } });
    const approvedApps = await this.appsRepo.count({ where: { status: 'approved' } });
    const rejectedApps = await this.appsRepo.count({ where: { status: 'rejected' } });

    const last7 = new Date();
    last7.setDate(last7.getDate() - 7);

    const newUsers7d = await this.usersRepo.count({ where: { createdAt: MoreThan(last7) }});
    const newJobs7d = await this.jobsRepo.count({ where: { createdAt: MoreThan(last7) }});
    const newApps7d = await this.appsRepo.count({ where: { appliedAt: MoreThan(last7) }});

    const jobsWithApps = await this.appsRepo
      .createQueryBuilder('app')
      .select('COUNT(DISTINCT app.jobId)', 'count')
      .getRawOne();

    const avgApps = totalJobs
      ? totalApps / totalJobs
      : 0;

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        suspended: suspendedUsers
      },
      jobs: {
        total: totalJobs,
        open: openJobs,
        closed: closedJobs,
        paused: pausedJobs
      },
      applications: {
        total: totalApps,
        pending: pendingApps,
        approved: approvedApps,
        rejected: rejectedApps
      },
      recent: {
        newUsers7d,
        newJobs7d,
        newApplications7d: newApps7d
      },
      engagement: {
        avgApplicationsPerJob: Number(avgApps.toFixed(2)),
        jobsWithApplicationsPercent: totalJobs
          ? Math.round((jobsWithApps.count / totalJobs) * 100)
          : 0
      }
    };
  }
  // ---------- USERS ----------
  findAllUsers() {
    return this.usersRepo.find();
  }

  async updateUserStatus(id: number, status: string) {
    if (!['active', 'suspended'].includes(status)) {
      throw new BadRequestException('Invalid status');
    }

    const user = await this.usersRepo.findOne({ where: { id } });

    if (!user) throw new NotFoundException('User not found');

    const oldStatus = user.status;
    user.status = status;

    await this.usersRepo.save(user);

    // If banning a recruiter, close all their jobs
    if (user.role === 'recruiter' && status === 'suspended') {
      const recruiterJobs = await this.jobsRepo.find({
        where: { postedBy: id, status: 'open' }
      });

      // Close all open jobs
      for (const job of recruiterJobs) {
        job.status = 'paused';
        await this.jobsRepo.save(job);
      }

      // Notify the recruiter
      this.jobsGateway.notifyUserBanned(id, {
        message: `Your account has been suspended by admin. All your ${recruiterJobs.length} active job(s) have been temporarily closed.`,
        jobsClosed: recruiterJobs.length
      });

      console.log(`🚫 Banned recruiter ${id}, paused ${recruiterJobs.length} jobs`);
    }

    // If banning a jobseeker
    if (user.role === 'jobseeker' && status === 'suspended') {
      this.jobsGateway.notifyUserBanned(id, {
        message: `Your account has been suspended by admin. You will not be able to apply for jobs until your account is reactivated.`,
      });

      console.log(`🚫 Banned jobseeker ${id}`);
    }

    // If unbanning a recruiter, reopen their jobs
    if (user.role === 'recruiter' && status === 'active' && oldStatus === 'suspended') {
      const pausedJobs = await this.jobsRepo.find({
        where: { postedBy: id, status: 'paused' }
      });

      // Reopen all paused jobs
      for (const job of pausedJobs) {
        job.status = 'open';
        await this.jobsRepo.save(job);
      }

      // Notify about reactivation
      this.jobsGateway.notifyUserUnbanned(id, {
        message: `Your account has been reactivated by admin. All your ${pausedJobs.length} job(s) have been reopened automatically.`,
        jobsReopened: pausedJobs.length
      });

      console.log(`✅ Unbanned recruiter ${id}, reopened ${pausedJobs.length} jobs`);
    }

    // If unbanning a jobseeker
    if (user.role === 'jobseeker' && status === 'active' && oldStatus === 'suspended') {
      this.jobsGateway.notifyUserUnbanned(id, {
        message: `Your account has been reactivated by admin. You can now apply for jobs again.`,
      });

      console.log(`✅ Unbanned jobseeker ${id}`);
    }

    return user;
  }

  // ---------- JOBS ----------
  findAllJobs() {
    return this.jobsRepo.find();
  }

  async updateJobStatus(id: number, status: string) {
    if (!['open', 'closed', 'paused'].includes(status)) {
      throw new BadRequestException('Invalid status');
    }

    const job = await this.jobsRepo.findOne({ where: { id } });

    if (!job) throw new NotFoundException('Job not found');

    const oldStatus = job.status;
    job.status = status;

    const saved = await this.jobsRepo.save(job);

    // Notify the recruiter about the status change
    this.jobsGateway.notifyJobStatusUpdate(job.postedBy, {
      jobId: saved.id,
      jobTitle: saved.title,
      oldStatus,
      newStatus: saved.status
    });

    return saved;
  }

  async deleteJob(id: number) {
    const job = await this.jobsRepo.findOne({ where: { id } });

    if (!job) throw new NotFoundException('Job not found');

    const recruiterId = job.postedBy;
    const jobTitle = job.title;
    const jobId = job.id;

    // Delete the job completely
    await this.jobsRepo.remove(job);

    // Notify the recruiter about job deletion
    this.jobsGateway.notifyJobDeleted(recruiterId, {
      jobId,
      jobTitle,
      message: `Your job "${jobTitle}" has been removed by admin`
    });

    return { message: 'Job deleted successfully', jobId, jobTitle };
  }
}
