import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DonationStatus } from '@prisma/client';

export class DonationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  campaignId: string;

  @ApiPropertyOptional()
  donorId?: string;

  @ApiProperty()
  amount: number;

  @ApiPropertyOptional()
  message?: string;

  @ApiProperty()
  isAnonymous: boolean;

  @ApiProperty()
  paymentMethod: string;

  @ApiProperty({ enum: DonationStatus })
  status: DonationStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}