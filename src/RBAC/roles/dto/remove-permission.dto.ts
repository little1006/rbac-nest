import { IsString, IsNotEmpty } from 'class-validator';

export class RemovePermissionDto {
  /**
   * 权限 ID
   */
  @IsString({ message: '权限 ID 必须是字符串' })
  @IsNotEmpty({ message: '权限 ID 不能为空' })
  permissionId: string;

  /**
   * 角色 ID
   */
  @IsString({ message: '角色 ID 必须是字符串' })
  @IsNotEmpty({ message: '角色 ID 不能为空' })
  roleId: string;
}
