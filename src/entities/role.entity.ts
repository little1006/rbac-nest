import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from './user.entity';
import { Permission } from './permission.entity';

@Entity()
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, comment: '角色名' })
  name: string;

  @Column({ type: 'varchar', length: 100, comment: '角色描述' })
  description: string;

  @Column({ type: 'bool', comment: '系统角色 不可修改' })
  isSystem: boolean;

  @ManyToMany(() => User, (user) => user.roles)
  users: Promise<User[]>;

  @ManyToMany(() => Permission, (permission) => permission.roles)
  @JoinTable() // TypeORM 会自动创建 user_roles 关联表
  permissions: Promise<Permission[]>;

  @CreateDateColumn({ name: 'create_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'update_at' })
  updatedAt: Date;
}
