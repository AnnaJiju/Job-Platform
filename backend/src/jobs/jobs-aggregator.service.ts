import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './job.entity';
import fakeJobs from './fakejobs.json';   // adjust path if needed
import { JobsGateway } from 'src/gateway/jobs.gateway';
import { Cron } from '@nestjs/schedule/dist/decorators/cron.decorator';

@Injectable()
export class JobsAggregatorService {

  private readonly logger = new Logger(JobsAggregatorService.name);

  constructor(
    @InjectRepository(Job)
    private readonly jobsRepo: Repository<Job>,
    private readonly gateway: JobsGateway,
  ) {}

  @Cron('*/5 * * * *') 
  async importJobs() {
    this.logger.log('🚀 Cron Triggered — importing jobs...');

    this.logger.log(`Found ${fakeJobs.length} jobs in feed`);

    this.logger.log(`Checking for duplicates...`);  
    for (const j of fakeJobs) {

      // prevent duplicates
      const exists = await this.jobsRepo.findOne({
        where: { title: j.title, company: j.company }
      });

      if (exists) continue;

      const job = this.jobsRepo.create({
        title: j.title,
        company: j.company,
        description: j.description,
        skills: j.skills ?? '',
        location: j.location ?? '',
        postedBy: 9999,       // system user
        status: 'open'
      } as Partial<Job>);

      const saved = await this.jobsRepo.save(job);

      this.logger.log(`✔ Imported: ${saved.title}`);

      // optional realtime broadcast
      this.gateway.notifyNewJob(saved);
    }
  }
}
