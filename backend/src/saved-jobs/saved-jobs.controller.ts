import { Controller, Post, Delete, Get, Param, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { SavedJobsService } from './saved-jobs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class SavedJobsController {
  constructor(private readonly service: SavedJobsService) {}

  @Post(':jobId/save')
  save(@Param('jobId', ParseIntPipe) jobId: number, @Req() req) {
    return this.service.saveJob(req.user.id, jobId);
  }

  @Delete(':jobId/save')
  remove(@Param('jobId', ParseIntPipe) jobId: number, @Req() req) {
    return this.service.removeSaved(req.user.id, jobId);
  }

  @Get('saved')
  list(@Req() req) {
    return this.service.findForUser(req.user.id);
  }
}
