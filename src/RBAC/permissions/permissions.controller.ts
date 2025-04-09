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
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { ResService } from 'src/res/res.service';
import { QueryPermissionListDto } from './dto/query-permission-list.dto';
import { JwtAuthGuard } from 'src/guards/jwt/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly res: ResService,
  ) {}

  /** 创建权限 */
  @Post('/create')
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    const result = await this.permissionsService.create(createPermissionDto);
    return this.res.success(result);
  }

  /** 查询权限列表 */
  @Get('/list')
  async findAll(@Query() queryPermissionListDto: QueryPermissionListDto) {
    const result = await this.permissionsService.findAll(
      queryPermissionListDto,
    );
    return this.res.success(result);
  }

  /** 查询单个权限 */
  @Get('/getRoleById')
  async findOne(@Query('id') id: string) {
    const result = await this.permissionsService.findOne(id);
    return this.res.success(result);
  }

  /** 修改权限 */
  @Post('/update')
  async update(@Body() updatePermissionDto: UpdatePermissionDto) {
    const result = await this.permissionsService.update(updatePermissionDto);
    return this.res.success(result);
  }

  /** 删除角色 */
  @Post('/delete')
  async remove(@Param('id') id: string) {
    const result = await this.permissionsService.remove(id);
    return this.res.success(result);
  }
}
