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

export enum EnumUserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  LOCKED = 'locked',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, comment: '用户名' })
  username: string;

  @Column({ type: 'varchar', length: 64, comment: '密码' })
  password: string;

  @Column({ type: 'varchar', length: 32, comment: '盐 每次更新密码时随机生成' })
  salt: string;

  @Column({ type: 'varchar', length: 100, comment: '邮箱' })
  email: string;

  @Column({
    type: 'enum',
    enum: EnumUserStatus,
    default: EnumUserStatus.ACTIVE,
    comment: '用户状态',
  })
  status: string;

  @Column({
    type: 'varchar',
    name: 'first_name',
    length: 50,
    comment: '姓氏',
    nullable: true,
  })
  firstName: string;

  @Column({
    type: 'varchar',
    name: 'last_name',
    length: 50,
    comment: '名',
    nullable: true,
  })
  lastName: string;

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable() // TypeORM 会自动创建 user_roles 关联表
  roles: Promise<Role[]>;

  @CreateDateColumn({ name: 'create_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'update_at' })
  updatedAt: Date;
}
