import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

@ApiTags('Notifications')
@ApiBearerAuth('JWT-auth')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private notificationsService: NotificationsService,
    private prisma: PrismaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lister mes notifications' })
  async getUserNotifications(@Request() req: AuthenticatedRequest) {
    const userId = req.user.id;
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const unreadCount = await this.prisma.notification.count({
      where: { userId, read: false },
    });

    return { notifications, unreadCount };
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Marquer une notification comme lue' })
  async markAsRead(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const userId = req.user.id;
    await this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
    return { success: true, message: 'Notification marquée comme lue' };
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: 'Tout marquer comme lu' })
  async markAllAsRead(@Request() req: AuthenticatedRequest) {
    const userId = req.user.id;
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return { success: true, message: 'Toutes les notifications marquées comme lues' };
  }

  @Post('test')
  @ApiOperation({ summary: 'Envoyer une notification de test (auth requis)' })
  async sendTestNotification(@Request() req: AuthenticatedRequest) {
    const userId = req.user.id;
    
    const notification = await this.notificationsService.createNotification({
      userId,
      title: 'Test de notification',
      message: 'Ceci est une notification de test',
      type: 'info',
    });

    return {
      success: true,
      notification,
    };
  }
}
