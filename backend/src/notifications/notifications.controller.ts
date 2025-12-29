import { Controller, Get, Patch, Param, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  getUserNotifications(@Req() req: any) {
    return this.notificationsService.getUserNotifications(req.user.id);
  }

  @Get('unread-count')
  @UseGuards(AuthGuard('jwt'))
  getUnreadCount(@Req() req: any) {
    return this.notificationsService.getUnreadCount(req.user.id);
  }

  @Patch(':id/read')
  @UseGuards(AuthGuard('jwt'))
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(+id);
  }

  @Patch('read-all')
  @UseGuards(AuthGuard('jwt'))
  markAllAsRead(@Req() req: any) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }
}
