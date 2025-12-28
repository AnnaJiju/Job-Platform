import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './create-profile.dto';

@Controller('profile')
@UseGuards(AuthGuard('jwt'))
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  // 🟣 Create or Update Profile
  @Post()
  upsert(@Body() dto: CreateProfileDto, @Req() req: any) {
    return this.profilesService.upsertProfile(req.user.id, dto);
  }

  // 🟢 View My Profile
  @Get()
  getMine(@Req() req: any) {
    return this.profilesService.getProfile(req.user.id);
  }
}
