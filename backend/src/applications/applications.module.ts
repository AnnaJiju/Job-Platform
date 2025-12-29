import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from './application.entity';
import { Job } from '../jobs/job.entity';
import { User } from '../users/user.entity';
import { Profile } from '../profiles/profile.entity';
import { JobsGatewayModule } from 'src/gateway/jobs.module';


@Module({
  imports: [TypeOrmModule.forFeature([Application, Job, User, Profile]), JobsGatewayModule],
  providers: [ApplicationsService],
  controllers: [ApplicationsController],
})
export class ApplicationsModule {}
