import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../users/user.entity';
import { UsersModule } from 'src/users/users.module';
import { JobsModule } from 'src/jobs/jobs.module';
import { ApplicationsModule } from 'src/applications/applications.module';
import { Job } from '../jobs/job.entity';
import { Application } from '../applications/application.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsersModule, JobsModule, ApplicationsModule, User, Job, Application]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
