import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Role } from './role.entity';

@Entity()
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, comment: '角色名' })
  name: string;

  @Column({ type: 'varchar', length: 100, comment: '角色描述' })
  description: string;

  @Column({ type: 'varchar', length: 100, comment: '允许资源' })
  resource: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '允许操作 (e.g., create, read, update, delete)',
  })
  action: string;

  @Column({ type: 'bool', comment: '系统角色 不可修改' })
  isSystem: boolean;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Promise<Role[]>;

  @CreateDateColumn({ name: 'create_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'update_at' })
  updatedAt: Date;
}
