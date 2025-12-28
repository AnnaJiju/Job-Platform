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
