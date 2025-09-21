import { Module } from '@nestjs/common';
import { BankInfoService } from './bank-info.service';
import { BankInfoController } from './bank-info.controller';
import { PublicBankInfoController } from './public-bank-info.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [BankInfoService],
  controllers: [BankInfoController, PublicBankInfoController],
  exports: [BankInfoService],
})
export class BankInfoModule {}