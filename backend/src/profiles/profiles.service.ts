import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './profile.entity';
import { CreateProfileDto } from './create-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private profilesRepo: Repository<Profile>,
  ) {}

  async upsertProfile(userId: number, dto: CreateProfileDto) {
    let profile = await this.profilesRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!profile) {
      profile = this.profilesRepo.create({
        ...dto,
        user: { id: userId } as any,
      });
    } else {
      Object.assign(profile, dto);
    }

    return this.profilesRepo.save(profile);
  }

  async getProfile(userId: number) {
    return this.profilesRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }
}
