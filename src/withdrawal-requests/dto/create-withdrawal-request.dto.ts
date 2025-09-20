import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsUrl,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWithdrawalRequestDto {
  @ApiProperty({
    description: 'ID de la campagne',
    example: 'clp123abc456def',
  })
  @IsString()
  @IsNotEmpty({ message: 'L\'ID de la campagne est requis' })
  campaignId: string;

  @ApiProperty({
    description: 'Montant à retirer en euros',
    example: 1000.00,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'Le montant doit être un nombre' })
  @Min(1, { message: 'Le montant doit être supérieur à 0' })
  amount: number;

  @ApiProperty({
    description: 'ID des informations bancaires',
    example: 'clp123abc456def',
  })
  @IsString()
  @IsNotEmpty({ message: 'Les informations bancaires sont requises' })
  bankInfoId: string;

  @ApiProperty({
    description: 'Justification de la demande de retrait',
    example: 'Achat de matériel pour le projet éducatif',
  })
  @IsString()
  @IsNotEmpty({ message: 'La justification est requise' })
  justification: string;

  @ApiPropertyOptional({
    description: 'Documents justificatifs (URLs)',
    example: ['https://example.com/facture1.pdf', 'https://example.com/facture2.pdf'],
    type: [String],
  })
  @IsArray()
  @IsUrl({}, { each: true, message: 'Chaque document doit être une URL valide' })
  documents: string[];
}