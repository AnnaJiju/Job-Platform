import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { Job } from './job.entity';
import { ProfilesModule } from '../profiles/profiles.module';
import { JobsGatewayModule } from 'src/gateway/jobs.module';
import { JobsAggregatorService } from './jobs-aggregator.service';

@Module({
  imports: [TypeOrmModule.forFeature([Job]), ProfilesModule, JobsGatewayModule],
  providers: [JobsService, JobsAggregatorService],
  controllers: [JobsController],
  exports: [JobsService],
})
export class JobsModule {}
