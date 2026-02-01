import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ResService } from 'src/res/res.service';
import { TrackEventDto, QueryEventsDto, StatisticsDto } from './dto/analytics.dto';
import { JwtAuthGuard } from 'src/guards/jwt/jwt.guard';

@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly res: ResService,
  ) {}

  /**
   * 接收插件上报的埋点数据
   * POST /analytics/track
   * 不需要认证 - 插件端匿名上报
   */
  @Post('/track')
  async track(@Body() dto: TrackEventDto) {
    const count = await this.analyticsService.batchSaveEvents(dto.events);
    return this.res.success({ count });
  }

  /**
   * 分页查询埋点事件列表
   * GET /analytics/events
   */
  @UseGuards(JwtAuthGuard)
  @Get('/events')
  async getEvents(@Query() dto: QueryEventsDto) {
    const result = await this.analyticsService.queryEvents(dto);
    return this.res.success(result);
  }

  /**
   * 获取单个事件详情
   * GET /analytics/events/:id
   */
  @UseGuards(JwtAuthGuard)
  @Get('/events/:id')
  async getEventById(@Param('id') id: string) {
    const event = await this.analyticsService.getEventById(id);
    if (!event) {
      return this.res.error('事件不存在');
    }
    return this.res.success(event);
  }

  /**
   * 获取统计数据
   * GET /analytics/statistics
   */
  @UseGuards(JwtAuthGuard)
  @Get('/statistics')
  async getStatistics(@Query() dto: StatisticsDto) {
    const result = await this.analyticsService.getStatistics(dto);
    return this.res.success(result);
  }

  /**
   * 获取概览数据
   * GET /analytics/overview
   */
  @UseGuards(JwtAuthGuard)
  @Get('/overview')
  async getOverview(
    @Query('startTime') startTime?: number,
    @Query('endTime') endTime?: number,
  ) {
    const result = await this.analyticsService.getOverview(
      startTime ? Number(startTime) : undefined,
      endTime ? Number(endTime) : undefined,
    );
    return this.res.success(result);
  }

  /**
   * 获取事件类型列表（用于筛选下拉）
   * GET /analytics/event-types
   */
  @UseGuards(JwtAuthGuard)
  @Get('/event-types')
  async getEventTypes() {
    const result = await this.analyticsService.getEventTypes();
    return this.res.success(result);
  }

  /**
   * 获取事件名称列表（用于筛选下拉）
   * GET /analytics/event-names
   */
  @UseGuards(JwtAuthGuard)
  @Get('/event-names')
  async getEventNames(@Query('eventType') eventType?: string) {
    const result = await this.analyticsService.getEventNames(eventType);
    return this.res.success(result);
  }

  /**
   * 导出事件数据
   * GET /analytics/export
   */
  @UseGuards(JwtAuthGuard)
  @Get('/export')
  async exportEvents(@Query() dto: QueryEventsDto) {
    const result = await this.analyticsService.exportEvents(dto);
    return this.res.success(result);
  }
}
