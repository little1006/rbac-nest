import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateRoleDto {
  /**
   * 角色名称
   */
  @IsString({ message: '角色名称必须是字符串' })
  @IsNotEmpty({ message: '角色名称不能为空' })
  name: string;

  /**
   * 角色描述
   */
  @IsOptional() // 可选字段
  @IsString({ message: '角色描述必须是字符串' })
  description?: string;
}
