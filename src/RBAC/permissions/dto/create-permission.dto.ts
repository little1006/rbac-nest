import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreatePermissionDto {
  /**
   * 权限名称
   */
  @IsString({ message: '权限名称必须是字符串' })
  @IsNotEmpty({ message: '权限名称不能为空' })
  name: string;

  /**
   * 权限描述
   */
  @IsOptional() // 可选字段
  @IsString({ message: '权限描述必须是字符串' })
  description?: string;
}
