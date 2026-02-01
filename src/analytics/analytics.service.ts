import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, IsNull, Not } from 'typeorm';
import { AnalyticsEvent } from 'src/entities/analytics-event.entity';
import { SingleEventDto, QueryEventsDto, StatisticsDto } from './dto/analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AnalyticsEvent)
    private readonly analyticsRepo: Repository<AnalyticsEvent>,
  ) {}

  /**
   * 批量保存埋点事件
   */
  async batchSaveEvents(events: SingleEventDto[], source: string = 'quantum-plug'): Promise<number> {
    const entities = events.map(event => {
      const entity = new AnalyticsEvent();
      
      // 基础字段
      entity.eventId = event.eventId;
      entity.eventType = event.eventType;
      entity.eventName = event.eventName;
      entity.timestamp = event.timestamp;
      
      // 用户标识
      entity.deviceId = event.deviceId;
      entity.sessionId = event.sessionId;
      entity.userId = event.userId || null;
      
      // 属性
      entity.properties = event.properties || null;
      
      // 上下文
      if (event.context) {
        entity.browser = event.context.browser;
        entity.browserVersion = event.context.browserVersion;
        entity.os = event.context.os;
        entity.language = event.context.language;
        entity.timezone = event.context.timezone;
        entity.screenResolution = event.context.screenResolution;
        entity.url = event.context.url;
        entity.referrer = event.context.referrer;
        entity.title = event.context.title;
        entity.pluginVersion = event.context.pluginVersion;
      }
      
      // 性能
      if (event.performance) {
        entity.duration = event.performance.duration;
        entity.loadTime = event.performance.loadTime;
      }
      
      entity.source = source;
      
      return entity;
    });

    // 批量插入
    await this.analyticsRepo
      .createQueryBuilder()
      .insert()
      .into(AnalyticsEvent)
      .values(entities)
      .execute();

    return entities.length;
  }

  /**
   * 分页查询埋点事件
   */
  async queryEvents(dto: QueryEventsDto) {
    const { current = 1, pageSize = 20, eventType, eventName, userId, deviceId, propertiesSearch, startTime, endTime } = dto;

    const queryBuilder = this.analyticsRepo
      .createQueryBuilder('event')
      .orderBy('event.timestamp', 'DESC');

    // 条件筛选
    if (eventType) {
      queryBuilder.andWhere('event.eventType = :eventType', { eventType });
    }
    if (eventName) {
      queryBuilder.andWhere('event.eventName LIKE :eventName', { eventName: `%${eventName}%` });
    }
    if (userId) {
      queryBuilder.andWhere('event.userId = :userId', { userId });
    }
    if (deviceId) {
      queryBuilder.andWhere('event.deviceId = :deviceId', { deviceId });
    }
    // properties JSON搜索（搜索引擎名称等）
    if (propertiesSearch) {
      queryBuilder.andWhere('JSON_SEARCH(event.properties, \'one\', :propertiesSearch) IS NOT NULL', { propertiesSearch: `%${propertiesSearch}%` });
    }
    if (startTime && endTime) {
      queryBuilder.andWhere('event.timestamp BETWEEN :startTime AND :endTime', { startTime, endTime });
    }

    // 分页
    queryBuilder
      .skip((current - 1) * pageSize)
      .take(pageSize);

    const [list, total] = await queryBuilder.getManyAndCount();

    return {
      list,
      total,
      current,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取统计数据
   */
  async getStatistics(dto: StatisticsDto) {
    const { startTime, endTime, dimension = 'eventType' } = dto;

    let groupByField = 'event.event_type';
    let selectField = 'eventType';

    switch (dimension) {
      case 'eventName':
        groupByField = 'event.event_name';
        selectField = 'eventName';
        break;
      case 'userId':
        groupByField = 'event.user_id';
        selectField = 'userId';
        break;
      case 'hour':
        groupByField = 'DATE_FORMAT(FROM_UNIXTIME(event.timestamp / 1000), "%Y-%m-%d %H:00:00")';
        selectField = 'hour';
        break;
      case 'day':
        groupByField = 'DATE_FORMAT(FROM_UNIXTIME(event.timestamp / 1000), "%Y-%m-%d")';
        selectField = 'day';
        break;
    }

    const queryBuilder = this.analyticsRepo
      .createQueryBuilder('event')
      .select(`${groupByField} AS ${selectField}`)
      .addSelect('COUNT(*) AS count');

    if (startTime && endTime) {
      queryBuilder.where('event.timestamp BETWEEN :startTime AND :endTime', { startTime, endTime });
    }

    queryBuilder
      .groupBy(groupByField)
      .orderBy('count', 'DESC')
      .limit(100);

    return await queryBuilder.getRawMany();
  }

  /**
   * 获取概览数据
   */
  async getOverview(startTime?: number, endTime?: number) {
    const whereClause: any = {};
    
    // 构建时间范围查询
    let timestampCondition = '';
    const params: any = {};
    
    if (startTime && endTime) {
      timestampCondition = 'event.timestamp BETWEEN :startTime AND :endTime';
      params.startTime = startTime;
      params.endTime = endTime;
    }

    // 总事件数
    const totalEventsQuery = this.analyticsRepo.createQueryBuilder('event');
    if (timestampCondition) {
      totalEventsQuery.where(timestampCondition, params);
    }
    const totalEvents = await totalEventsQuery.getCount();

    // 活跃设备数
    const uniqueDevicesQuery = this.analyticsRepo
      .createQueryBuilder('event')
      .select('COUNT(DISTINCT event.device_id) AS count');
    if (timestampCondition) {
      uniqueDevicesQuery.where(timestampCondition, params);
    }
    const uniqueDevicesResult = await uniqueDevicesQuery.getRawOne();
    const uniqueDevices = parseInt(uniqueDevicesResult?.count || '0');

    // 登录用户数
    const uniqueUsersQuery = this.analyticsRepo
      .createQueryBuilder('event')
      .select('COUNT(DISTINCT event.user_id) AS count')
      .where('event.user_id IS NOT NULL');
    if (timestampCondition) {
      uniqueUsersQuery.andWhere(timestampCondition, params);
    }
    const uniqueUsersResult = await uniqueUsersQuery.getRawOne();
    const uniqueUsers = parseInt(uniqueUsersResult?.count || '0');

    // 事件类型分布
    const eventTypeQuery = this.analyticsRepo
      .createQueryBuilder('event')
      .select('event.event_type AS eventType')
      .addSelect('COUNT(*) AS count');
    if (timestampCondition) {
      eventTypeQuery.where(timestampCondition, params);
    }
    const eventTypeDistribution = await eventTypeQuery
      .groupBy('event.event_type')
      .getRawMany();

    // 热门事件 Top 10
    const topEventsQuery = this.analyticsRepo
      .createQueryBuilder('event')
      .select('event.event_name AS eventName')
      .addSelect('COUNT(*) AS count');
    if (timestampCondition) {
      topEventsQuery.where(timestampCondition, params);
    }
    const topEvents = await topEventsQuery
      .groupBy('event.event_name')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    // 每日趋势 (最近7天)
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const dailyTrend = await this.analyticsRepo
      .createQueryBuilder('event')
      .select('DATE_FORMAT(FROM_UNIXTIME(event.timestamp / 1000), "%Y-%m-%d") AS date')
      .addSelect('COUNT(*) AS count')
      .where('event.timestamp >= :sevenDaysAgo', { sevenDaysAgo })
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();

    return {
      totalEvents,
      uniqueDevices,
      uniqueUsers,
      eventTypeDistribution,
      topEvents,
      dailyTrend,
    };
  }

  /**
   * 获取事件类型列表
   */
  async getEventTypes(): Promise<string[]> {
    const result = await this.analyticsRepo
      .createQueryBuilder('event')
      .select('DISTINCT event.event_type AS eventType')
      .getRawMany();

    return result.map(r => r.eventType);
  }

  /**
   * 获取事件名称列表
   */
  async getEventNames(eventType?: string): Promise<string[]> {
    const queryBuilder = this.analyticsRepo
      .createQueryBuilder('event')
      .select('DISTINCT event.event_name AS eventName');
    
    if (eventType) {
      queryBuilder.where('event.event_type = :eventType', { eventType });
    }

    const result = await queryBuilder.getRawMany();
    return result.map(r => r.eventName);
  }

  /**
   * 获取单个事件详情
   */
  async getEventById(id: string): Promise<AnalyticsEvent | null> {
    return await this.analyticsRepo.findOne({ where: { id } });
  }

  /**
   * 导出数据
   */
  async exportEvents(dto: QueryEventsDto) {
    // 设置较大的pageSize用于导出
    const exportDto = { ...dto, current: 1, pageSize: 10000 };
    const result = await this.queryEvents(exportDto);
    return result.list;
  }
}
