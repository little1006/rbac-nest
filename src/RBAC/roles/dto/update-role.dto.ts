import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class UpdateRoleDto {
  /**
   * 角色 ID
   */
  @IsString({ message: '角色 ID 必须是字符串' })
  @IsNotEmpty({ message: '角色 ID 不能为空' })
  id: string;

  /**
   * 角色名称
   */
  @IsOptional() // 可选字段
  @IsString({ message: '角色名称必须是字符串' })
  name?: string;

  /**
   * 角色描述
   */
  @IsOptional() // 可选字段
  @IsString({ message: '角色描述必须是字符串' })
  description?: string;
}
