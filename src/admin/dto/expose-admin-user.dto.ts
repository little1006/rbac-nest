import { Expose } from 'class-transformer';

export class AdminUserDto {
  @Expose()
  id: string;

  @Expose()
  username: string;

  @Expose()
  nickname: string;

  @Expose()
  email: string;

  @Expose()
  avatar: string;

  @Expose()
  status: string;

  @Expose()
  isSuper: boolean;

  @Expose()
  lastLoginAt: Date;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
