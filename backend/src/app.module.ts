import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JobsModule } from './jobs/jobs.module';
import { ProfilesModule } from './profiles/profiles.module';
import { ApplicationsModule } from './applications/applications.module';
import { SavedJobsModule } from './saved-jobs/saved-jobs.module';
import { AdminModule } from './admin/admin.module';
import { NotificationsModule } from './notifications/notifications.module';
import { JobsGateway } from './gateway/jobs.gateway';
import { JwtModule } from '@nestjs/jwt';  
import  { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'root123',
      database: 'job_platform',
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
    }),
    JwtModule.register({
      secret: 'SUPER_SECRET_KEY',
      
      signOptions: { expiresIn: '7d' },
    }),
    UsersModule,
    AuthModule,
    JobsModule,
    ProfilesModule,
    ApplicationsModule,
    SavedJobsModule,
    AdminModule,
    NotificationsModule,
    ScheduleModule.forRoot(),
  ],
  providers: [JobsGateway],
})
export class AppModule {}
