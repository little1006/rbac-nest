import { IsString, IsNotEmpty, IsOptional, IsEmail, MinLength } from 'class-validator';

export class CreateAdminUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  nickname?: string;

  @IsString()
  @IsOptional()
  avatar?: string;
}

export class UpdateAdminUserDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  nickname?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  status?: 'active' | 'inactive' | 'locked';
}

export class AdminLoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class QueryAdminUserListDto {
  @IsOptional()
  current?: number;

  @IsOptional()
  pageSize?: number;

  @IsOptional()
  search?: string;

  @IsOptional()
  status?: 'active' | 'inactive' | 'locked';
}
