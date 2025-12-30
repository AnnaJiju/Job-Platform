import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, IsNull } from 'typeorm';
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

    // Count users by role (excluding admins from the breakdown)
    const jobseekers = await this.usersRepo
      .createQueryBuilder('user')
      .where('user.role = :role', { role: 'jobseeker' })
      .getCount();
    const recruiters = await this.usersRepo
      .createQueryBuilder('user')
      .where('user.role = :role', { role: 'recruiter' })
      .getCount();

    const totalJobs = await this.jobsRepo.count();
    const openJobs = await this.jobsRepo.count({ where: { status: 'open' } });
    const closedJobs = await this.jobsRepo.count({ where: { status: 'closed' } });
    const pausedJobs = await this.jobsRepo.count({ where: { status: 'paused' } });

    // Adzuna-specific analytics
    const adzunaJobs = await this.jobsRepo.count({ where: { source: 'Adzuna' } });
    const adzunaOpenJobs = await this.jobsRepo.count({ where: { source: 'Adzuna', status: 'open' } });
    const internalJobs = await this.jobsRepo.count({ where: { source: IsNull() } });

    const totalApps = await this.appsRepo.count();
    const pendingApps = await this.appsRepo.count({ where: { status: 'pending' } });
    const approvedApps = await this.appsRepo.count({ where: { status: 'approved' } });
    const rejectedApps = await this.appsRepo.count({ where: { status: 'rejected' } });
    
    // Adzuna application analytics
    const adzunaApplications = await this.appsRepo
      .createQueryBuilder('app')
      .leftJoin('job', 'j', 'j.id = app.jobId')
      .where('j.source = :source', { source: 'Adzuna' })
      .getCount();
    
    // Top Adzuna companies by applications
    const topAdzunaCompanies = await this.appsRepo
      .createQueryBuilder('app')
      .leftJoin('job', 'j', 'j.id = app.jobId')
      .select('j.company', 'company')
      .addSelect('COUNT(app.id)', 'applicationCount')
      .where('j.source = :source', { source: 'Adzuna' })
      .groupBy('j.company')
      .orderBy('"applicationCount"', 'DESC')
      .limit(5)
      .getRawMany();

    console.log('📊 Analytics Debug:', {
      totalUsers,
      jobseekers,
      recruiters,
      totalJobs,
      totalApps
    });

    // Last 7 days
    const last7 = new Date();
    last7.setDate(last7.getDate() - 7);

    const newUsers7d = await this.usersRepo.count({ where: { createdAt: MoreThan(last7) }});
    const newJobs7d = await this.jobsRepo.count({ where: { createdAt: MoreThan(last7) }});
    const newApps7d = await this.appsRepo.count({ where: { appliedAt: MoreThan(last7) }});

    // Last 30 days
    const last30 = new Date();
    last30.setDate(last30.getDate() - 30);

    const newUsers30d = await this.usersRepo.count({ where: { createdAt: MoreThan(last30) }});
    const newJobs30d = await this.jobsRepo.count({ where: { createdAt: MoreThan(last30) }});
    const newApps30d = await this.appsRepo.count({ where: { appliedAt: MoreThan(last30) }});
    
    // Adzuna recent imports
    const adzunaImports7d = await this.jobsRepo.count({ where: { source: 'Adzuna', createdAt: MoreThan(last7) }});
    const adzunaImports30d = await this.jobsRepo.count({ where: { source: 'Adzuna', createdAt: MoreThan(last30) }});

    // Growth trends - last 12 months
    const growthTrends: Array<{ month: string; users: number; jobs: number; applications: number }> = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      const usersCount = await this.usersRepo
        .createQueryBuilder('user')
        .where('user.createdAt >= :start', { start: monthStart })
        .andWhere('user.createdAt < :end', { end: monthEnd })
        .getCount();

      const jobsCount = await this.jobsRepo
        .createQueryBuilder('job')
        .where('job.createdAt >= :start', { start: monthStart })
        .andWhere('job.createdAt < :end', { end: monthEnd })
        .getCount();

      const appsCount = await this.appsRepo
        .createQueryBuilder('app')
        .where('app.appliedAt >= :start', { start: monthStart })
        .andWhere('app.appliedAt < :end', { end: monthEnd })
        .getCount();

      growthTrends.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        users: usersCount,
        jobs: jobsCount,
        applications: appsCount
      });
    }

    // Top job categories by applications
    const topCategories = await this.appsRepo
      .createQueryBuilder('app')
      .leftJoin('job', 'j', 'j.id = app.jobId')
      .select('j.jobType', 'category')
      .addSelect('COUNT(app.id)', 'count')
      .groupBy('j.jobType')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();

    // Most active recruiters
    const topRecruiters = await this.jobsRepo
      .createQueryBuilder('job')
      .innerJoin('user', 'u', 'u.id = job.postedBy AND u.role = :role', { role: 'recruiter' })
      .select('u.name', 'recruiterName')
      .addSelect('u.email', 'recruiterEmail')
      .addSelect('COUNT(job.id)', 'jobCount')
      .where('u.id IS NOT NULL')
      .groupBy('u.id')
      .addGroupBy('u.name')
      .addGroupBy('u.email')
      .orderBy('"jobCount"', 'DESC')
      .limit(5)
      .getRawMany();

    const jobsWithApps = await this.appsRepo
      .createQueryBuilder('app')
      .select('COUNT(DISTINCT app.jobId)', 'count')
      .getRawOne();

    const avgApps = totalJobs
      ? totalApps / totalJobs
      : 0;

    // Acceptance rate
    const acceptanceRate = totalApps > 0 
      ? Math.round((approvedApps / totalApps) * 100)
      : 0;

    console.log('📊 Top Recruiters:', topRecruiters);
    console.log('📊 Recent Activity:', {
      last7Days: { newUsers7d, newJobs7d, newApps7d },
      last30Days: { newUsers30d, newJobs30d, newApps30d }
    });

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        suspended: suspendedUsers,
        byRole: {
          jobseekers,
          recruiters
        }
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
        last7Days: {
          newUsers: newUsers7d,
          newJobs: newJobs7d,
          newApplications: newApps7d
        },
        last30Days: {
          newUsers: newUsers30d,
          newJobs: newJobs30d,
          newApplications: newApps30d
        }
      },
      engagement: {
        avgApplicationsPerJob: Number(avgApps.toFixed(2)),
        jobsWithApplicationsPercent: totalJobs
          ? Math.round((jobsWithApps.count / totalJobs) * 100)
          : 0,
        acceptanceRate
      },
      trends: {
        monthly: growthTrends,
        topCategories,
        topRecruiters
      },
      adzuna: {
        totalJobs: adzunaJobs,
        openJobs: adzunaOpenJobs,
        applications: adzunaApplications,
        topCompanies: topAdzunaCompanies,
        recent: {
          last7Days: adzunaImports7d,
          last30Days: adzunaImports30d
        },
        percentOfTotal: totalJobs > 0 ? Math.round((adzunaJobs / totalJobs) * 100) : 0
      },
      internal: {
        totalJobs: internalJobs,
        percentOfTotal: totalJobs > 0 ? Math.round((internalJobs / totalJobs) * 100) : 0
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
  async findAllJobs() {
    const jobs = await this.jobsRepo
      .createQueryBuilder('job')
      .leftJoinAndSelect('user', 'recruiter', 'recruiter.id = job.postedBy')
      .select([
        'job',
        'recruiter.email',
        'recruiter.name',
        'recruiter.status'
      ])
      .getRawAndEntities();

    // Map raw results to include recruiter info
    return jobs.entities.map((job, index) => {
      const raw = jobs.raw[index];
      return {
        ...job,
        recruiterEmail: raw.recruiter_email || (job.source === 'Adzuna' ? 'External API' : 'N/A'),
        recruiterName: raw.recruiter_name || (job.source === 'Adzuna' ? 'Adzuna' : 'N/A'),
        recruiterStatus: raw.recruiter_status,
        isExternal: !!job.source,
        externalSource: job.source
      };
    });
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

    // Check if recruiter still exists
    const recruiter = await this.usersRepo.findOne({ where: { id: recruiterId } });

    // Delete the job completely
    await this.jobsRepo.remove(job);

    // Notify the recruiter about job deletion only if user exists
    if (recruiter) {
      this.jobsGateway.notifyJobDeleted(recruiterId, {
        jobId,
        jobTitle,
        message: `Your job "${jobTitle}" has been removed by admin`
      });
    } else {
      console.log(`⚠️ Skipped notification for deleted job ${jobId} - recruiter ${recruiterId} not found`);
    }

    return { message: 'Job deleted successfully', jobId, jobTitle };
  }
}
