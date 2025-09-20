import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDecimal,
  IsDateString,
  IsArray,
  IsUrl,
  IsOptional,
  Min,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Type } from 'class-transformer';

@ValidatorConstraint({ name: 'isValidImageUrl', async: false })
export class IsValidImageUrlConstraint implements ValidatorConstraintInterface {
  validate(url: string, args: ValidationArguments) {
    if (typeof url !== 'string') return false;
    
    // Accept localhost URLs for development
    if (url.startsWith('http://localhost:') || url.startsWith('https://localhost:')) {
      return true;
    }
    
    // Accept standard HTTP/HTTPS URLs
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return 'Chaque image doit être une URL valide (http:// ou https://)';
  }
}

export class CreateCampaignDto {
  @ApiProperty({
    description: 'Titre de la campagne',
    example: 'Aide pour mon projet éducatif',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le titre est requis' })
  title: string;

  @ApiProperty({
    description: 'Description détaillée de la campagne',
    example: 'Je souhaite créer une école dans ma communauté...',
  })
  @IsString()
  @IsNotEmpty({ message: 'La description est requise' })
  description: string;

  @ApiProperty({
    description: 'Montant objectif en euros',
    example: 5000.00,
  })
  @Type(() => Number)
  @Min(1, { message: 'Le montant objectif doit être supérieur à 0' })
  targetAmount: number;

  @ApiProperty({
    description: 'ID de la catégorie',
    example: 'clp123abc456def',
  })
  @IsString()
  @IsNotEmpty({ message: 'La catégorie est requise' })
  categoryId: string;

  @ApiProperty({
    description: 'URLs des images de la campagne',
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    type: [String],
  })
  @IsArray()
  @Validate(IsValidImageUrlConstraint, { each: true })
  images: string[];

  @ApiPropertyOptional({
    description: 'URL de la vidéo de présentation',
    example: 'https://youtube.com/watch?v=123',
  })
  @Validate(IsValidImageUrlConstraint)
  @IsOptional()
  video?: string;

  @ApiProperty({
    description: 'Date limite de la campagne (ISO string)',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsDateString({}, { message: 'La date limite doit être une date valide' })
  deadline: string;

  @ApiPropertyOptional({
    description: 'Message de remerciement personnalisé pour les donateurs',
    example: 'Merci pour votre générosité ! Votre soutien nous aide énormément.',
  })
  @IsString()
  @IsOptional()
  thankYouMessage?: string;
}