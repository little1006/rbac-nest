import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ResService } from 'src/res/res.service';
import { QueryRoleListDto } from './dto/query-role-list.dto';
import { BindPermissionDto } from './dto/bind-permission.dto';
import { RemovePermissionDto } from './dto/remove-permission.dto';
import { BusinessException } from 'src/error-handler/BusinessException';
import { JwtAuthGuard } from 'src/guards/jwt/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('roles')
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    private readonly res: ResService,
  ) {}

  /** 创建角色 */
  @Post('/create')
  async create(@Body() createRoleDto: CreateRoleDto) {
    const result = await this.rolesService.create(createRoleDto);
    return this.res.success(result);
  }

  /** 查询角色列表 */
  @Get('/list')
  async findAll(@Query() queryRoleListDto: QueryRoleListDto) {
    const result = await this.rolesService.findAll(queryRoleListDto);
    return this.res.success(result);
  }

  /** 查询单个角色 */
  @Get('/getRoleById')
  async findOne(@Query('id') id: string) {
    const result = await this.rolesService.findOne(id);
    return this.res.success(result);
  }

  /** 修改角色 */
  @Post('/update')
  async update(@Body() updateRoleDto: UpdateRoleDto) {
    const result = await this.rolesService.update(updateRoleDto);
    return this.res.success(result);
  }

  /** 删除角色 */
  @Post('/delete')
  async remove(@Query('id') id: string) {
    const result = await this.rolesService.remove(id);
    return this.res.success(result);
  }

  /** 查询角色的权限列表 */
  @Get('/getPermissions')
  async findAllPermissions(@Query('roleId') roleId: string) {
    const result = await this.rolesService.findAllPermissions(roleId);
    return this.res.success(result);
  }

  /** 为角色绑定权限 */
  @Post('/bindPermission')
  async bindPermission(@Body() bindPermissionDto: BindPermissionDto) {
    const result = await this.rolesService.bindPermission(bindPermissionDto);
    return this.res.success(result);
  }

  /** 为角色移除权限 */
  @Post('/removePermission')
  async removePermission(@Body() removePermissionDto: RemovePermissionDto) {
    const result = await this.rolesService.removePermission(
      removePermissionDto,
    );
    return this.res.success(result);
  }
}
