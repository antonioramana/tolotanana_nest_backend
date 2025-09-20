import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTermsOfServiceDto {
  @ApiProperty({
    description: 'Titre de la politique d\'utilisation',
    example: 'Conditions d\'utilisation - Version 1.0',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le titre est requis' })
  title: string;

  @ApiProperty({
    description: 'Contenu de la politique d\'utilisation',
    example: '1. Acceptation des conditions...',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le contenu est requis' })
  content: string;

  @ApiProperty({
    description: 'Version de la politique',
    example: '1.0',
    required: false,
  })
  @IsString()
  @IsOptional()
  version?: string;
}
