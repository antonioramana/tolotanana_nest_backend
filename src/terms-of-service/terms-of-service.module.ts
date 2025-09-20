import { Module } from '@nestjs/common';
import { TermsOfServiceService } from './terms-of-service.service';
import { TermsOfServiceController } from './terms-of-service.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [TermsOfServiceService],
  controllers: [TermsOfServiceController],
  exports: [TermsOfServiceService],
})
export class TermsOfServiceModule {}
