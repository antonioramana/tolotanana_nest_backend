import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmailModule } from '../email/email.module';
import { WithdrawalRequestsService } from './withdrawal-requests.service';
import { WithdrawalRequestsController } from './withdrawal-requests.controller';

@Module({
  imports: [PrismaModule, NotificationsModule, EmailModule],
  providers: [WithdrawalRequestsService],
  controllers: [WithdrawalRequestsController],
  exports: [WithdrawalRequestsService],
})
export class WithdrawalRequestsModule {}