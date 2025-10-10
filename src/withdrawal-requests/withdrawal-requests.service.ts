import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcryptjs';
import { CreateWithdrawalRequestDto } from './dto/create-withdrawal-request.dto';
import { UpdateWithdrawalRequestDto } from './dto/update-withdrawal-request.dto';
import { WithdrawalRequestFilterDto } from './dto/withdrawal-request-filter.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UpdateWithdrawalStatusDto } from './dto/update-withdrawal-status.dto';

@Injectable()
export class WithdrawalRequestsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private emailService: EmailService,
  ) {}

  async create(createWithdrawalRequestDto: CreateWithdrawalRequestDto, userId: string) {
    const { campaignId, amount, bankInfoId, justification, documents, password } = createWithdrawalRequestDto;

    // Vérifier le mot de passe de l'utilisateur
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      throw new ForbiddenException('Mot de passe incorrect');
    }

    // Vérifier que la campagne appartient à l'utilisateur
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Campagne non trouvée');
    }

    if (campaign.createdBy !== userId) {
      throw new ForbiddenException('Vous ne pouvez faire une demande de retrait que pour vos propres campagnes');
    }

    // Vérifier que le montant est disponible
    if (Number(amount) > Number(campaign.currentAmount)) {
      throw new BadRequestException('Montant demandé supérieur au montant disponible');
    }

    // Vérifier que les informations bancaires appartiennent à l'utilisateur
    const bankInfo = await this.prisma.bankInfo.findUnique({
      where: { id: bankInfoId },
    });

    if (!bankInfo || bankInfo.userId !== userId) {
      throw new ForbiddenException('Informations bancaires non valides');
    }

    const created = await this.prisma.withdrawalRequest.create({
      data: {
        campaignId,
        requestedBy: userId,
        amount,
        bankInfoId,
        justification,
        documents,
      },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
          },
        },
        bankInfo: true,
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    const requesterFullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;

    // Notifier les admins d'une nouvelle demande
    const admins = await this.prisma.user.findMany({ where: { role: 'admin' }, select: { id: true } });
    const adminIds = admins.map(a => a.id);
    if (adminIds.length > 0) {
      await this.notificationsService.sendWithdrawalRequestNotification(adminIds, {
        id: created.id,
        userId,
        amount,
        userName: requesterFullName,
      });
    }

    // Notification à l'utilisateur: demande en cours
    await this.notificationsService.createNotification({
      userId,
      title: 'Demande de retrait reçue',
      message: `Votre demande de retrait de ${amount} Ar est en cours de traitement (24–48h).`,
      type: 'info',
    });

    // Email de confirmation à l'utilisateur
    try {
      await (this.emailService as any).sendMailWithRetry({
        from: { name: 'TOLOTANANA', address: process.env.EMAIL_FROM || 'support@tolotanana.com' },
        to: user.email,
        subject: 'Demande de retrait reçue',
        html: `<p>Votre demande de retrait de <strong>${amount} Ar</strong> a été reçue et sera traitée sous 24 à 48h.</p>`,
      });
    } catch {}

    return created;
  }

  async findAll(filters: WithdrawalRequestFilterDto, pagination: PaginationDto) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.campaignId) {
      where.campaignId = filters.campaignId;
    }

    if (filters.requestedBy) {
      where.requestedBy = filters.requestedBy;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.minAmount) {
      where.amount = { gte: filters.minAmount };
    }

    if (filters.maxAmount) {
      where.amount = { ...where.amount, lte: filters.maxAmount };
    }

    let orderBy: any = { createdAt: 'desc' };

    if (filters.sortBy === 'amount') {
      orderBy = { amount: filters.sortOrder || 'desc' };
    } else if (filters.sortBy === 'processedAt') {
      orderBy = { processedAt: filters.sortOrder || 'desc' };
    }

    const [requests, total] = await Promise.all([
      this.prisma.withdrawalRequest.findMany({
        where,
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
            },
          },
          bankInfo: true,
          requester: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          processor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.withdrawalRequest.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: requests,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string) {
    const request = await this.prisma.withdrawalRequest.findUnique({
      where: { id },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            currentAmount: true,
          },
        },
        bankInfo: true,
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        processor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Demande de retrait non trouvée');
    }

    return request;
  }

  async updateStatus(id: string, updateStatusDto: UpdateWithdrawalStatusDto, adminId: string) {
    const { status, notes } = updateStatusDto;

    const request = await this.prisma.withdrawalRequest.findUnique({
      where: { id },
      include: {
        campaign: true,
      },
    });

    if (!request) {
      throw new NotFoundException('Demande de retrait non trouvée');
    }

    if (request.status !== 'pending') {
      throw new BadRequestException('Cette demande a déjà été traitée');
    }

    const updatedRequest = await this.prisma.withdrawalRequest.update({
      where: { id },
      data: {
        status,
        notes,
        processedAt: new Date(),
        processedBy: adminId,
      },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            currentAmount: true,
          },
        },
        bankInfo: true,
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        processor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Si approuvé, déduire le montant du solde de la campagne
    if (status === 'approved') {
      await this.prisma.campaign.update({
        where: { id: request.campaignId },
        data: {
          currentAmount: {
            decrement: Number(request.amount),
          },
          totalRaised: {
            increment: Number(request.amount), // Ajouter au montant total collecté
          },
        },
      });

      const newCampaignState = await this.prisma.campaign.findUnique({
        where: { id: request.campaignId },
        select: { currentAmount: true, totalRaised: true },
      });

      // Notification + email approuvé
      await this.notificationsService.sendWithdrawalApprovedNotification(request.requestedBy, {
        id: updatedRequest.id,
        amount: request.amount,
      });
      try {
        await (this.emailService as any).sendMailWithRetry({
          from: { name: 'TOLOTANANA', address: process.env.EMAIL_FROM || 'support@tolotanana.com' },
          to: updatedRequest.requester.email,
          subject: 'Demande de retrait approuvée',
          html: `<p>Votre demande de retrait de <strong>${request.amount} Ar</strong> a été approuvée.</p><p>Montant restant sur la campagne: <strong>${Number(newCampaignState?.currentAmount || 0)} Ar</strong></p>`,
        });
      } catch {}
    }
    if (status === 'rejected') {
      // Notification + email rejeté
      await this.notificationsService.sendWithdrawalRejectedNotification(request.requestedBy, {
        id: updatedRequest.id,
        amount: request.amount,
        reason: notes,
      });
      try {
        await (this.emailService as any).sendMailWithRetry({
          from: { name: 'TOLOTANANA', address: process.env.EMAIL_FROM || 'support@tolotanana.com' },
          to: updatedRequest.requester.email,
          subject: 'Demande de retrait rejetée',
          html: `<p>Votre demande de retrait de <strong>${request.amount} Ar</strong> a été rejetée.<br/>Raison: ${notes || '—'}</p>`,
        });
      } catch {}
    }

    return updatedRequest;
  }

  async getUserRequests(userId: string, pagination: PaginationDto) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      this.prisma.withdrawalRequest.findMany({
        where: { requestedBy: userId },
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
            },
          },
          bankInfo: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.withdrawalRequest.count({
        where: { requestedBy: userId },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: requests,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async remove(id: string, userId: string) {
    const request = await this.prisma.withdrawalRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Demande de retrait non trouvée');
    }

    if (request.requestedBy !== userId) {
      throw new ForbiddenException('Vous ne pouvez supprimer que vos propres demandes');
    }

    if (request.status !== 'pending') {
      throw new BadRequestException('Impossible de supprimer une demande déjà traitée');
    }

    await this.prisma.withdrawalRequest.delete({
      where: { id },
    });
  }
}