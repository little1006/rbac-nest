import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AnalyticsEvent } from 'src/entities/analytics-event.entity';
import { ResModule } from 'src/res/res.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AnalyticsEvent]),
    ResModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
