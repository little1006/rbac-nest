import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Role } from './role.entity';
import { Exclude } from 'class-transformer';

export enum EnumAdminUserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  LOCKED = 'locked',
}

@Entity('admin_user')
export class AdminUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, comment: '用户名', unique: true })
  username: string;

  @Column({ type: 'varchar', length: 100, comment: '昵称', nullable: true })
  nickname: string;

  @Exclude()
  @Column({ type: 'varchar', length: 64, comment: '密码' })
  password: string;

  @Exclude()
  @Column({ type: 'varchar', length: 32, comment: '盐' })
  salt: string;

  @Column({ type: 'varchar', length: 100, comment: '邮箱', unique: true })
  email: string;

  @Column({
    type: 'varchar',
    length: 500,
    comment: '头像URL',
    nullable: true,
  })
  avatar: string;

  @Column({
    type: 'enum',
    enum: EnumAdminUserStatus,
    default: EnumAdminUserStatus.ACTIVE,
    comment: '状态',
  })
  status: EnumAdminUserStatus;

  @Column({
    name: 'is_super',
    comment: '是否超级管理员',
    default: false,
  })
  isSuper: boolean;

  @Column({
    name: 'last_login_at',
    type: 'datetime',
    comment: '最后登录时间',
    nullable: true,
  })
  lastLoginAt: Date;

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'admin_user_roles_role',
    joinColumn: { name: 'adminUserId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' },
  })
  roles: Promise<Role[]>;

  @CreateDateColumn({ name: 'create_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'update_at' })
  updatedAt: Date;
}
