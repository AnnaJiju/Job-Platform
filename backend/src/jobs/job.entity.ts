import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Job {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  company: string;

  @Column({ nullable: true })
  skills: string; 

  @Column({ nullable: true })
  location: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  salaryMin: number;

  @Column({ nullable: true })
  salaryMax: number;

  @Column({ nullable: true })
  experienceRequired: number;  // in years

  @Column({
    type: 'enum',
    enum: ['full-time', 'part-time', 'contract', 'remote', 'hybrid'],
    default: 'full-time',
  })
  jobType: string;

  @Column()
  postedBy: number;   // recruiter user id

  @Column({ nullable: true })
  source: string;  // e.g., 'Adzuna', 'Reed', 'RemoteOK', 'Manual'

  @Column({ nullable: true })
  externalId: string;  // ID from external source to prevent duplicates

  @Column({ nullable: true })
  sourceUrl: string;  // Original job posting URL

  @Column({
  type: 'enum',
  enum: ['open', 'closed', 'paused'],
  default: 'open',
    })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

}
