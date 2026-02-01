import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminUserService } from './admin-user.service';
import { AdminLoginDto } from './dto/admin-user.dto';
import { AdminUserDto } from './dto/expose-admin-user.dto';

export interface AdminTokenDto {
  access_token: string;
  refresh_token?: string;
  expires_in: string;
  token_type: string;
}

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly adminUserService: AdminUserService,
    private readonly jwtService: JwtService,
  ) {}

  private async signToken(admin: AdminUserDto, needRefresh = false): Promise<AdminTokenDto> {
    const expires_in = process.env.JWT_EXPIRES_IN || '7d';

    const payload = { 
      username: admin.email, 
      sub: admin.id, 
      adminId: admin.id,
      isAdmin: true,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: expires_in,
      secret: process.env.JWT_SECRET,
    });

    const refreshToken = needRefresh
      ? this.jwtService.sign(payload, {
          expiresIn: '30d',
          secret: process.env.JWT_SECRET,
        })
      : undefined;

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in,
      token_type: 'Bearer',
    };
  }

  async login(loginDto: AdminLoginDto): Promise<AdminTokenDto> {
    const admin = await this.adminUserService.validateAdmin(
      loginDto.username,
      loginDto.password,
    );
    return this.signToken(admin, true);
  }

  async refreshToken(refreshToken: string): Promise<AdminTokenDto> {
    const payload = this.jwtService.verify(refreshToken, {
      secret: process.env.JWT_SECRET,
    });

    if (!payload.isAdmin) {
      throw new Error('Invalid admin token');
    }

    const admin = await this.adminUserService.findOne(payload.adminId);
    if (!admin) {
      throw new Error('Admin not found');
    }

    return this.signToken(admin);
  }
}
