import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { AdminUserService } from './admin-user.service';
import { AdminAuthService } from './admin-auth.service';
import { CreateAdminUserDto, UpdateAdminUserDto, QueryAdminUserListDto, AdminLoginDto } from './dto/admin-user.dto';
import { ResService } from 'src/res/res.service';
import { AdminJwtAuthGuard } from './guards/admin-jwt.guard';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminUserService: AdminUserService,
    private readonly adminAuthService: AdminAuthService,
    private readonly res: ResService,
  ) {}

  /** 管理员登录 */
  @Post('/auth/login')
  async login(@Body() loginDto: AdminLoginDto) {
    const token = await this.adminAuthService.login(loginDto);
    return this.res.success(token);
  }

  /** 刷新Token */
  @Post('/auth/refresh')
  async refreshToken(@Body('refresh_token') refreshToken: string) {
    const token = await this.adminAuthService.refreshToken(refreshToken);
    return this.res.success(token);
  }

  /** 获取当前管理员信息 */
  @UseGuards(AdminJwtAuthGuard)
  @Get('/users/current')
  async getCurrentAdmin(@Req() req: any) {
    const adminId = req.user.adminId;
    const admin = await this.adminUserService.findOne(adminId);
    return this.res.success(admin);
  }

  /** 获取当前管理员权限 */
  @UseGuards(AdminJwtAuthGuard)
  @Get('/users/permissions')
  async getCurrentAdminPermissions(@Req() req: any) {
    const adminId = req.user.adminId;
    const permissions = await this.adminUserService.getAdminPermissions(adminId);
    return this.res.success(permissions);
  }

  /** 创建管理员 - 仅超级管理员可操作 */
  @UseGuards(AdminJwtAuthGuard)
  @Post('/users/create')
  async create(@Req() req: any, @Body() createDto: CreateAdminUserDto) {
    if (!req.user.isSuper) {
      throw new ForbiddenException('仅超级管理员可以创建管理员账户');
    }
    const admin = await this.adminUserService.create(createDto);
    return this.res.success(admin);
  }

  /** 获取管理员列表 - 仅超级管理员可查看完整列表 */
  @UseGuards(AdminJwtAuthGuard)
  @Get('/users/list')
  async findAll(@Req() req: any, @Query() queryDto: QueryAdminUserListDto) {
    if (!req.user.isSuper) {
      throw new ForbiddenException('仅超级管理员可以查看管理员列表');
    }
    const result = await this.adminUserService.findAll(queryDto);
    return this.res.success(result);
  }

  /** 获取单个管理员 - 普通管理员只能查看自己 */
  @UseGuards(AdminJwtAuthGuard)
  @Get('/users/detail')
  async findOne(@Req() req: any, @Query('id') id: string) {
    // 普通管理员只能查看自己的信息
    if (!req.user.isSuper && req.user.adminId !== id) {
      throw new ForbiddenException('无权查看其他管理员信息');
    }
    const admin = await this.adminUserService.findOne(id);
    return this.res.success(admin);
  }

  /** 更新管理员 - 普通管理员只能更新自己，超级管理员可更新任何人 */
  @UseGuards(AdminJwtAuthGuard)
  @Post('/users/update')
  async update(@Req() req: any, @Body() updateDto: UpdateAdminUserDto) {
    // 普通管理员只能更新自己的信息
    if (!req.user.isSuper && req.user.adminId !== updateDto.id) {
      throw new ForbiddenException('无权修改其他管理员信息');
    }
    const admin = await this.adminUserService.update(updateDto);
    return this.res.success(admin);
  }

  /** 删除管理员 - 仅超级管理员可操作，且不能删除自己 */
  @UseGuards(AdminJwtAuthGuard)
  @Post('/users/delete')
  async remove(@Req() req: any, @Body('id') id: string) {
    if (!req.user.isSuper) {
      throw new ForbiddenException('仅超级管理员可以删除管理员账户');
    }
    if (req.user.adminId === id) {
      throw new ForbiddenException('不能删除自己的账户');
    }
    const result = await this.adminUserService.remove(id);
    return this.res.success(result);
  }

  /** 获取管理员统计 */
  @UseGuards(AdminJwtAuthGuard)
  @Get('/statistics')
  async getStatistics() {
    const stats = await this.adminUserService.getStatistics();
    return this.res.success(stats);
  }
}
