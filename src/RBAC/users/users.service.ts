import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EnumUserStatus, User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { CrudService } from 'src/utils/crud/crud.service';
import { QueryUserListDto } from './dto/query-user-list.dto';
import * as crypto from 'crypto';
import { BusinessException } from 'src/error-handler/BusinessException';
import { ResService } from 'src/res/res.service';
import { BindRoleDto } from './dto/bind-role.dto';
import { RemoveRoleDto } from './dto/remove-role.dto';
import { RolesService } from '../roles/roles.service';
import { plainToInstance } from 'class-transformer';
import { UserDto } from './dto/expose-user.dto';
import { IDTokenDto } from 'src/oauth/google-oauth/dto/google.dto';
import { secureRandomString } from 'src/utils';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly crud: CrudService,
    private readonly rolesService: RolesService,
  ) {}

  // 创建 password 返回加密后的 password 和 盐
  genStorePassword(password: string): [string, string] {
    // 生成随机盐
    const salt = crypto.randomBytes(4).toString('hex');
    // 使用盐对密码进行加密
    const hash = crypto
      .pbkdf2Sync(password, salt, 1000, 32, 'sha512') // 使用 PBKDF2 算法
      .toString('hex');

    return [hash, salt];
  }

  /**
   * 验证密码是否匹配
   * @param plainPassword 明文密码
   * @param hashedPassword 数据库中存储的加密密码
   * @param salt 数据库中存储的盐
   * @returns 是否匹配
   */
  validatePassword(
    plainPassword: string,
    hashedPassword: string,
    salt: string,
  ): boolean {
    // 使用相同的盐和算法生成哈希值
    const hash = crypto
      .pbkdf2Sync(plainPassword, salt, 1000, 32, 'sha512') // 32 字节的哈希值
      .toString('hex');

    // 比较生成的哈希值和存储的哈希值
    return hash === hashedPassword;
  }

  /** 创建用户 */
  async create(createUserDto: CreateUserDto) {
    // 检查用户名是否已存在
    const existingUser = await this.userRepository.findOneBy({
      username: createUserDto.username,
    });
    if (existingUser) {
      throw new BusinessException(
        `用户 "${createUserDto.username}" 已存在`,
        ResService.CODES.BadRequest,
      );
    }

    const [password, salt] = this.genStorePassword(createUserDto.password);

    const user = this.userRepository.create({
      ...createUserDto,
      password,
      salt,
      status: EnumUserStatus.ACTIVE,
    });

    const res = await this.userRepository.save(user);

    return plainToInstance(UserDto, res, { excludeExtraneousValues: true });
  }

  /**
   * 分页查询
   */
  async findAll({ search, status, excludeAdmin = true, ...pagination }: QueryUserListDto) {
    // 获取管理员用户ID列表（用于排除）
    let excludeAdminIds: string[] = [];
    if (excludeAdmin) {
      const adminRoleId = 'b0000000-0000-0000-0000-000000000001';
      const adminUsers = await this.userRepository
        .createQueryBuilder('user')
        .leftJoin('user.roles', 'role')
        .where('role.id = :adminRoleId', { adminRoleId })
        .select('user.id')
        .getMany();
      excludeAdminIds = adminUsers.map(u => u.id);
    }

    const list = await this.crud.paginate({
      repository: this.userRepository,
      pagination,
      alias: 'user',
      filter(qb) {
        qb = qb.where('1=1');
        
        // 排除管理员用户
        if (excludeAdminIds.length > 0) {
          qb = qb.andWhere('user.id NOT IN (:...excludeAdminIds)', { excludeAdminIds });
        }
        
        if (!!status) {
          qb = qb.andWhere('user.status = :status', { status });
        }

        if (!!search) {
          qb = qb
            .andWhere('user.email LIKE :search', {
              search: `%${search}%`,
            })
            .andWhere('user.nickname LIKE :search', {
              search: `%${search}%`,
            });
        }

        return qb;
      },
    });

    // 使用 plainToInstance 将查询结果转换为 DTO
    const transformedList = plainToInstance(UserDto, list.list, {
      excludeExtraneousValues: true, // 排除未标记为 @Expose 的字段
    });

    return {
      ...list,
      list: transformedList,
    };
  }

  /**
   * 使用 email 查询用户
   */
  async findByEmail(email: string) {
    const user = await this.userRepository.findOneBy({ email });
    return plainToInstance(UserDto, user, { excludeExtraneousValues: true });
  }

  /**
   * 查询单个用户
   */
  async findOne(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    // 转换为不敏感的 UserDto
    return plainToInstance(UserDto, user, { excludeExtraneousValues: true });
  }

  /**
   * 修改用户
   */
  async update(updateUserDto: UpdateUserDto) {
    const { id, ...updateData } = updateUserDto;

    // 查找用户是否存在
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new Error(`用户 ID ${id} 不存在`);
    }

    // 更新用户信息
    Object.assign(user, updateData);

    const res = await this.userRepository.save(user);

    return plainToInstance(UserDto, res, { excludeExtraneousValues: true });
  }

  async remove(id: string) {
    // 查找用户是否存在
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new Error(`用户 ID ${id} 不存在`);
    }

    // 删除用户
    await this.userRepository.remove(user);
    return id;
  }

  /**
   * 查询用户的角色列表
   */
  async findAllRoles(userId: string) {
    // 查找用户是否存在
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'], // 加载用户的角色
    });

    if (!user) {
      throw new BusinessException(
        `用户 ID ${userId} 不存在`,
        ResService.CODES.BadRequest,
      );
    }

    return user.roles;
  }

  /**
   * 为用户绑定角色
   */
  async bindRole(bindRoleDto: BindRoleDto) {
    const { userId, roleId } = bindRoleDto;

    // 查找用户是否存在
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'], // 加载用户的角色
    });

    if (!user) {
      throw new BusinessException(
        `用户 ID ${userId} 不存在`,
        ResService.CODES.BadRequest,
      );
    }

    // 调用 RolesService 检查角色是否存在
    const role = await this.rolesService.findOne(roleId);

    const userRoles = await user.roles;

    // 检查角色是否已绑定
    if (userRoles.some((r) => r.id === roleId)) {
      throw new BusinessException(
        `角色 ID ${roleId} 已绑定到用户 ID ${userId}`,
        ResService.CODES.BadRequest,
      );
    }

    // 绑定角色
    userRoles.push(role);
    await this.userRepository.save(user);

    return { message: `角色 ID ${roleId} 已绑定到用户 ID ${userId}` };
  }

  /**
   * 为用户移除角色
   */
  async removeRole(removeRoleDto: RemoveRoleDto) {
    const { userId, roleId } = removeRoleDto;

    // 查找用户是否存在
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'], // 加载用户的角色
    });

    if (!user) {
      throw new BusinessException(
        `用户 ID ${userId} 不存在`,
        ResService.CODES.BadRequest,
      );
    }

    const userRoles = await user.roles;

    // 查找角色是否存在于用户中
    const roleIndex = userRoles.findIndex((r) => r.id === roleId);
    if (roleIndex === -1) {
      throw new BusinessException(
        `角色 ID ${roleId} 未绑定到用户 ID ${userId}`,
        ResService.CODES.BadRequest,
      );
    }

    // 移除角色
    userRoles.splice(roleIndex, 1);
    await this.userRepository.save(user);

    return { message: `角色 ID ${roleId} 已从用户 ID ${userId} 中移除` };
  }

  async validateUser(
    username: string,
    password: string,
  ): Promise<UserDto> | null {
    console.log('ss', username, password);
    // 查找用户是否存在 (支持 username 或 email 登录)
    const user = await this.userRepository.findOne({
      where: [
        { username },
        { email: username }
      ],
    });
    if (!user) {
      throw new BusinessException(
        `账户或密码错误`,
        ResService.CODES.BadRequest,
      );
    }
    console.log('validate user=', user);
    // 验证密码
    const isPasswordValid = this.validatePassword(
      password,
      user.password,
      user.salt,
    );
    if (!isPasswordValid) {
      throw new BusinessException(
        `用户名或密码错误`,
        ResService.CODES.BadRequest,
      );
    }

    return plainToInstance(UserDto, user, { excludeExtraneousValues: true });
  }

  /** 获取用户的所有权限 */
  async getUserPermissions(userId: string): Promise<string[]> {
    // 查询用户的角色
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'], // 加载用户的角色及其权限
    });

    if (!user) {
      throw new BusinessException('用户不存在', ResService.CODES.BadRequest);
    }

    // 解析惰性加载的角色和权限
    const roles = await user.roles; // 解析 roles
    const permissions = await Promise.all(
      roles.map(async (role) => await role.permissions), // 解析每个角色的权限
    );

    // 提取权限名称并去重
    const permissionNames = permissions
      .flat()
      .map((permission) => permission.name);

    // 去重并返回
    return [...new Set(permissionNames)];
  }

  /**
   * 谷歌信息快速注册
   *
   * 随机密码
   */
  async fastSignUpByGoogleProfile(profile: IDTokenDto) {
    // 检查email是否已存在
    const existingUser = await this.userRepository.findOneBy({
      email: profile.email,
    });
    if (existingUser) {
      throw new BusinessException(
        `邮箱 "${profile.email}" 已存在`,
        ResService.CODES.BadRequest,
      );
    }

    // 随机密码
    const random_password = secureRandomString(6);

    const [password, salt] = this.genStorePassword(random_password);

    const user = this.userRepository.create({
      email: profile.email,
      nickname: profile.name,
      avatar: profile.picture,
      password,
      salt,
      status: EnumUserStatus.ACTIVE,
    });

    const res = await this.userRepository.save(user);

    return plainToInstance(UserDto, res, { excludeExtraneousValues: true });
  }

  /** 修改密码 */
  async savePassword(userId: string, newpassword: string) {
    const [password, salt] = this.genStorePassword(newpassword);

    const user = await this.userRepository.findOneBy({ id: userId });

    user.password = password;
    user.salt = salt;

    const res = await this.userRepository.save(user);

    return plainToInstance(UserDto, res, { excludeExtraneousValues: true });
  }

  /** 获取用户统计信息（排除管理员账户） */
  async getStatistics() {
    // 获取SuperAdmin角色的ID
    const adminRoleId = 'b0000000-0000-0000-0000-000000000001';
    
    // 获取所有管理员用户ID
    const adminUserIds = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.roles', 'role')
      .where('role.id = :adminRoleId', { adminRoleId })
      .select('user.id')
      .getMany();
    
    const excludeAdminIds = adminUserIds.map(u => u.id);
    
    // 构建排除管理员的查询条件
    const buildExcludeAdminQuery = (qb: any) => {
      if (excludeAdminIds.length > 0) {
        qb.andWhere('user.id NOT IN (:...excludeAdminIds)', { excludeAdminIds });
      }
      return qb;
    };

    // 总用户数（不含管理员）
    let totalUsersQuery = this.userRepository.createQueryBuilder('user');
    totalUsersQuery = buildExcludeAdminQuery(totalUsersQuery);
    const totalUsers = await totalUsersQuery.getCount();

    // 活跃用户数（不含管理员）
    let activeUsersQuery = this.userRepository
      .createQueryBuilder('user')
      .where('user.status = :status', { status: EnumUserStatus.ACTIVE });
    activeUsersQuery = buildExcludeAdminQuery(activeUsersQuery);
    const activeUsers = await activeUsersQuery.getCount();

    // 未激活用户数
    let inactiveUsersQuery = this.userRepository
      .createQueryBuilder('user')
      .where('user.status = :status', { status: EnumUserStatus.INACTIVE });
    inactiveUsersQuery = buildExcludeAdminQuery(inactiveUsersQuery);
    const inactiveUsers = await inactiveUsersQuery.getCount();

    // 锁定用户数
    let lockedUsersQuery = this.userRepository
      .createQueryBuilder('user')
      .where('user.status = :status', { status: EnumUserStatus.LOCKED });
    lockedUsersQuery = buildExcludeAdminQuery(lockedUsersQuery);
    const lockedUsers = await lockedUsersQuery.getCount();

    // 今日新增用户（不含管理员）
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let todayUsersQuery = this.userRepository
      .createQueryBuilder('user')
      .where('user.createdAt >= :today', { today });
    todayUsersQuery = buildExcludeAdminQuery(todayUsersQuery);
    const todayUsers = await todayUsersQuery.getCount();

    // 本周新增用户（不含管理员）
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    let weekUsersQuery = this.userRepository
      .createQueryBuilder('user')
      .where('user.createdAt >= :weekStart', { weekStart });
    weekUsersQuery = buildExcludeAdminQuery(weekUsersQuery);
    const weekUsers = await weekUsersQuery.getCount();

    // 本月新增用户（不含管理员）
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    let monthUsersQuery = this.userRepository
      .createQueryBuilder('user')
      .where('user.createdAt >= :monthStart', { monthStart });
    monthUsersQuery = buildExcludeAdminQuery(monthUsersQuery);
    const monthUsers = await monthUsersQuery.getCount();

    // 最近7天每日注册趋势（不含管理员）
    let dailyTrendQuery = this.userRepository
      .createQueryBuilder('user')
      .select('DATE(user.createdAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('user.createdAt >= :startDate', {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      });
    if (excludeAdminIds.length > 0) {
      dailyTrendQuery = dailyTrendQuery.andWhere('user.id NOT IN (:...excludeAdminIds)', { excludeAdminIds });
    }
    const dailyTrend = await dailyTrendQuery
      .groupBy('DATE(user.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    // 最近注册的用户（不含管理员）
    let recentUsersQuery = this.userRepository
      .createQueryBuilder('user')
      .orderBy('user.createdAt', 'DESC')
      .take(5);
    if (excludeAdminIds.length > 0) {
      recentUsersQuery = recentUsersQuery.where('user.id NOT IN (:...excludeAdminIds)', { excludeAdminIds });
    }
    const recentUsers = await recentUsersQuery.getMany();

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      lockedUsers,
      todayUsers,
      weekUsers,
      monthUsers,
      dailyTrend,
      recentUsers: recentUsers.map((user) =>
        plainToInstance(UserDto, user, { excludeExtraneousValues: true }),
      ),
    };
  }
}
