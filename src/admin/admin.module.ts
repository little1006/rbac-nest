import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AdminUser } from 'src/entities/admin_user.entity';
import { AdminUserService } from './admin-user.service';
import { AdminAuthService } from './admin-auth.service';
import { AdminController } from './admin.controller';
import { AdminJwtAuthGuard } from './guards/admin-jwt.guard';
import { ResModule } from 'src/res/res.module';
import { CrudModule } from 'src/utils/crud/crud.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminUser]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    }),
    ResModule,
    CrudModule,
  ],
  controllers: [AdminController],
  providers: [AdminUserService, AdminAuthService, AdminJwtAuthGuard],
  exports: [AdminUserService, AdminAuthService],
})
export class AdminModule {}
