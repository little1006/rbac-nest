import { IsString, IsNotEmpty } from 'class-validator';

export class BindRoleDto {
  /**
   * 用户 ID
   */
  @IsString({ message: '用户 ID 必须是字符串' })
  @IsNotEmpty({ message: '用户 ID 不能为空' })
  userId: string;

  /**
   * 角色 ID
   */
  @IsString({ message: '角色 ID 必须是字符串' })
  @IsNotEmpty({ message: '角色 ID 不能为空' })
  roleId: string;
}
