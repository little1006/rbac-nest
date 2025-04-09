import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  /**
   * 邮箱
   */
  @IsOptional() // 可选字段
  @IsEmail({}, { message: '邮箱格式不正确' }) // 验证邮箱格式
  email?: string;

  /**
   * 姓氏
   */
  @IsOptional() // 可选字段
  @IsString({ message: '姓氏必须是字符串' }) // 验证字符串
  firstName?: string;

  /**
   * ID 编号
   */
  @IsString({ message: 'ID 必须是字符串' }) // 必填字段，必须是字符串
  id: string;

  /**
   * 名字
   */
  @IsOptional() // 可选字段
  @IsString({ message: '名字必须是字符串' }) // 验证字符串
  lastName?: string;

  /**
   * 状态 active-正常 inactive-失效 locked-锁定
   */
  @IsOptional() // 可选字段
  @IsIn(['active', 'inactive', 'locked'], {
    message: '状态必须是 active、inactive 或 locked',
  }) // 验证状态值
  status?: string;
}
