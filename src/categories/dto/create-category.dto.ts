import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Nom de la catégorie',
    example: 'Éducation',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le nom de la catégorie est requis' })
  name: string;

  @ApiProperty({
    description: 'Description de la catégorie',
    example: 'Campagnes liées à l\'éducation et à la formation',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}