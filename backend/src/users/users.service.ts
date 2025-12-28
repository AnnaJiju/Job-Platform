import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async createUser(dto: CreateUserDto) {
    // Check if email already exists
    const existing = await this.usersRepo.findOne({
      where: { email: dto.email },
    });

    if (existing) {
      throw new Error('Email already registered');
    }

    // Hash password
    const hashed = await bcrypt.hash(dto.password, 10);

    const user = this.usersRepo.create({
      name: dto.name,
      email: dto.email,
      password: hashed,
      role: dto.role ?? 'jobseeker',
    });

    return this.usersRepo.save(user);
  }

  async findAll() {
    return this.usersRepo.find();
  }
  async findByEmail(email: string) {
  return this.usersRepo.findOne({ where: { email } });
  }

}
