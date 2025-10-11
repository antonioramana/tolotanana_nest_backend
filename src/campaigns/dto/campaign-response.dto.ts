import { ApiProperty } from '@nestjs/swagger';

export class CampaignResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  targetAmount: number;

  @ApiProperty()
  currentAmount: number;

  @ApiProperty()
  totalRaised: number;

  @ApiProperty()
  categoryId: string;

  @ApiProperty()
  images: string[];

  @ApiProperty({ required: false })
  video?: string;

  @ApiProperty()
  deadline: Date;

  @ApiProperty()
  status: string;

  @ApiProperty()
  createdBy: string;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  totalDonors: number;

  @ApiProperty()
  isVerified: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  category?: any;

  @ApiProperty({ required: false })
  creator?: any;

  @ApiProperty({ required: false })
  donations?: any[];

  @ApiProperty({ required: false })
  updates?: any[];

  @ApiProperty({ required: false })
  _count?: any;

  @ApiProperty({ required: false })
  stats?: any;

  @ApiProperty({ required: false })
  thankYouMessage?: string;

  @ApiProperty({ required: false })
  isFavoris?: boolean;
}
