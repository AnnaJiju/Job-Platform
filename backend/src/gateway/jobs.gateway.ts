import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { UnauthorizedException } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class JobsGateway {

  @WebSocketServer()
  server: Server;

  constructor(private jwtService: JwtService) {}
  
   handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;

      if (!token) throw new UnauthorizedException('No token');

      const payload = this.jwtService.verify(token);

      client.data.userId = payload.sub;
      client.data.role = payload.role;

      if (payload.role === 'recruiter') {
        client.join(`recruiter_${payload.sub}`);
      } else {
        client.join(`user_${payload.sub}`);
      }

      console.log(
        `Connected: user ${payload.sub} as ${payload.role}`
      );

    } catch (e) {
      console.log('WS auth error');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('register')
  handleRegister(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: number; role: string }
  ) {
    if (data.role === 'recruiter') {
      client.join(`recruiter_${data.userId}`);
      console.log(`Recruiter joined room recruiter_${data.userId}`);
    } else {
      client.join(`user_${data.userId}`);
      console.log(`User joined room user_${data.userId}`);
    }

    client.emit('registered', { ok: true });
  }

  // OPTIONAL TEST EVENT
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { time: new Date() });
  }

  // 🔵 Notify job seekers of new job
  notifyNewJob(job: any) {
    if (!this.server) return; 
    this.server.emit('job:new', job);
  }

  // 🟣 Notify job seeker match
  notifyMatch(userId: number, job: any) {
    this.server.to(`user_${userId}`).emit('job:match', job);
  }

  // 🟡 Notify recruiter new application
  notifyRecruiter(recruiterId: number, app: any) {
    this.server.to(`recruiter_${recruiterId}`).emit('app:new', app);
  }

  // 🟢 Notify job seeker application status update
  notifyStatus(userId: number, update: any) {
    this.server.to(`user_${userId}`).emit('app:status', update);
  }
}
