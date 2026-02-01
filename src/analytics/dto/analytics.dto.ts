import { IsString, IsNumber, IsObject, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 单个埋点事件DTO
 */
export class SingleEventDto {
  @IsString()
  eventId: string;

  @IsString()
  eventType: string;

  @IsString()
  eventName: string;

  @IsNumber()
  timestamp: number;

  @IsString()
  deviceId: string;

  @IsString()
  sessionId: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsObject()
  properties?: Record<string, any>;

  @IsOptional()
  @IsObject()
  context?: {
    browser?: string;
    browserVersion?: string;
    os?: string;
    language?: string;
    timezone?: string;
    screenResolution?: string;
    url?: string;
    referrer?: string;
    title?: string;
    pluginVersion?: string;
  };

  @IsOptional()
  @IsObject()
  performance?: {
    duration?: number;
    loadTime?: number;
  };
}

/**
 * 批量上报DTO
 */
export class TrackEventDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SingleEventDto)
  events: SingleEventDto[];
}

/**
 * 查询事件列表DTO
 */
export class QueryEventsDto {
  @IsOptional()
  @IsString()
  eventType?: string;

  @IsOptional()
  @IsString()
  eventName?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  deviceId?: string;

  @IsOptional()
  @IsString()
  propertiesSearch?: string; // 搜索properties字段中的值（如搜索引擎名称）

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  startTime?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  endTime?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  current?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pageSize?: number;
}

/**
 * 统计查询DTO
 */
export class StatisticsDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  startTime?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  endTime?: number;

  @IsOptional()
  @IsString()
  dimension?: 'eventType' | 'eventName' | 'userId' | 'hour' | 'day';
}
