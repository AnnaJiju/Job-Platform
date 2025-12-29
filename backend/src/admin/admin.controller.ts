import { Body, Controller, Get, Param, Patch, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  // ---------- USERS ----------
  @Get('users')
  getUsers() {
    return this.adminService.findAllUsers();
  }

  @Patch('users/:id/status')
  updateUserStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ) {
    return this.adminService.updateUserStatus(id, status);
  }

  // ---------- JOBS ----------
  @Get('jobs')
  getJobs() {
    return this.adminService.findAllJobs();
  }

  @Patch('jobs/:id/status')
  updateJobStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ) {
    return this.adminService.updateJobStatus(id, status);
  }

  @Delete('jobs/:id')
  deleteJob(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteJob(id);
  }

  @Get('analytics')
  getAnalytics() {
    return this.adminService.getAnalytics();
  }
}
