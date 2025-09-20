import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDecimal,
  IsBoolean,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDonationDto {
  @ApiProperty({
    description: 'ID de la campagne à soutenir',
    example: 'clp123abc456def',
  })
  @IsString()
  @IsNotEmpty({ message: 'L\'ID de la campagne est requis' })
  campaignId: string;

  @ApiProperty({
    description: 'Montant du don en euros',
    example: 50.00,
  })
  @Type(() => Number)
  @Min(1, { message: 'Le montant doit être supérieur à 0' })
  amount: number;

  @ApiPropertyOptional({
    description: 'Message personnel du donateur',
    example: 'Bonne chance pour votre projet !',
  })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiPropertyOptional({
    description: 'Nom affiché du donateur si non anonyme',
    example: 'Jean Dupont',
  })
  @IsString()
  @IsOptional()
  donorName?: string;

  @ApiProperty({
    description: 'Don anonyme ou pas',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean = false;

  @ApiProperty({
    description: 'Méthode de paiement utilisée',
    example: 'card',
  })
  @IsString()
  @IsNotEmpty({ message: 'La méthode de paiement est requise' })
  paymentMethod: string;
}