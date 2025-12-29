import { Injectable ,NotFoundException, BadRequestException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from './application.entity';
import { Job } from '../jobs/job.entity';
import { JobsGateway } from 'src/gateway/jobs.gateway';


@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private appRepo: Repository<Application>,

    @InjectRepository(Job)
    private jobRepo: Repository<Job>,

    private readonly jobsGateway: JobsGateway,
  ) {}

  async apply(userId: number, jobId: number) {

  // 1️⃣ check if user already applied
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

  // 3️⃣ create new record
  const saved = await this.appRepo.save({
    job,
    applicant: { id: userId },
    status: 'pending',
  });

  this.jobsGateway.notifyRecruiter(job.postedBy, saved);  // 🔵 REAL-TIME EVENT
  return saved;
}
    async getApplicants(jobId: number) {
    return this.appRepo.find({
        where: { job: { id: jobId } },
        relations: ['job', 'applicant'],
    });
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
