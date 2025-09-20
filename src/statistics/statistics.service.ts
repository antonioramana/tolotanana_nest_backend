import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StatisticsFilterDto } from './dto/statistics-filter.dto';

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(filters?: StatisticsFilterDto) {
    const dateFilter = this.buildDateFilter(filters);

    const [
      totalUsers,
      totalCampaigns,
      activeCampaigns,
      totalDonations,
      totalAmount,
      successfulCampaigns,
      pendingWithdrawals,
    ] = await Promise.all([
      // Total utilisateurs
      this.prisma.user.count({
        where: {
          createdAt: dateFilter,
        },
      }),

      // Total campagnes
      this.prisma.campaign.count({
        where: {
          createdAt: dateFilter,
        },
      }),

      // Campagnes actives
      this.prisma.campaign.count({
        where: {
          status: 'active',
          createdAt: dateFilter,
        },
      }),

      // Total donations
      this.prisma.donation.count({
        where: {
          status: 'completed',
          createdAt: dateFilter,
        },
      }),

      // Montant total collecté
      this.prisma.donation.aggregate({
        where: {
          status: 'completed',
          createdAt: dateFilter,
        },
        _sum: {
          amount: true,
        },
      }),

      // Campagnes réussies (objectif atteint)
      this.prisma.campaign.count({
        where: {
          status: 'completed',
          createdAt: dateFilter,
        },
      }),

      // Retraits en attente
      this.prisma.withdrawalRequest.count({
        where: {
          status: 'pending',
          createdAt: dateFilter,
        },
      }),
    ]);

    return {
      totalUsers,
      totalCampaigns,
      activeCampaigns,
      totalDonations,
      totalAmount: Number(totalAmount._sum.amount || 0),
      successfulCampaigns,
      pendingWithdrawals,
      successRate: totalCampaigns > 0 ? (successfulCampaigns / totalCampaigns) * 100 : 0,
    };
  }

  async getCampaignStats(campaignId: string) {
    const [campaign, donations, totalAmount, uniqueDonors] = await Promise.all([
      this.prisma.campaign.findUnique({
        where: { id: campaignId },
        include: {
          category: true,
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),

      this.prisma.donation.count({
        where: {
          campaignId,
          status: 'completed',
        },
      }),

      this.prisma.donation.aggregate({
        where: {
          campaignId,
          status: 'completed',
        },
        _sum: {
          amount: true,
        },
      }),

      this.prisma.donation.groupBy({
        by: ['donorId'],
        where: {
          campaignId,
          status: 'completed',
          donorId: { not: null },
        },
      }),
    ]);

    if (!campaign) {
      return null;
    }

    const totalCollected = Number(totalAmount._sum.amount || 0);
    const progressPercentage = (totalCollected / Number(campaign.targetAmount)) * 100;

    return {
      campaign,
      totalDonations: donations,
      totalCollected,
      uniqueDonors: uniqueDonors.length,
      progressPercentage: Math.min(progressPercentage, 100),
      averageDonation: donations > 0 ? totalCollected / donations : 0,
      daysRemaining: Math.max(
        0,
        Math.ceil(
          (new Date(campaign.deadline).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      ),
    };
  }

  async getUserStats(userId: string) {
    const [user, createdCampaigns, donations, totalRaised, favorites] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),

      this.prisma.campaign.count({
        where: { createdBy: userId },
      }),

      this.prisma.donation.count({
        where: { donorId: userId, status: 'completed' },
      }),

      this.prisma.campaign.aggregate({
        where: { createdBy: userId },
        _sum: {
          currentAmount: true,
        },
      }),

      this.prisma.favorite.count({
        where: { userId },
      }),
    ]);

    if (!user) {
      return null;
    }

    return {
      user,
      createdCampaigns,
      totalDonationsMade: donations,
      totalRaised: Number(totalRaised._sum.currentAmount || 0),
      totalFavorites: favorites,
    };
  }

  async getTopCampaigns(limit: number = 10) {
    return this.prisma.campaign.findMany({
      where: {
        status: 'active',
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
        _count: {
          select: {
            donations: true,
            favorites: true,
          },
        },
      },
      orderBy: [
        { currentAmount: 'desc' },
        { totalDonors: 'desc' },
      ],
      take: limit,
    });
  }

  async getRecentDonations(limit: number = 10) {
    return this.prisma.donation.findMany({
      where: {
        status: 'completed',
        isAnonymous: false,
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
        campaign: {
          select: {
            id: true,
            title: true,
            images: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  async getCategoryStats() {
    const categories = await this.prisma.category.findMany({
      include: {
        _count: {
          select: {
            campaigns: true,
          },
        },
      },
    });

    const categoryStatsPromises = categories.map(async (category) => {
      const [totalRaised, activeCampaigns] = await Promise.all([
        this.prisma.campaign.aggregate({
          where: { categoryId: category.id },
          _sum: { currentAmount: true },
        }),
        this.prisma.campaign.count({
          where: {
            categoryId: category.id,
            status: 'active',
          },
        }),
      ]);

      return {
        ...category,
        totalRaised: Number(totalRaised._sum.currentAmount || 0),
        activeCampaigns,
      };
    });

    return Promise.all(categoryStatsPromises);
  }

  private buildDateFilter(filters?: StatisticsFilterDto) {
    if (!filters?.startDate && !filters?.endDate) {
      return undefined;
    }

    const dateFilter: any = {};

    if (filters.startDate) {
      dateFilter.gte = new Date(filters.startDate);
    }

    if (filters.endDate) {
      dateFilter.lte = new Date(filters.endDate);
    }

    return dateFilter;
  }
}