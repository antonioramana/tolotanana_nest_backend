import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { BankInfoType } from '@prisma/client';

export class CreateBankInfoDto {
  @ApiProperty({
    description: 'Type de compte',
    enum: BankInfoType,
    example: 'bank_account',
  })
  @IsEnum(BankInfoType, { message: 'Le type doit être mobile_money ou bank_account' })
  type: BankInfoType;

  @ApiProperty({
    description: 'Numéro de compte ou téléphone',
    example: '1234567890',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le numéro de compte est requis' })
  accountNumber: string;

  @ApiProperty({
    description: 'Nom du titulaire du compte',
    example: 'Jean Dupont',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le nom du titulaire est requis' })
  accountName: string;

  @ApiProperty({
    description: 'Fournisseur (banque ou opérateur mobile)',
    example: 'Orange Money',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le fournisseur est requis' })
  provider: string;

  @ApiPropertyOptional({
    description: 'Définir comme compte par défaut',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean = false;
}