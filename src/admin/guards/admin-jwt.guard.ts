import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUser } from 'src/entities/admin_user.entity';

@Injectable()
export class AdminJwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(AdminUser)
    private adminUserRepository: Repository<AdminUser>,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('未提供认证令牌');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      // 验证是否为管理员token
      if (!payload.isAdmin) {
        throw new UnauthorizedException('非管理员令牌');
      }

      // 获取管理员的isSuper状态
      const admin = await this.adminUserRepository.findOne({
        where: { id: payload.adminId },
        select: ['id', 'isSuper'],
      });

      if (!admin) {
        throw new UnauthorizedException('管理员不存在');
      }

      request.user = {
        ...payload,
        isSuper: admin.isSuper,
      };
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('无效的认证令牌');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
