import { Module } from '@nestjs/common';
import { PlatformFeesService } from './platform-fees.service';
import { PlatformFeesController } from './platform-fees.controller';
import { PublicPlatformFeesController } from './public-platform-fees.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PlatformFeesService],
  controllers: [PlatformFeesController, PublicPlatformFeesController],
  exports: [PlatformFeesService],
})
export class PlatformFeesModule {}
