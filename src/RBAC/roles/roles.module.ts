import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { Role } from 'src/entities/role.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsService } from '../permissions/permissions.service';
import { Permission } from 'src/entities/permission.entity';
import { PermissionsModule } from '../permissions/permissions.module';
import { permission } from 'process';

@Module({
  imports: [TypeOrmModule.forFeature([Role]), PermissionsModule],
  controllers: [RolesController],
  providers: [RolesService, PermissionsService],
  exports: [RolesService, TypeOrmModule.forFeature([Role])],
})
export class RolesModule {}
