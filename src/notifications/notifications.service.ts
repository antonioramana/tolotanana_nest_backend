import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { PrismaService } from '../prisma/prisma.service';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
  data?: any; // Données supplémentaires (ID de campagne, etc.)
}

@Injectable()
export class NotificationsService {
  constructor(
    private notificationsGateway: NotificationsGateway,
    private prisma: PrismaService,
  ) {}

  async createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) {
    // Persist to DB
    const created = await this.prisma.notification.create({
      data: {
        userId: notification.userId,
        title: notification.title,
        message: notification.message,
        type: notification.type as any,
        data: notification.data as any,
      },
    });

    const newNotification: Notification = {
      id: created.id,
      userId: created.userId,
      title: created.title,
      message: created.message,
      type: created.type as any,
      read: created.read,
      createdAt: created.createdAt,
      data: created.data as any,
    };

    // Emit realtime
    this.notificationsGateway.sendToUser(notification.userId, newNotification);

    return newNotification;
  }

  async sendDonationNotification(campaignCreatorId: string, donationData: any) {
    return this.createNotification({
      userId: campaignCreatorId,
      title: 'Nouveau don reçu !',
      message: `Vous avez reçu un don de ${donationData.amount} Ar de ${donationData.donorName}`,
      type: 'success',
      data: {
        campaignId: donationData.campaignId,
        donationId: donationData.donationId,
        amount: donationData.amount,
      },
    });
  }

  async sendCampaignUpdateNotification(followersIds: string[], campaignData: any) {
    const notifications = followersIds.map(userId => 
      this.createNotification({
        userId,
        title: 'Mise à jour de campagne',
        message: `La campagne "${campaignData.title}" a été mise à jour`,
        type: 'info',
        data: {
          campaignId: campaignData.id,
          updateId: campaignData.updateId,
        },
      })
    );

    return Promise.all(notifications);
  }

  async sendCampaignGoalReachedNotification(campaignCreatorId: string, campaignData: any) {
    return this.createNotification({
      userId: campaignCreatorId,
      title: 'Objectif atteint ! 🎉',
      message: `Félicitations ! Votre campagne "${campaignData.title}" a atteint son objectif`,
      type: 'success',
      data: {
        campaignId: campaignData.id,
        goalAmount: campaignData.goalAmount,
        currentAmount: campaignData.currentAmount,
      },
    });
  }

  async sendWithdrawalRequestNotification(adminIds: string[], requestData: any) {
    const notifications = adminIds.map(userId =>
      this.createNotification({
        userId,
        title: 'Nouvelle demande de retrait',
        message: `${requestData.userName} demande un retrait de ${requestData.amount} Ar`,
        type: 'warning',
        data: {
          withdrawalRequestId: requestData.id,
          userId: requestData.userId,
          amount: requestData.amount,
        },
      })
    );

    return Promise.all(notifications);
  }

  async sendWithdrawalApprovedNotification(userId: string, requestData: any) {
    return this.createNotification({
      userId,
      title: 'Demande de retrait approuvée',
      message: `Votre demande de retrait de ${requestData.amount} Ar a été approuvée`,
      type: 'success',
      data: {
        withdrawalRequestId: requestData.id,
        amount: requestData.amount,
      },
    });
  }

  async sendWithdrawalRejectedNotification(userId: string, requestData: any) {
    return this.createNotification({
      userId,
      title: 'Demande de retrait rejetée',
      message: `Votre demande de retrait de ${requestData.amount} Ar a été rejetée. Raison: ${requestData.reason}`,
      type: 'error',
      data: {
        withdrawalRequestId: requestData.id,
        amount: requestData.amount,
        reason: requestData.reason,
      },
    });
  }

  async sendSystemNotification(userIds: string[], title: string, message: string, type: Notification['type'] = 'info') {
    const notifications = userIds.map(userId =>
      this.createNotification({
        userId,
        title,
        message,
        type,
      })
    );

    return Promise.all(notifications);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
