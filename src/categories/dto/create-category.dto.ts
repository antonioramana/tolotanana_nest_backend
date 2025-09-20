import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Nom de la catégorie',
    example: 'Éducation',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le nom de la catégorie est requis' })
  name: string;
}