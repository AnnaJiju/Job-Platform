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

  @Column({
  type: 'enum',
  enum: ['open', 'closed', 'paused'],
  default: 'open',
    })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

}
