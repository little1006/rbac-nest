import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class UpdatePermissionDto {
  /**
   * 权限 ID
   */
  @IsString({ message: '权限 ID 必须是字符串' })
  @IsNotEmpty({ message: '权限 ID 不能为空' })
  id: string;

  /**
   * 权限名称
   */
  @IsOptional() // 可选字段
  @IsString({ message: '权限名称必须是字符串' })
  name?: string;

  /**
   * 权限描述
   */
  @IsOptional() // 可选字段
  @IsString({ message: '权限描述必须是字符串' })
  description?: string;
}
