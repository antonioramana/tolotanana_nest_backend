import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty({ required: false, nullable: true })
  avatar?: string | null;

  @ApiProperty({ required: false, nullable: true })
  phone?: string | null;

  @ApiProperty()
  isVerified: boolean;

  @ApiProperty()
  createdAt: Date;
}

export class AuthResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({
    description: 'Token JWT pour l\'authentification',
  })
  token: string;
}