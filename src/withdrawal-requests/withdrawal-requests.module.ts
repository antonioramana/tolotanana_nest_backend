import { Module } from '@nestjs/common';
import { WithdrawalRequestsService } from './withdrawal-requests.service';
import { WithdrawalRequestsController } from './withdrawal-requests.controller';

@Module({
  providers: [WithdrawalRequestsService],
  controllers: [WithdrawalRequestsController],
  exports: [WithdrawalRequestsService],
})
export class WithdrawalRequestsModule {}