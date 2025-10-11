import { ApiProperty } from '@nestjs/swagger';

export class CampaignThankYouMessageResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  campaignId: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  campaign: {
    id: string;
    title: string;
  };
}














