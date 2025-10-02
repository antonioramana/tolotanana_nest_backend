import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(): Promise<DashboardStatsDto> {
    // Exécuter toutes les requêtes en parallèle pour optimiser les performances
    const [
      generalStats,
      revenueEvolution,
      campaignsByCategory,
      recentLargeDonations,
      recentCampaigns,
      recentUsers,
      growthEvolution,
    ] = await Promise.all([
      this.getGeneralStats(),
      this.getRevenueEvolution(),
      this.getCampaignsByCategory(),
      this.getRecentLargeDonations(),
      this.getRecentCampaigns(),
      this.getRecentUsers(),
      this.getGrowthEvolution(),
    ]);

    return {
      generalStats,
      revenueEvolution,
      campaignsByCategory,
      recentLargeDonations,
      recentCampaigns,
      recentUsers,
      growthEvolution,
    };
  }

  private async getGeneralStats() {
    // Statistiques générales
    const [
      totalCollectedResult,
      activeCampaignsCount,
      totalUsersCount,
      totalDonationsResult,
      completedCampaignsCount,
      totalCampaignsCount,
      platformFeesPercentage,
    ] = await Promise.all([
      // Total collecté
      this.prisma.donation.aggregate({
        where: { status: 'completed' },
        _sum: { amount: true },
      }),
      // Campagnes actives
      this.prisma.campaign.count({
        where: { status: 'active' },
      }),
      // Total utilisateurs
      this.prisma.user.count(),
      // Total donations
      this.prisma.donation.aggregate({
        where: { status: 'completed' },
        _count: true,
        _sum: { amount: true },
      }),
      // Campagnes complétées
      this.prisma.campaign.count({
        where: { status: 'completed' },
      }),
      // Total campagnes
      this.prisma.campaign.count(),
      // Pourcentage des frais de plateforme
      this.prisma.platformFees.findFirst({
        where: { isActive: true },
        select: { percentage: true },
      }),
    ]);

    const totalCollected = Number(totalCollectedResult._sum.amount || 0);
    const platformFeesRate = platformFeesPercentage?.percentage || 5;
    const platformFees = totalCollected * (platformFeesRate / 100);
    const successRate = totalCampaignsCount > 0 ? (completedCampaignsCount / totalCampaignsCount) * 100 : 0;

    return {
      totalCollected,
      platformFees,
      activeCampaigns: activeCampaignsCount,
      totalUsers: totalUsersCount,
      totalDonations: totalDonationsResult._count,
      successRate: Math.round(successRate * 100) / 100,
    };
  }

  private async getRevenueEvolution() {
    // Évolution des revenus sur les 12 derniers mois
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const donations = await this.prisma.donation.findMany({
      where: {
        status: 'completed',
        createdAt: { gte: twelveMonthsAgo },
      },
      select: {
        amount: true,
        createdAt: true,
      },
    });

    // Grouper par mois
    const monthlyData = new Map<string, { totalCollected: number; donationsCount: number }>();
    
    donations.forEach((donation) => {
      const monthKey = donation.createdAt.toISOString().substring(0, 7); // YYYY-MM
      const amount = Number(donation.amount);
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { totalCollected: 0, donationsCount: 0 });
      }
      
      const data = monthlyData.get(monthKey)!;
      data.totalCollected += amount;
      data.donationsCount += 1;
    });

    // Obtenir le pourcentage des frais de plateforme
    const platformFeesData = await this.prisma.platformFees.findFirst({
      where: { isActive: true },
      select: { percentage: true },
    });
    const platformFeesRate = platformFeesData?.percentage || 5;

    // Convertir en tableau et trier par mois
    const result = Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        monthName: this.formatMonthName(month),
        totalCollected: data.totalCollected,
        platformFees: data.totalCollected * (platformFeesRate / 100),
        donationsCount: data.donationsCount,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return result;
  }

  private async getCampaignsByCategory() {
    const categoriesData = await this.prisma.category.findMany({
      include: {
        campaigns: {
          select: {
            currentAmount: true,
          },
        },
      },
    });

    const totalCampaigns = await this.prisma.campaign.count();

    return categoriesData.map((category) => {
      const campaignsCount = category.campaigns.length;
      const totalCollected = category.campaigns.reduce(
        (sum, campaign) => sum + Number(campaign.currentAmount || 0),
        0
      );
      const percentage = totalCampaigns > 0 ? (campaignsCount / totalCampaigns) * 100 : 0;

      return {
        categoryName: category.name,
        campaignsCount,
        totalCollected,
        percentage: Math.round(percentage * 100) / 100,
      };
    });
  }

  private async getRecentLargeDonations() {
    // Donations importantes (> 1000 Ar) des 30 derniers jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const donations = await this.prisma.donation.findMany({
      where: {
        status: 'completed',
        amount: { gte: 1000 }, // Donations importantes
        createdAt: { gte: thirtyDaysAgo },
      },
      include: {
        donor: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        campaign: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        amount: 'desc',
      },
      take: 10,
    });

    return donations.map((donation) => ({
      id: donation.id,
      amount: Number(donation.amount),
      campaignTitle: donation.campaign.title,
      donorName: donation.isAnonymous 
        ? 'Donateur anonyme' 
        : `${donation.donor?.firstName || ''} ${donation.donor?.lastName || ''}`.trim() || 'Utilisateur supprimé',
      isAnonymous: donation.isAnonymous,
      createdAt: donation.createdAt,
    }));
  }

  private async getRecentCampaigns() {
    // Nouvelles campagnes des 30 derniers jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const campaigns = await this.prisma.campaign.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    return campaigns.map((campaign) => ({
      id: campaign.id,
      title: campaign.title,
      targetAmount: Number(campaign.targetAmount),
      creatorName: `${campaign.creator.firstName} ${campaign.creator.lastName}`,
      categoryName: campaign.category.name,
      createdAt: campaign.createdAt,
    }));
  }

  private async getRecentUsers() {
    // Nouveaux utilisateurs des 30 derniers jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const users = await this.prisma.user.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        role: { not: 'admin' }, // Exclure les admins
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    return users;
  }

  private async getGrowthEvolution() {
    // Évolution des inscriptions et créations de campagnes sur les 12 derniers mois
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const [users, campaigns] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          createdAt: { gte: twelveMonthsAgo },
          role: { not: 'admin' },
        },
        select: {
          createdAt: true,
        },
      }),
      this.prisma.campaign.findMany({
        where: {
          createdAt: { gte: twelveMonthsAgo },
        },
        select: {
          createdAt: true,
        },
      }),
    ]);

    // Grouper par mois
    const monthlyData = new Map<string, { usersCount: number; campaignsCount: number }>();

    // Traiter les utilisateurs
    users.forEach((user) => {
      const monthKey = user.createdAt.toISOString().substring(0, 7);
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { usersCount: 0, campaignsCount: 0 });
      }
      monthlyData.get(monthKey)!.usersCount += 1;
    });

    // Traiter les campagnes
    campaigns.forEach((campaign) => {
      const monthKey = campaign.createdAt.toISOString().substring(0, 7);
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { usersCount: 0, campaignsCount: 0 });
      }
      monthlyData.get(monthKey)!.campaignsCount += 1;
    });

    // Convertir en tableau et trier
    const result = Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        monthName: this.formatMonthName(month),
        usersCount: data.usersCount,
        campaignsCount: data.campaignsCount,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return result;
  }

  private formatMonthName(monthKey: string): string {
    const [year, month] = monthKey.split('-');
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    const monthIndex = parseInt(month) - 1;
    return `${monthNames[monthIndex]} ${year}`;
  }
}
