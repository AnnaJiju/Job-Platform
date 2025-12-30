import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { Job } from './job.entity';
import { ProfilesModule } from '../profiles/profiles.module';
import { JobsGatewayModule } from 'src/gateway/jobs.module';
import { JobsAggregatorService } from './jobs-aggregator.service';
import { Profile } from '../profiles/profile.entity';
import { User } from '../users/user.entity';
import { AdzunaProvider } from './providers/adzuna.provider';
import { JobNormalizerService } from './services/job-normalizer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Job, Profile, User]), 
    ProfilesModule, 
    JobsGatewayModule,
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  providers: [
    JobsService, 
    JobsAggregatorService,
    AdzunaProvider,
    JobNormalizerService,
  ],
  controllers: [JobsController],
  exports: [JobsService],
})
export class JobsModule {}
