import { Injectable ,NotFoundException, BadRequestException, ForbiddenException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from './application.entity';
import { Job } from '../jobs/job.entity';
import { Profile } from '../profiles/profile.entity';
import { User } from '../users/user.entity';
import { JobsGateway } from 'src/gateway/jobs.gateway';


@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private appRepo: Repository<Application>,

    @InjectRepository(Job)
    private jobRepo: Repository<Job>,

    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    private readonly jobsGateway: JobsGateway,
  ) {}

  async apply(userId: number, jobId: number) {

  // 0️⃣ Check if user is suspended
  const user = await this.userRepo.findOne({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  if (user.status === 'suspended') {
    throw new ForbiddenException('Your account has been suspended. You cannot apply for jobs.');
  }

  // 1️⃣ Check if user has uploaded resume
  const profile = await this.profileRepo.findOne({
    where: { user: { id: userId } },
  });

  if (!profile || !profile.resumeUrl) {
    throw new BadRequestException('Please upload your resume before applying');
  }

  // 2️⃣ check if user already applied
  const existing = await this.appRepo.findOne({
    where: {
      applicant: { id: userId },
      job: { id: jobId }
    },
    relations: ['job', 'applicant'],
  });

  if (existing) {
    throw new BadRequestException('You have already applied');   // 🔥 prevent duplicate
  }

  // 2️⃣ ensure job exists
  const job = await this.jobRepo.findOne({
    where: { id: jobId },
  });

  if (!job) {
    throw new NotFoundException('Job not found');
  }

  // 2.5️⃣ check if job is open for applications
  if (job.status !== 'open') {
    throw new BadRequestException('This job is not accepting applications');
  }

  // 3️⃣ create new record
  const saved = await this.appRepo.save({
    job,
    applicant: { id: userId },
    status: 'pending',
  });

  // 4️⃣ Notify recruiter only if they exist (skip for Adzuna jobs with fake postedBy)
  if (job.postedBy) {
    const recruiter = await this.userRepo.findOne({ where: { id: job.postedBy } });
    if (recruiter) {
      this.jobsGateway.notifyRecruiter(job.postedBy, saved);  // 🔵 REAL-TIME EVENT
    }
  }
  
  return saved;
}
    async getApplicants(jobId: number) {
    const applications = await this.appRepo.find({
        where: { job: { id: jobId } },
        relations: ['job', 'applicant'],
    });

    // Fetch profile for each applicant
    const applicantsWithProfiles = await Promise.all(
      applications.map(async (app) => {
        const profile = await this.profileRepo.findOne({
          where: { user: { id: app.applicant.id } },
        });
        return {
          ...app,
          profile,
        };
      })
    );

    return applicantsWithProfiles;
    }
    async getMyApplications(userId: number) {
  return this.appRepo.find({
    where: { applicant: { id: userId } },
    relations: ['job'],
  });
}

async updateStatus(appId: number, status: 'approved' | 'rejected') {
  const app = await this.appRepo.findOne({
    where: { id: appId },
    relations: ['job', 'applicant'],
  });

  if (!app) throw new NotFoundException('Application not found');

  app.status = status;

  const saved = await this.appRepo.save(app);

  // 🟢 REAL-TIME notify user
  this.jobsGateway.notifyStatus(app.applicant.id, {
    appId: saved.id,
    status: saved.status,
    jobId: saved.job.id,
    jobTitle: saved.job.title,
    company: saved.job.company,
  });

  return saved;
}



}
