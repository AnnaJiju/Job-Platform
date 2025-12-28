import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  headline: string;

  @Column({ nullable: true })
  experience: number;

  @Column({ nullable: true })
  skills: string; // comma separated to keep it simple for now

  @Column({ nullable: true })
  resumeUrl: string;
}
