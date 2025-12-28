import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavedJob } from './saved-job.entity';
import { SavedJobsService } from './saved-jobs.service';
import { SavedJobsController } from './saved-jobs.controller';
import { Job } from '../jobs/job.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SavedJob, Job])],
  providers: [SavedJobsService],
  controllers: [SavedJobsController],
})
export class SavedJobsModule {}
