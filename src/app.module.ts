import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { DonationsModule } from './donations/donations.module';
import { BankInfoModule } from './bank-info/bank-info.module';
import { WithdrawalRequestsModule } from './withdrawal-requests/withdrawal-requests.module';
import { StatisticsModule } from './statistics/statistics.module';
import { UploadsModule } from './uploads/uploads.module';
import { HealthModule } from './health/health.module';
import { TermsOfServiceModule } from './terms-of-service/terms-of-service.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    CampaignsModule,
    DonationsModule,
    BankInfoModule,
    WithdrawalRequestsModule,
    StatisticsModule,
    UploadsModule,
    HealthModule,
    TermsOfServiceModule,
  ],
})
export class AppModule {}