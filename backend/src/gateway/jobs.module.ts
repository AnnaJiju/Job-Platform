import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JobsGateway } from './jobs.gateway';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    JwtModule.register({
      secret: 'SUPER_SECRET_KEY',   // 🔴 use SAME as auth module
      signOptions: { expiresIn: '7d' },
    }),
    NotificationsModule,
  ],
  providers: [JobsGateway],
  exports: [JobsGateway],
})
export class JobsGatewayModule {}
