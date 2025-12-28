import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Job } from '../jobs/job.entity';

@Entity()
export class SavedJob {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @ManyToOne(() => Job, { eager: true })
  job: Job;

  @CreateDateColumn()
  savedAt: Date;
}
