import { ApiProperty } from '@nestjs/swagger';
import { BankInfoType } from '@prisma/client';

export class BankInfoResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: BankInfoType })
  type: BankInfoType;

  @ApiProperty()
  accountNumber: string;

  @ApiProperty()
  accountName: string;

  @ApiProperty()
  provider: string;

  @ApiProperty()
  isDefault: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}