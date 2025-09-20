import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WithdrawalStatus } from '@prisma/client';

export class WithdrawalRequestResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  campaignId: string;

  @ApiProperty()
  requestedBy: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  bankInfoId: string;

  @ApiProperty()
  justification: string;

  @ApiProperty({ type: [String] })
  documents: string[];

  @ApiProperty({ enum: WithdrawalStatus })
  status: WithdrawalStatus;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional()
  processedAt?: Date;

  @ApiPropertyOptional()
  processedBy?: string;

  @ApiProperty()
  updatedAt: Date;
}