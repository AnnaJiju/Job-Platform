import { Body, Controller, Get, Post, Req, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
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

  // 📄 Upload Resume
  @Post('resume')
  @UseInterceptors(
    FileInterceptor('resume', {
      storage: diskStorage({
        destination: './uploads/resumes',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `resume-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(pdf|doc|docx)$/)) {
          return cb(new BadRequestException('Only PDF, DOC, and DOCX files are allowed'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadResume(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const resumeUrl = `/uploads/resumes/${file.filename}`;
    return this.profilesService.updateResume(req.user.id, resumeUrl);
  }
}
