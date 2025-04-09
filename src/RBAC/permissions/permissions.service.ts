import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { QueryPermissionListDto } from './dto/query-permission-list.dto';
import { CrudService } from 'src/utils/crud/crud.service';
import { Permission } from 'src/entities/permission.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>, // 使用 Permission 实体
    private readonly crud: CrudService,
  ) {}

  /**
   * 创建权限
   */
  async create(createPermissionDto: CreatePermissionDto) {
    const permission = this.permissionRepository.create({
      ...createPermissionDto,
      isSystem: false,
    });
    return await this.permissionRepository.save(permission);
  }

  /**
   * 分页查询权限
   */
  async findAll({ search, ...pagination }: QueryPermissionListDto) {
    const list = await this.crud.paginate({
      repository: this.permissionRepository,
      pagination,
      alias: 'permission',
      filter(qb) {
        if (search) {
          qb = qb.where('permission.name LIKE :search', {
            search: `%${search}%`,
          });
        }
        return qb;
      },
    });

    return list;
  }

  /**
   * 查询单个权限
   */
  async findOne(id: string) {
    const permission = await this.permissionRepository.findOneBy({ id });
    if (!permission) {
      throw new Error(`权限 ID ${id} 不存在`);
    }
    return permission;
  }

  /**
   * 修改权限
   */
  async update(updatePermissionDto: UpdatePermissionDto) {
    const { id, ...updateData } = updatePermissionDto;

    // 查找权限是否存在
    const permission = await this.permissionRepository.findOneBy({ id });
    if (!permission) {
      throw new Error(`权限 ID ${id} 不存在`);
    }

    // 更新权限信息
    Object.assign(permission, updateData);
    return await this.permissionRepository.save(permission);
  }

  /**
   * 删除权限
   */
  async remove(id: string) {
    // 查找权限是否存在
    const permission = await this.permissionRepository.findOneBy({ id });
    if (!permission) {
      throw new Error(`权限 ID ${id} 不存在`);
    }

    // 删除权限
    await this.permissionRepository.remove(permission);
    return id;
  }
}
