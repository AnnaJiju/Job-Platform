import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan} from 'typeorm';
import { User } from '../users/user.entity';
import { Job } from '../jobs/job.entity';
import { Application } from '../applications/application.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,

    @InjectRepository(Job)
    private jobsRepo: Repository<Job>,

    @InjectRepository(Application)
    private appsRepo: Repository<Application>,
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

    user.status = status;

    return this.usersRepo.save(user);
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

    job.status = status;

    return this.jobsRepo.save(job);
  }
}
