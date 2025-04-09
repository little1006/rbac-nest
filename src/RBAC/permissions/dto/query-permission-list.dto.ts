import { IsOptional, IsNumber, Min, IsIn, IsString } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 状态
 */
export enum Status {
  Active = 'active',
  Inactive = 'inactive',
  Locked = 'locked',
}

export class QueryPermissionListDto {
  /**
   * 当前页码
   */
  @Type(() => Number) // 确保 Query 参数转换为 Number
  @IsNumber({}, { message: 'current 必须是数字' })
  @Min(1, { message: 'current 最小值为 1' })
  @IsOptional()
  current?: number = 1;

  /**
   * 每页条数
   */
  @Type(() => Number)
  @IsNumber({}, { message: 'pageSize 必须是数字' })
  @Min(1, { message: 'pageSize 最小值为 1' })
  @IsOptional()
  pageSize?: number = 20;

  /**
   * 搜索关键字
   */
  @IsOptional()
  @IsString({ message: 'search 必须是字符串' })
  search?: string;

  /**
   * 排序字段
   */
  @IsOptional()
  @IsString({ message: 'sortBy 必须是字符串' })
  sortBy?: string = 'createdAt'; // 默认排序字段

  /**
   * 排序方向
   */
  @IsOptional()
  @IsIn(['ASC', 'DESC'], { message: 'sortOrder 必须是 ASC 或 DESC' }) // 限制排序方向
  sortOrder?: 'ASC' | 'DESC' = 'DESC'; // 默认降序
}
