import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepo: Repository<Notification>,
  ) {}

  async create(userId: number, type: string, message: string, data?: any) {
    const notification = this.notificationsRepo.create({
      userId,
      type,
      message,
      data,
    });
    return this.notificationsRepo.save(notification);
  }

  async getUserNotifications(userId: number) {
    return this.notificationsRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getUnreadCount(userId: number) {
    return this.notificationsRepo.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(notificationId: number) {
    await this.notificationsRepo.update(notificationId, { isRead: true });
  }

  async markAllAsRead(userId: number) {
    await this.notificationsRepo.update(
      { userId, isRead: false },
      { isRead: true }
    );
  }
}
