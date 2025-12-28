import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export type UserRole = 'jobseeker' | 'recruiter' | 'admin';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'varchar',
    default: 'jobseeker',
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: ['active', 'suspended'],
    default: 'active',
  })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

}
