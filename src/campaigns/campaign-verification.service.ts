import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CampaignVerificationService {
  private readonly logger = new Logger(CampaignVerificationService.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async verifyCampaigns() {
    this.logger.log('🔍 Vérification automatique des campagnes...');
    await this.performVerification();
  }

  private async performVerification() {
    try {
      await this.checkCompletedCampaigns();
      await this.checkExpiredCampaigns();
      this.logger.log('✅ Vérification des campagnes terminée');
    } catch (error) {
      this.logger.error('❌ Erreur lors de la vérification des campagnes:', error);
    }
  }

  private async checkCompletedCampaigns() {
    // Utiliser une requête SQL brute pour la comparaison des montants
    const completedCampaigns = await this.prisma.$queryRaw`
      SELECT id, title, "currentAmount", "targetAmount" 
      FROM campaigns 
      WHERE status = 'active' 
      AND "currentAmount" >= "targetAmount"
    ` as any[];

    this.logger.log(`🔍 Campagnes trouvées avec objectif atteint: ${completedCampaigns.length}`);

    if (completedCampaigns.length > 0) {
      this.logger.log(`🎯 ${completedCampaigns.length} campagne(s) ont atteint leur objectif`);
      
      // Afficher les détails des campagnes
      completedCampaigns.forEach(campaign => {
        this.logger.log(`  - ${campaign.title}: ${campaign.currentAmount}/${campaign.targetAmount}`);
      });
      
      // Mettre à jour le statut de ces campagnes
      const campaignIds = completedCampaigns.map(c => c.id);
      await this.prisma.campaign.updateMany({
        where: {
          id: {
            in: campaignIds,
          },
        },
        data: {
          status: 'completed',
        },
      });

      this.logger.log(`✅ ${campaignIds.length} campagne(s) marquée(s) comme terminée(s)`);
    }
  }

  private async checkExpiredCampaigns() {
    // Trouver les campagnes actives dont la date limite est dépassée
    const expiredCampaigns = await this.prisma.campaign.findMany({
      where: {
        status: 'active',
        deadline: {
          lt: new Date(),
        },
      },
    });

    this.logger.log(`🔍 Campagnes trouvées avec date dépassée: ${expiredCampaigns.length}`);

    if (expiredCampaigns.length > 0) {
      this.logger.log(`⏰ ${expiredCampaigns.length} campagne(s) ont dépassé leur date limite`);
      
      // Afficher les détails des campagnes
      expiredCampaigns.forEach(campaign => {
        this.logger.log(`  - ${campaign.title}: deadline ${campaign.deadline}`);
      });
      
      // Mettre à jour le statut de ces campagnes
      const campaignIds = expiredCampaigns.map(c => c.id);
      await this.prisma.campaign.updateMany({
        where: {
          id: {
            in: campaignIds,
          },
        },
        data: {
          status: 'completed',
        },
      });

      this.logger.log(`✅ ${campaignIds.length} campagne(s) expirée(s) marquée(s) comme terminée(s)`);
    }
  }

  // Méthode pour vérifier manuellement (utile pour les tests)
  async manualVerification() {
    this.logger.log('🔧 Vérification manuelle des campagnes...');
    await this.performVerification();
  }

  // Méthode pour obtenir les statistiques de vérification
  async getVerificationStats() {
    const stats = await this.prisma.campaign.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    return {
      total: stats.reduce((sum, stat) => sum + stat._count.status, 0),
      byStatus: stats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.status;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
