import { ApiProperty } from '@nestjs/swagger';

export class DashboardStatsResponseDto {
  @ApiProperty({
    description: 'Nombre total d\'utilisateurs',
    example: 150,
  })
  totalUsers: number;

  @ApiProperty({
    description: 'Nombre total de campagnes',
    example: 45,
  })
  totalCampaigns: number;

  @ApiProperty({
    description: 'Nombre de campagnes actives',
    example: 23,
  })
  activeCampaigns: number;

  @ApiProperty({
    description: 'Nombre total de donations',
    example: 287,
  })
  totalDonations: number;

  @ApiProperty({
    description: 'Montant total collecté',
    example: 15420.50,
  })
  totalAmount: number;

  @ApiProperty({
    description: 'Nombre de campagnes réussies',
    example: 12,
  })
  successfulCampaigns: number;

  @ApiProperty({
    description: 'Nombre de retraits en attente',
    example: 3,
  })
  pendingWithdrawals: number;

  @ApiProperty({
    description: 'Taux de réussite en pourcentage',
    example: 26.67,
  })
  successRate: number;
}