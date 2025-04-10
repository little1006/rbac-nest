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
        `用户名 "${createUserDto.username}" 已存在`,
        ResService.CODES.BadRequest,
      );
    }

    // TODO 生成 psw 和 salt
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
  async findAll({ search, status, ...pagination }: QueryUserListDto) {
    const list = await this.crud.paginate({
      repository: this.userRepository,
      pagination,
      alias: 'user',
      filter(qb) {
        if (!!status) {
          qb = qb.where('user.status = :status', { status });
        }

        if (!!search) {
          qb = qb.where('user.username LIKE :search', {
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

  async validateUser(username: string, password: string): Promise<User> | null {
    // 查找用户是否存在
    const user = await this.userRepository.findOne({
      where: { username },
    });
    if (!user) {
      throw new BusinessException(
        `用户 ${username} 不存在`,
        ResService.CODES.BadRequest,
      );
    }
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

    return user;
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
}
