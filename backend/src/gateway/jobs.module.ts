import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JobsGateway } from './jobs.gateway';

@Module({
  imports: [
    JwtModule.register({
      secret: 'SUPER_SECRET_KEY',   // 🔴 use SAME as auth module
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [JobsGateway],
  exports: [JobsGateway],
})
export class JobsGatewayModule {}
