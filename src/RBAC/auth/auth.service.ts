import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);

    const expires_in = process.env.JWT_EXPIRES_IN || 3600;

    // 生成访问令牌 (accessToken)
    const payload = { username: user.username, sub: user.id };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '1d',
      secret: process.env.JWT_SECRET,
    });

    // 生成刷新令牌 (refreshToken)
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '1M',
      secret: process.env.JWT_SECRET,
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: process.env.JWT_EXPIRES_IN || 3600,
      token_type: 'Bearer',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.validateUser(
      loginDto.username,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException();
    }

    const expires_in = process.env.JWT_EXPIRES_IN || 3600;

    // 生成访问令牌 (accessToken)
    const payload = { username: user.username, sub: user.id };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '1d',
      secret: process.env.JWT_SECRET,
    });

    // 生成刷新令牌 (refreshToken)
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '1M',
      secret: process.env.JWT_SECRET,
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: process.env.JWT_EXPIRES_IN || 3600,
      token_type: 'Bearer',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET,
      });
      const user = await this.userService.findOne(payload.sub);
      if (!user) {
        throw new UnauthorizedException();
      }

      // 重新生成访问令牌
      const newAccessToken = this.jwtService.sign(
        { username: user.username, sub: user.id },
        {
          expiresIn: process.env.JWT_EXPIRES_IN || 3600,
          secret: process.env.JWT_SECRET,
        },
      );

      return {
        access_token: newAccessToken,
        expires_in: process.env.JWT_EXPIRES_IN || 3600,
        token_type: 'Bearer',
      };
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
