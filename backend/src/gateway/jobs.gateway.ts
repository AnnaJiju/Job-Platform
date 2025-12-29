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
import { NotificationsService } from '../notifications/notifications.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class JobsGateway {

  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private notificationsService: NotificationsService,
  ) {}
  
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

  // 🔵 Notify job seekers when a job reopens
  async notifyJobReopened(userId: number, jobWithScore: any) {
    if (!this.server) return;
    
    const message = `✨ ${jobWithScore.matchScore}% Match! Job reopened: ${jobWithScore.title} at ${jobWithScore.company} is now accepting applications`;
    
    // Save to database
    await this.notificationsService.create(
      userId,
      'jobReopened',
      message,
      { jobId: jobWithScore.id, matchScore: jobWithScore.matchScore }
    );
    
    // Send real-time notification
    this.server.to(`user_${userId}`).emit('job:reopened', jobWithScore);
  }

  // 🟣 Notify job seeker match
  notifyMatch(userId: number, job: any) {
    this.server.to(`user_${userId}`).emit('job:match', job);
  }

  // � Notify individual jobseeker about recommended job
  async notifyRecommendedJob(userId: number, jobWithScore: any) {
    if (!this.server) return;
    
    const message = `✨ ${jobWithScore.matchScore}% Match! New recommended job: ${jobWithScore.title} at ${jobWithScore.company}`;
    
    // Save to database
    await this.notificationsService.create(
      userId,
      'recommendedJob',
      message,
      { jobId: jobWithScore.id, matchScore: jobWithScore.matchScore }
    );
    
    // Send real-time notification
    this.server.to(`user_${userId}`).emit('job:recommended', jobWithScore);
  }

  // 🟡 Notify recruiter new application
  async notifyRecruiter(recruiterId: number, app: any) {
    const message = `New application received for ${app.job?.title || 'your job'} from ${app.applicant?.name || 'a candidate'}`;
    
    // Save to database
    await this.notificationsService.create(
      recruiterId,
      'newApplication',
      message,
      { applicationId: app.id, jobId: app.job?.id }
    );
    
    // Send real-time notification
    this.server.to(`recruiter_${recruiterId}`).emit('app:new', app);
  }

  // 🟢 Notify job seeker application status update
  async notifyStatus(userId: number, update: any) {
    const statusMessage = update.status === "approved" 
      ? `🎉 Congratulations! Your application for "${update.jobTitle}" at ${update.company} has been approved`
      : update.status === "rejected"
      ? `❌ Your application for "${update.jobTitle}" at ${update.company} was rejected`
      : `Application for "${update.jobTitle}" status updated to: ${update.status}`;
    
    // Save to database
    await this.notificationsService.create(
      userId,
      'applicationUpdate',
      statusMessage,
      { applicationId: update.appId, jobId: update.jobId, status: update.status }
    );
    
    // Send real-time notification
    this.server.to(`user_${userId}`).emit('app:status', update);
  }

  // 🟠 Notify recruiter about job status update by admin
  async notifyJobStatusUpdate(recruiterId: number, update: any) {
    const action = update.newStatus === 'paused' ? 'paused' : update.newStatus === 'closed' ? 'closed' : 'updated';
    const message = `Admin ${action} your job: "${update.jobTitle}" (Status changed from ${update.oldStatus} to ${update.newStatus})`;
    
    // Save to database
    await this.notificationsService.create(
      recruiterId,
      'jobStatusUpdate',
      message,
      { jobId: update.jobId, oldStatus: update.oldStatus, newStatus: update.newStatus, jobTitle: update.jobTitle }
    );
    
    // Send real-time notification
    this.server.to(`recruiter_${recruiterId}`).emit('job:status', update);
  }
}
