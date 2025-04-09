import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResService } from 'src/res/res.service';
import { QueryUserListDto } from './dto/query-user-list.dto';
import { BindRoleDto } from './dto/bind-role.dto';
import { RemoveRoleDto } from './dto/remove-role.dto';
import { JwtAuthGuard } from 'src/guards/jwt/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly res: ResService,
  ) {}

  /** 创建用户 */
  @Post('/create')
  async create(@Body() createUserDto: CreateUserDto) {
    const res = await this.usersService.create(createUserDto);
    return this.res.success(res);
  }

  /** 查询用户列表 */
  @Get('/list')
  async findAll(@Query() queryUserListDto: QueryUserListDto) {
    const res = await this.usersService.findAll(queryUserListDto);
    return this.res.success(res);
  }

  /** 查询单个用户 */
  @Get('/getUserById')
  async findOne(@Query('id') id: string) {
    const res = await this.usersService.findOne(id);
    return this.res.success(res);
  }

  /** 修改用户 */
  @Post('/update')
  async update(@Body() updateUserDto: UpdateUserDto) {
    const res = await this.usersService.update(updateUserDto);
    return this.res.success(res);
  }

  /** 删除用户 */
  @Post('/delete')
  async remove(@Param('id') id: string) {
    const res = await this.usersService.remove(id);
    return this.res.success(res);
  }

  /** 查询用户的角色列表 */
  @Get('/getRoles')
  async findAllRoles(@Query('userId') userId: string) {
    const res = await this.usersService.findAllRoles(userId);
    return this.res.success(res);
  }

  /** 为用户绑定角色 */
  @Post('/bindRole')
  async bindRole(@Body() bindRoleDto: BindRoleDto) {
    const res = await this.usersService.bindRole(bindRoleDto);
    return this.res.success(res);
  }

  /** 为用户移除角色 */
  @Post('/removeRole')
  async removeRole(@Body() removeRoleDto: RemoveRoleDto) {
    const res = await this.usersService.removeRole(removeRoleDto);
    return this.res.success(res);
  }

  /** 获取当前登陆用户 */
  @Get('/getCurrentUser')
  async getCurrentUser() {
    // TODO 需要解析jwt
    return '';
  }

  /** 获取当前登陆用户所有权限 */
  @Get('/permissions')
  getCurrentUserPermissions() {
    // TODO
    return '';
  }
}
