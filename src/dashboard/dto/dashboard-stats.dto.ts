import { ApiProperty } from '@nestjs/swagger';

export class DashboardStatsDto {
  @ApiProperty({
    description: 'Statistiques générales de la plateforme',
    type: 'object',
    properties: {
      totalCollected: { type: 'number', example: 125000.50, description: 'Montant total collecté' },
      platformFees: { type: 'number', example: 6250.25, description: 'Total des frais de plateforme' },
      activeCampaigns: { type: 'number', example: 15, description: 'Nombre de campagnes actives' },
      totalUsers: { type: 'number', example: 245, description: 'Nombre total d\'utilisateurs' },
      totalDonations: { type: 'number', example: 1250, description: 'Nombre total de donations' },
      successRate: { type: 'number', example: 78.5, description: 'Taux de réussite des campagnes (%)' },
    },
  })
  generalStats: {
    totalCollected: number;
    platformFees: number;
    activeCampaigns: number;
    totalUsers: number;
    totalDonations: number;
    successRate: number;
  };

  @ApiProperty({
    description: 'Évolution des revenus par mois',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        month: { type: 'string', example: '2024-01' },
        monthName: { type: 'string', example: 'Janvier 2024' },
        totalCollected: { type: 'number', example: 15000 },
        platformFees: { type: 'number', example: 750 },
        donationsCount: { type: 'number', example: 125 },
      },
    },
  })
  revenueEvolution: Array<{
    month: string;
    monthName: string;
    totalCollected: number;
    platformFees: number;
    donationsCount: number;
  }>;

  @ApiProperty({
    description: 'Répartition des campagnes par catégorie',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        categoryName: { type: 'string', example: 'Santé' },
        campaignsCount: { type: 'number', example: 25 },
        totalCollected: { type: 'number', example: 45000 },
        percentage: { type: 'number', example: 35.5 },
      },
    },
  })
  campaignsByCategory: Array<{
    categoryName: string;
    campaignsCount: number;
    totalCollected: number;
    percentage: number;
  }>;

  @ApiProperty({
    description: 'Donations importantes récentes',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'donation_123' },
        amount: { type: 'number', example: 5000 },
        campaignTitle: { type: 'string', example: 'Aide médicale urgente' },
        donorName: { type: 'string', example: 'Marie Dupont' },
        isAnonymous: { type: 'boolean', example: false },
        createdAt: { type: 'string', example: '2024-01-15T10:30:00Z' },
      },
    },
  })
  recentLargeDonations: Array<{
    id: string;
    amount: number;
    campaignTitle: string;
    donorName: string;
    isAnonymous: boolean;
    createdAt: Date;
  }>;

  @ApiProperty({
    description: 'Nouvelles campagnes récentes',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'campaign_123' },
        title: { type: 'string', example: 'Construction école rurale' },
        targetAmount: { type: 'number', example: 50000 },
        creatorName: { type: 'string', example: 'Jean Martin' },
        categoryName: { type: 'string', example: 'Éducation' },
        createdAt: { type: 'string', example: '2024-01-15T10:30:00Z' },
      },
    },
  })
  recentCampaigns: Array<{
    id: string;
    title: string;
    targetAmount: number;
    creatorName: string;
    categoryName: string;
    createdAt: Date;
  }>;

  @ApiProperty({
    description: 'Nouveaux utilisateurs récents',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'user_123' },
        firstName: { type: 'string', example: 'Marie' },
        lastName: { type: 'string', example: 'Dupont' },
        role: { type: 'string', example: 'donateur' },
        createdAt: { type: 'string', example: '2024-01-15T10:30:00Z' },
      },
    },
  })
  recentUsers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    createdAt: Date;
  }>;

  @ApiProperty({
    description: 'Évolution des inscriptions par mois',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        month: { type: 'string', example: '2024-01' },
        monthName: { type: 'string', example: 'Janvier 2024' },
        usersCount: { type: 'number', example: 25 },
        campaignsCount: { type: 'number', example: 8 },
      },
    },
  })
  growthEvolution: Array<{
    month: string;
    monthName: string;
    usersCount: number;
    campaignsCount: number;
  }>;
}
