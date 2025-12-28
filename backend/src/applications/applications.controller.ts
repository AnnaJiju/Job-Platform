import { Controller, Post, Param, Req, UseGuards, ParseIntPipe, Get, Patch, Body } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private readonly appsService: ApplicationsService) {}

  @Post(':jobId')
  apply(
    @Param('jobId', ParseIntPipe) jobId: number,
    @Req() req: any
  ) {
    const userId = req.user.id;
    return this.appsService.apply(userId, jobId);
  }

  @Get('job/:jobId')
  @UseGuards(JwtAuthGuard)
    getApplicants(@Param('jobId', ParseIntPipe) jobId: number) {
    return this.appsService.getApplicants(jobId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMine(@Req() req) {
    const userId = req.user.id;
    return this.appsService.getMyApplications(userId);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
){
    return this.appsService.updateStatus(id, status as any);
}

}
