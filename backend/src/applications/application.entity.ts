import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Job } from '../jobs/job.entity';

@Entity()
export class Application {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.id)
  applicant: User;

  @ManyToOne(() => Job, job => job.id)
  job: Job;

  @Column({ default: 'pending' })
  status: string;

  @CreateDateColumn()
  appliedAt: Date;
}
