import { 
  Body,
  Controller,
  Patch,
  Param,
  Get,
  Post,
  Req,
  UseGuards,
  Query,
  ParseIntPipe
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './create-job.dto';
import { ProfilesService } from '../profiles/profiles.service';
import { UpdateJobStatusDto } from './dto/update-status.dto';

@Controller('jobs')
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly profilesService: ProfilesService,
  ) {}

  // 🟣 Recruiter creates job
  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('recruiter')
  create(@Body() dto: CreateJobDto, @Req() req: any) {
    return this.jobsService.create(dto, req.user.id);
  }

  // 🟡 Public — list jobs
  @Get()
  findAll() {
    return this.jobsService.findAll();
  }

  // 🟢 Personalized recommendations
  @UseGuards(AuthGuard('jwt'))
  @Get('recommend')
  async recommend(@Req() req: any) {
    const profile = await this.profilesService.getProfile(req.user.id);
    return this.jobsService.recommendForUser(req.user, profile);
  }

  // � Get matched candidates for a job (Recruiter only)
  @Get(':id/matched-candidates')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('recruiter')
  async getMatchedCandidates(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.jobsService.getMatchedCandidates(id, req.user.id);
  }

  // �🔍 Search jobs
  @Get('search')
  search(@Query() query) {
    return this.jobsService.searchJobs(query);
  }

  // 🟠 Recruiter updates job status
  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('recruiter')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateJobStatusDto,
    @Req() req: any,
  ) {
    return this.jobsService.updateStatus(id, body.status, req.user.id);
  }
}
