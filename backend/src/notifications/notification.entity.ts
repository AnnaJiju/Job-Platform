import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  type: string; // 'newJob', 'recommendedJob', 'applicationUpdate', 'jobReopened', 'jobStatus'

  @Column()
  message: string;

  @Column({ type: 'json', nullable: true })
  data: any; // Additional data like jobId, matchScore, etc.

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
