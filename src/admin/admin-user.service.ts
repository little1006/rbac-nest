import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { plainToInstance } from 'class-transformer';
import { AdminUser, EnumAdminUserStatus } from 'src/entities/admin_user.entity';
import { CreateAdminUserDto, UpdateAdminUserDto, QueryAdminUserListDto } from './dto/admin-user.dto';
import { AdminUserDto } from './dto/expose-admin-user.dto';
import { BusinessException } from 'src/error-handler/BusinessException';
import { ResService } from 'src/res/res.service';
import { CrudService } from 'src/utils/crud/crud.service';

@Injectable()
export class AdminUserService {
  constructor(
    @InjectRepository(AdminUser)
    private readonly adminUserRepository: Repository<AdminUser>,
    private readonly crud: CrudService,
  ) {}

  // 生成加密密码
  genStorePassword(password: string): [string, string] {
    const salt = crypto.randomBytes(4).toString('hex');
    const hash = crypto
      .pbkdf2Sync(password, salt, 1000, 32, 'sha512')
      .toString('hex');
    return [hash, salt];
  }

  // 验证密码
  validatePassword(plainPassword: string, hashedPassword: string, salt: string): boolean {
    const hash = crypto
      .pbkdf2Sync(plainPassword, salt, 1000, 32, 'sha512')
      .toString('hex');
    return hash === hashedPassword;
  }

  // 创建管理员
  async create(createDto: CreateAdminUserDto): Promise<AdminUserDto> {
    // 检查用户名是否已存在
    const existingByUsername = await this.adminUserRepository.findOneBy({
      username: createDto.username,
    });
    if (existingByUsername) {
      throw new BusinessException(
        `用户名 "${createDto.username}" 已存在`,
        ResService.CODES.BadRequest,
      );
    }

    // 检查邮箱是否已存在
    const existingByEmail = await this.adminUserRepository.findOneBy({
      email: createDto.email,
    });
    if (existingByEmail) {
      throw new BusinessException(
        `邮箱 "${createDto.email}" 已存在`,
        ResService.CODES.BadRequest,
      );
    }

    const [password, salt] = this.genStorePassword(createDto.password);

    const adminUser = this.adminUserRepository.create({
      ...createDto,
      password,
      salt,
      status: EnumAdminUserStatus.ACTIVE,
    });

    const res = await this.adminUserRepository.save(adminUser);
    return plainToInstance(AdminUserDto, res, { excludeExtraneousValues: true });
  }

  // 分页查询管理员列表
  async findAll({ search, status, ...pagination }: QueryAdminUserListDto) {
    const list = await this.crud.paginate({
      repository: this.adminUserRepository,
      pagination,
      alias: 'admin',
      filter(qb) {
        qb = qb.where('1=1');
        if (status) {
          qb = qb.andWhere('admin.status = :status', { status });
        }
        if (search) {
          qb = qb.andWhere(
            '(admin.email LIKE :search OR admin.username LIKE :search OR admin.nickname LIKE :search)',
            { search: `%${search}%` },
          );
        }
        return qb;
      },
    });

    const transformedList = plainToInstance(AdminUserDto, list.list, {
      excludeExtraneousValues: true,
    });

    return {
      ...list,
      list: transformedList,
    };
  }

  // 根据邮箱查找
  async findByEmail(email: string): Promise<AdminUser | null> {
    return this.adminUserRepository.findOneBy({ email });
  }

  // 根据用户名查找
  async findByUsername(username: string): Promise<AdminUser | null> {
    return this.adminUserRepository.findOneBy({ username });
  }

  // 根据ID查找
  async findOne(id: string): Promise<AdminUserDto> {
    const adminUser = await this.adminUserRepository.findOneBy({ id });
    return plainToInstance(AdminUserDto, adminUser, { excludeExtraneousValues: true });
  }

  // 更新管理员
  async update(updateDto: UpdateAdminUserDto): Promise<AdminUserDto> {
    const { id, ...updateData } = updateDto;

    const adminUser = await this.adminUserRepository.findOneBy({ id });
    if (!adminUser) {
      throw new BusinessException(`管理员 ID ${id} 不存在`, ResService.CODES.BadRequest);
    }

    Object.assign(adminUser, updateData);
    const res = await this.adminUserRepository.save(adminUser);
    return plainToInstance(AdminUserDto, res, { excludeExtraneousValues: true });
  }

  // 删除管理员
  async remove(id: string): Promise<string> {
    const adminUser = await this.adminUserRepository.findOneBy({ id });
    if (!adminUser) {
      throw new BusinessException(`管理员 ID ${id} 不存在`, ResService.CODES.BadRequest);
    }
    if (adminUser.isSuper) {
      throw new BusinessException('无法删除超级管理员', ResService.CODES.BadRequest);
    }
    await this.adminUserRepository.remove(adminUser);
    return id;
  }

  // 验证管理员登录
  async validateAdmin(username: string, password: string): Promise<AdminUserDto | null> {
    // 支持用户名或邮箱登录
    const adminUser = await this.adminUserRepository.findOne({
      where: [{ username }, { email: username }],
    });

    if (!adminUser) {
      throw new BusinessException('账户或密码错误', ResService.CODES.BadRequest);
    }

    const isPasswordValid = this.validatePassword(password, adminUser.password, adminUser.salt);
    if (!isPasswordValid) {
      throw new BusinessException('账户或密码错误', ResService.CODES.BadRequest);
    }

    // 更新最后登录时间
    adminUser.lastLoginAt = new Date();
    await this.adminUserRepository.save(adminUser);

    return plainToInstance(AdminUserDto, adminUser, { excludeExtraneousValues: true });
  }

  // 获取管理员权限
  async getAdminPermissions(adminId: string): Promise<string[]> {
    const adminUser = await this.adminUserRepository.findOne({
      where: { id: adminId },
      relations: ['roles', 'roles.permissions'],
    });

    if (!adminUser) {
      throw new BusinessException('管理员不存在', ResService.CODES.BadRequest);
    }

    // 超级管理员拥有所有权限
    if (adminUser.isSuper) {
      return ['*'];
    }

    const roles = await adminUser.roles;
    const permissions = await Promise.all(
      roles.map(async (role) => await role.permissions),
    );

    const permissionNames = permissions.flat().map((p) => p.name);
    return [...new Set(permissionNames)];
  }

  // 获取管理员统计
  async getStatistics() {
    const totalAdmins = await this.adminUserRepository.count();
    const activeAdmins = await this.adminUserRepository.count({
      where: { status: EnumAdminUserStatus.ACTIVE },
    });

    return {
      totalAdmins,
      activeAdmins,
    };
  }

  // 修改密码
  async changePassword(adminId: string, newPassword: string): Promise<void> {
    const [password, salt] = this.genStorePassword(newPassword);
    const adminUser = await this.adminUserRepository.findOneBy({ id: adminId });
    
    if (!adminUser) {
      throw new BusinessException('管理员不存在', ResService.CODES.BadRequest);
    }

    adminUser.password = password;
    adminUser.salt = salt;
    await this.adminUserRepository.save(adminUser);
  }
}
