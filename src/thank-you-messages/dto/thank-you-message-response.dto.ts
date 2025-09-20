import { ApiProperty } from '@nestjs/swagger';

export class ThankYouMessageResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  campaignId: string;

  @ApiProperty()
  donationId: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}