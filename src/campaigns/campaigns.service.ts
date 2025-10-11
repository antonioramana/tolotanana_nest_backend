import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';
import { FavoritesService } from '../favorites/favorites.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { CampaignFilterDto } from './dto/campaign-filter.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UpdateCampaignStatusDto } from './dto/update-campaign-status.dto';
import { CreateCampaignUpdateDto } from './dto/create-campaign-update.dto';
import { UpdateThankYouMessageDto } from './dto/update-thank-you-message.dto';

@Injectable()
export class CampaignsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private emailService: EmailService,
    private favoritesService: FavoritesService,
  ) {}

  // Fonctions utilitaires pour gérer le message de remerciement dans la description
  private extractThankYouMessage(description: string): string | null {
    if (description.includes('|||')) {
      const parts = description.split('|||');
      return parts.length > 1 ? parts[1] : null;
    }
    return null;
  }

  private getOriginalDescription(description: string): string {
    if (description.includes('|||')) {
      return description.split('|||')[0];
    }
    return description;
  }

  async create(createCampaignDto: CreateCampaignDto, userId: string) {
    const created = await this.prisma.campaign.create({
      data: {
        ...createCampaignDto,
        createdBy: userId,
      },
      include: {
        category: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            email: true,
          },
        },
      },
    });

    // Notifier les admins d'une nouvelle campagne
    const admins = await this.prisma.user.findMany({ where: { role: 'admin' }, select: { id: true, email: true, firstName: true } });
    const adminIds = admins.map(a => a.id);
    if (adminIds.length > 0) {
      await this.notificationsService.sendSystemNotification(adminIds, 'Nouvelle campagne créée', `La campagne "${created.title}" a été créée et nécessite une validation.`, 'info');
    }
    
    // Envoyer email aux admins
    try {
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        await (this.emailService as any).sendMailWithRetry({
          from: { name: 'TOLOTANANA', address: process.env.EMAIL_FROM || 'support@tolotanana.com' },
          to: adminEmail,
          subject: 'Nouvelle campagne créée',
          html: `<p>La campagne <strong>${created.title}</strong> vient d'être créée et attend validation.</p>`,
        });
      }
    } catch {}

    // Notifier le créateur de la campagne
    await this.notificationsService.createNotification({
      userId: created.createdBy,
      title: 'Campagne créée avec succès',
      message: `Votre campagne "${created.title}" a été créée et est en attente de validation.`,
      type: 'success',
      data: { campaignId: created.id },
    });

    // Envoyer email au créateur
    try {
      if (created.creator.email) {
        await (this.emailService as any).sendMailWithRetry({
          from: { name: 'TOLOTANANA', address: process.env.EMAIL_FROM || 'support@tolotanana.com' },
          to: created.creator.email,
          subject: 'Campagne créée avec succès',
          html: `<p>Bonjour ${created.creator.firstName || ''},<br/>Votre campagne <strong>${created.title}</strong> a été créée avec succès et est en attente de validation par nos équipes.</p>`,
        });
      }
    } catch {}

    return created;
  }

  async findAll(filters: CampaignFilterDto, pagination: PaginationDto, userId?: string) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.minAmount) {
      where.targetAmount = { gte: filters.minAmount };
    }

    if (filters.maxAmount) {
      where.targetAmount = { ...where.targetAmount, lte: filters.maxAmount };
    }

    let orderBy: any = { createdAt: 'desc' };

    if (filters.sortBy === 'target_amount') {
      orderBy = { targetAmount: filters.sortOrder || 'asc' };
    } else if (filters.sortBy === 'current_amount') {
      orderBy = { currentAmount: filters.sortOrder || 'desc' };
    } else if (filters.sortBy === 'deadline') {
      orderBy = { deadline: filters.sortOrder || 'asc' };
    } else if (filters.sortBy === 'rating') {
      orderBy = { rating: filters.sortOrder || 'desc' };
    }

    const [campaigns, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where,
        include: {
          category: true,
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          _count: {
            select: { donations: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.campaign.count({ where }),
    ]);

    // Ajouter isFavoris pour chaque campagne si userId est fourni
    const campaignsWithFavorites = await Promise.all(
      campaigns.map(async (campaign) => {
        const isFavoris = userId ? await this.favoritesService.isFavorite(campaign.id, userId) : false;
        return {
          ...campaign,
          isFavoris,
        };
      })
    );

    const totalPages = Math.ceil(total / limit);

    return {
      data: campaignsWithFavorites,
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

  async findMyCampaigns(userId: string, filters: CampaignFilterDto, pagination: PaginationDto) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {
      createdBy: userId, // Filter by user's campaigns
    };

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.minAmount) {
      where.targetAmount = { gte: filters.minAmount };
    }

    if (filters.maxAmount) {
      where.targetAmount = { ...where.targetAmount, lte: filters.maxAmount };
    }

    let orderBy: any = { createdAt: 'desc' };

    if (filters.sortBy === 'target_amount') {
      orderBy = { targetAmount: filters.sortOrder || 'asc' };
    } else if (filters.sortBy === 'current_amount') {
      orderBy = { currentAmount: filters.sortOrder || 'desc' };
    } else if (filters.sortBy === 'deadline') {
      orderBy = { deadline: filters.sortOrder || 'asc' };
    } else if (filters.sortBy === 'rating') {
      orderBy = { rating: filters.sortOrder || 'desc' };
    }

    const [campaigns, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where,
        include: {
          category: true,
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          _count: {
            select: { donations: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.campaign.count({ where }),
    ]);

    // Ajouter isFavoris pour chaque campagne
    const campaignsWithFavorites = await Promise.all(
      campaigns.map(async (campaign) => {
        const isFavoris = await this.favoritesService.isFavorite(campaign.id, userId);
        return {
          ...campaign,
          isFavoris,
        };
      })
    );

    const totalPages = Math.ceil(total / limit);

    return {
      data: campaignsWithFavorites,
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

  async findOne(id: string, userId?: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        category: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            isVerified: true,
          },
        },
        donations: {
          // removed isAnonymous filter to include all donations
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            donor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        updates: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: { donations: true, favorites: true },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campagne non trouvée');
    }

    // Anonymize donor information in response when donation is anonymous
    const donations = (campaign.donations || []).map((d: any) =>
      d.isAnonymous
        ? { ...d, donor: null }
        : d,
    );

    // Calculer les statistiques
    const stats = await this.getCampaignStats(id);

    // Ajouter le message de remerciement extrait
    const thankYouMessage = this.extractThankYouMessage(campaign.description);
    const originalDescription = this.getOriginalDescription(campaign.description);

    // Ajouter isFavoris si userId est fourni
    const isFavoris = userId ? await this.favoritesService.isFavorite(id, userId) : false;

    return {
      ...campaign,
      description: originalDescription,
      thankYouMessage,
      donations,
      stats,
      isFavoris,
    };
  }

  async update(id: string, updateCampaignDto: UpdateCampaignDto, userId: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      throw new NotFoundException('Campagne non trouvée');
    }

    if (campaign.createdBy !== userId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à modifier cette campagne');
    }

    return this.prisma.campaign.update({
      where: { id },
      data: updateCampaignDto,
      include: {
        category: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
  }

  async updateStatus(id: string, updateStatusDto: UpdateCampaignStatusDto, userId: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      throw new NotFoundException('Campagne non trouvée');
    }

    if (campaign.createdBy !== userId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à modifier cette campagne');
    }

    return this.prisma.campaign.update({
      where: { id },
      data: { status: updateStatusDto.status },
    });
  }

  async adminUpdateStatus(id: string, updateStatusDto: UpdateCampaignStatusDto) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id } });
    if (!campaign) {
      throw new NotFoundException('Campagne non trouvée');
    }
    const updated = await this.prisma.campaign.update({
      where: { id },
      data: { status: updateStatusDto.status },
    });

    // Notifier le propriétaire lors de l'activation
    if (updateStatusDto.status === 'active') {
      // Notification système au propriétaire
      await this.notificationsService.createNotification({
        userId: campaign.createdBy,
        title: 'Campagne activée',
        message: `Votre campagne "${campaign.title}" a été activée.`,
        type: 'success',
        data: { campaignId: campaign.id },
      });
      
      // Email au propriétaire
      try {
        const owner = await this.prisma.user.findUnique({ where: { id: campaign.createdBy }, select: { email: true, firstName: true } });
        if (owner?.email) {
          await (this.emailService as any).sendMailWithRetry({
            from: { name: 'TOLOTANANA', address: process.env.EMAIL_FROM || 'support@tolotanana.com' },
            to: owner.email,
            subject: 'Votre campagne a été activée',
            html: `<p>Bonjour ${owner.firstName || ''},<br/>Votre campagne <strong>${campaign.title}</strong> est maintenant active.</p>`,
          });
        }
      } catch {}
    }

    return updated;
  }

  async remove(id: string, userId: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      throw new NotFoundException('Campagne non trouvée');
    }

    if (campaign.createdBy !== userId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à supprimer cette campagne');
    }

    await this.prisma.campaign.delete({
      where: { id },
    });
  }

  async toggleFavorite(campaignId: string, userId: string) {
    return this.favoritesService.toggleFavorite(campaignId, userId);
  }

  async addToFavorites(campaignId: string, userId: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Campagne non trouvée');
    }

    try {
      await this.prisma.favorite.create({
        data: {
          userId,
          campaignId,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ForbiddenException('Cette campagne est déjà dans vos favoris');
      }
      throw error;
    }
  }

  async removeFromFavorites(campaignId: string, userId: string) {
    try {
      await this.prisma.favorite.delete({
        where: {
          userId_campaignId: {
            userId,
            campaignId,
          },
        },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Cette campagne n\'est pas dans vos favoris');
      }
      throw error;
    }
  }

  async createUpdate(campaignId: string, createUpdateDto: CreateCampaignUpdateDto, userId: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Campagne non trouvée');
    }

    if (campaign.createdBy !== userId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à publier des actualités pour cette campagne');
    }

    return this.prisma.campaignUpdate.create({
      data: {
        ...createUpdateDto,
        campaignId,
      },
    });
  }

  async getUpdates(campaignId: string, pagination: PaginationDto) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    // Vérification simplifiée de l'existence de la campagne
    const campaignExists = await this.prisma.campaign.count({
      where: { id: campaignId },
    });

    if (campaignExists === 0) {
      throw new NotFoundException('Campagne non trouvée');
    }

    const [updates, total] = await Promise.all([
      this.prisma.campaignUpdate.findMany({
        where: { campaignId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.campaignUpdate.count({
        where: { campaignId },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: updates,
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

  async deleteUpdate(campaignId: string, updateId: string, userId: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Campagne non trouvée');
    }

    if (campaign.createdBy !== userId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à supprimer des actualités de cette campagne');
    }

    const update = await this.prisma.campaignUpdate.findUnique({
      where: { id: updateId },
    });

    if (!update) {
      throw new NotFoundException('Actualité non trouvée');
    }

    if (update.campaignId !== campaignId) {
      throw new ForbiddenException('Cette actualité n\'appartient pas à cette campagne');
    }

    await this.prisma.campaignUpdate.delete({
      where: { id: updateId },
    });

    return { message: 'Actualité supprimée avec succès' };
  }

  async getCampaignDonations(campaignId: string, pagination: PaginationDto) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Campagne non trouvée');
    }

    const [donations, total] = await Promise.all([
      this.prisma.donation.findMany({
        where: { 
          campaignId,
          status: 'completed',
        },
        include: {
          donor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.donation.count({
        where: { 
          campaignId,
          status: 'completed',
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: donations,
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

  private async getCampaignStats(campaignId: string) {
    const [completed, pending] = await Promise.all([
      this.prisma.donation.findMany({
        where: { 
          campaignId,
          status: 'completed',
        },
        select: { amount: true },
      }),
      this.prisma.donation.findMany({
        where: {
          campaignId,
          status: 'pending',
        },
        select: { amount: true },
      })
    ]);

    const totalAmount = completed.reduce((sum, d) => sum + Number(d.amount), 0);
    const pendingAmount = pending.reduce((sum, d) => sum + Number(d.amount), 0);
    const averageDonation = completed.length > 0 ? totalAmount / completed.length : 0;

    return {
      totalDonations: completed.length,
      averageDonation,
      totalRaised: totalAmount,
      pendingAmount,
    };
  }

  async updateThankYouMessage(campaignId: string, updateThankYouMessageDto: UpdateThankYouMessageDto, userId: string) {
    // Vérifier que la campagne existe et appartient à l'utilisateur
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Campagne non trouvée');
    }

    if (campaign.createdBy !== userId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à modifier cette campagne');
    }

    // Solution temporaire : stocker le message dans la description
    // TODO: Implémenter avec une table dédiée après migration
    const updatedCampaign = await this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        // Utilisation temporaire du champ description pour stocker le message de remerciement
        // Format: "DESCRIPTION_ORIGINALE|||THANK_YOU_MESSAGE"
        description: campaign.description.includes('|||') 
          ? campaign.description.split('|||')[0] + '|||' + updateThankYouMessageDto.thankYouMessage
          : campaign.description + '|||' + updateThankYouMessageDto.thankYouMessage,
      },
      include: {
        category: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    return {
      message: 'Message de remerciement mis à jour avec succès',
      campaign: updatedCampaign,
    };
  }

  async recalculateCampaignAmount(campaignId: string) {
    // Vérifier que la campagne existe
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Campagne non trouvée');
    }

    // Calculer le montant réel basé sur les dons "completed"
    const completedDonations = await this.prisma.donation.findMany({
      where: {
        campaignId,
        status: 'completed',
      },
      select: {
        amount: true,
      },
    });

    const realAmount = completedDonations.reduce((sum, donation) => {
      return sum + Number(donation.amount);
    }, 0);

    // Mettre à jour le montant
    const updatedCampaign = await this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        currentAmount: realAmount,
      },
      include: {
        category: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    return {
      message: 'Montant collecté recalculé avec succès',
      campaign: updatedCampaign,
      previousAmount: Number(campaign.currentAmount),
      newAmount: realAmount,
      difference: realAmount - Number(campaign.currentAmount),
    };
  }

  async recalculateAllCampaignAmounts() {
    const campaigns = await this.prisma.campaign.findMany({
      select: {
        id: true,
        title: true,
        currentAmount: true,
      },
    });

    const results = [];

    for (const campaign of campaigns) {
      try {
        const result = await this.recalculateCampaignAmount(campaign.id);
        results.push({
          campaignId: campaign.id,
          title: campaign.title,
          success: true,
          ...result,
        });
      } catch (error: any) {
        results.push({
          campaignId: campaign.id,
          title: campaign.title,
          success: false,
          error: error.message,
        });
      }
    }

    return {
      message: 'Recalcul terminé',
      totalCampaigns: campaigns.length,
      results,
    };
  }

  async recalculateCampaignTotalRaised(campaignId: string) {
    // Vérifier que la campagne existe
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Campagne non trouvée');
    }

    // Calculer le montant total des retraits approuvés
    const approvedWithdrawals = await this.prisma.withdrawalRequest.findMany({
      where: {
        campaignId,
        status: 'approved',
      },
      select: {
        amount: true,
      },
    });

    const totalWithdrawals = approvedWithdrawals.reduce((sum, withdrawal) => {
      return sum + Number(withdrawal.amount);
    }, 0);

    // Calculer le montant total collecté (actuel + retraits)
    const totalRaised = Number(campaign.currentAmount) + totalWithdrawals;

    // Mettre à jour le montant total collecté
    const updatedCampaign = await this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        totalRaised: totalRaised,
      },
      include: {
        category: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    return {
      message: 'Montant total collecté recalculé avec succès',
      campaign: updatedCampaign,
      previousTotalRaised: Number(campaign.totalRaised || 0),
      newTotalRaised: totalRaised,
      currentAmount: Number(campaign.currentAmount),
      totalWithdrawals: totalWithdrawals,
      difference: totalRaised - Number(campaign.totalRaised || 0),
    };
  }

  async recalculateAllCampaignTotalRaised() {
    const campaigns = await this.prisma.campaign.findMany({
      select: {
        id: true,
        title: true,
        totalRaised: true,
      },
    });

    const results = [];

    for (const campaign of campaigns) {
      try {
        const result = await this.recalculateCampaignTotalRaised(campaign.id);
        results.push({
          campaignId: campaign.id,
          title: campaign.title,
          success: true,
          ...result,
        });
      } catch (error: any) {
        results.push({
          campaignId: campaign.id,
          title: campaign.title,
          success: false,
          error: error.message,
        });
      }
    }

    return {
      message: 'Recalcul du montant total collecté terminé',
      totalCampaigns: campaigns.length,
      results,
    };
  }
}