import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWithdrawalRequestDto } from './dto/create-withdrawal-request.dto';
import { UpdateWithdrawalRequestDto } from './dto/update-withdrawal-request.dto';
import { WithdrawalRequestFilterDto } from './dto/withdrawal-request-filter.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UpdateWithdrawalStatusDto } from './dto/update-withdrawal-status.dto';

@Injectable()
export class WithdrawalRequestsService {
  constructor(private prisma: PrismaService) {}

  async create(createWithdrawalRequestDto: CreateWithdrawalRequestDto, userId: string) {
    const { campaignId, amount, bankInfoId, justification, documents } = createWithdrawalRequestDto;

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

    return this.prisma.withdrawalRequest.create({
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
        },
      });
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