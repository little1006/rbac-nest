import { IsOptional, IsNumber, Min, IsIn, IsString, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

/**
 * 状态
 */
export enum Status {
  Active = 'active',
  Inactive = 'inactive',
  Locked = 'locked',
}

export class QueryUserListDto {
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

  /**
   * 用户状态
   */
  @IsOptional()
  @IsIn(Object.values(Status), {
    message: 'status 必须是 active、inactive 或 locked',
  })
  status?: Status;

  /**
   * 是否排除管理员用户（具有SuperAdmin角色的用户）
   * 默认 true - 不显示管理员
   */
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'excludeAdmin 必须是布尔值' })
  excludeAdmin?: boolean = true;
}
