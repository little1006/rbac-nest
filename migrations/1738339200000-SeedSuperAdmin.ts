import { MigrationInterface, QueryRunner } from "typeorm";
import * as crypto from "crypto";

export class SeedSuperAdmin1738339200000 implements MigrationInterface {
    name = 'SeedSuperAdmin1738339200000'

    // 预生成的密码哈希值 (password: yuanjinghao0103)
    // 使用 PBKDF2: 1000 iterations, SHA512, 32-byte output
    private readonly ADMIN_PASSWORD_HASH = '23af49a4c9ae8194f4cbbca31a6e85ee969606e2c3018ec35a5d0d5a57f5e305';
    private readonly ADMIN_SALT = '2469f638';
    private readonly ADMIN_EMAIL = '1837687575@qq.com';
    private readonly ADMIN_USERNAME = 'SuperAdmin';

    // 使用固定的UUID，便于管理和回滚
    private readonly SUPER_ADMIN_USER_ID = 'a0000000-0000-0000-0000-000000000001';
    private readonly SUPER_ADMIN_ROLE_ID = 'b0000000-0000-0000-0000-000000000001';
    
    // 系统权限ID
    private readonly PERMISSIONS = [
        { id: 'c0000000-0000-0000-0000-000000000001', name: 'user:create', resource: 'user', action: 'create', description: '创建用户' },
        { id: 'c0000000-0000-0000-0000-000000000002', name: 'user:read', resource: 'user', action: 'read', description: '查看用户' },
        { id: 'c0000000-0000-0000-0000-000000000003', name: 'user:update', resource: 'user', action: 'update', description: '更新用户' },
        { id: 'c0000000-0000-0000-0000-000000000004', name: 'user:delete', resource: 'user', action: 'delete', description: '删除用户' },
        { id: 'c0000000-0000-0000-0000-000000000005', name: 'role:create', resource: 'role', action: 'create', description: '创建角色' },
        { id: 'c0000000-0000-0000-0000-000000000006', name: 'role:read', resource: 'role', action: 'read', description: '查看角色' },
        { id: 'c0000000-0000-0000-0000-000000000007', name: 'role:update', resource: 'role', action: 'update', description: '更新角色' },
        { id: 'c0000000-0000-0000-0000-000000000008', name: 'role:delete', resource: 'role', action: 'delete', description: '删除角色' },
        { id: 'c0000000-0000-0000-0000-000000000009', name: 'permission:create', resource: 'permission', action: 'create', description: '创建权限' },
        { id: 'c0000000-0000-0000-0000-000000000010', name: 'permission:read', resource: 'permission', action: 'read', description: '查看权限' },
        { id: 'c0000000-0000-0000-0000-000000000011', name: 'permission:update', resource: 'permission', action: 'update', description: '更新权限' },
        { id: 'c0000000-0000-0000-0000-000000000012', name: 'permission:delete', resource: 'permission', action: 'delete', description: '删除权限' },
        { id: 'c0000000-0000-0000-0000-000000000013', name: 'system:manage', resource: 'system', action: 'manage', description: '系统管理' },
        { id: 'c0000000-0000-0000-0000-000000000014', name: 'system:config', resource: 'system', action: 'config', description: '系统配置' },
    ];

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. 创建所有系统权限
        for (const perm of this.PERMISSIONS) {
            await queryRunner.query(`
                INSERT INTO \`permission\` (\`id\`, \`name\`, \`description\`, \`resource\`, \`action\`, \`isSystem\`)
                VALUES ('${perm.id}', '${perm.name}', '${perm.description}', '${perm.resource}', '${perm.action}', 1)
            `);
        }

        // 2. 创建超级管理员角色
        await queryRunner.query(`
            INSERT INTO \`role\` (\`id\`, \`name\`, \`description\`, \`isSystem\`)
            VALUES ('${this.SUPER_ADMIN_ROLE_ID}', 'SuperAdmin', '超级管理员 - 拥有所有系统权限', 1)
        `);

        // 3. 为超级管理员角色绑定所有权限
        for (const perm of this.PERMISSIONS) {
            await queryRunner.query(`
                INSERT INTO \`role_permissions_permission\` (\`roleId\`, \`permissionId\`)
                VALUES ('${this.SUPER_ADMIN_ROLE_ID}', '${perm.id}')
            `);
        }

        // 4. 创建超级管理员用户
        await queryRunner.query(`
            INSERT INTO \`user\` (\`id\`, \`username\`, \`password\`, \`salt\`, \`email\`, \`status\`, \`nickname\`, \`email_verified\`)
            VALUES ('${this.SUPER_ADMIN_USER_ID}', '${this.ADMIN_USERNAME}', '${this.ADMIN_PASSWORD_HASH}', '${this.ADMIN_SALT}', '${this.ADMIN_EMAIL}', 'active', '超级管理员', 1)
        `);

        // 5. 为超级管理员用户绑定超级管理员角色
        await queryRunner.query(`
            INSERT INTO \`user_roles_role\` (\`userId\`, \`roleId\`)
            VALUES ('${this.SUPER_ADMIN_USER_ID}', '${this.SUPER_ADMIN_ROLE_ID}')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 按照创建的逆序删除

        // 1. 删除用户-角色关联
        await queryRunner.query(`
            DELETE FROM \`user_roles_role\` WHERE \`userId\` = '${this.SUPER_ADMIN_USER_ID}'
        `);

        // 2. 删除超级管理员用户
        await queryRunner.query(`
            DELETE FROM \`user\` WHERE \`id\` = '${this.SUPER_ADMIN_USER_ID}'
        `);

        // 3. 删除角色-权限关联
        await queryRunner.query(`
            DELETE FROM \`role_permissions_permission\` WHERE \`roleId\` = '${this.SUPER_ADMIN_ROLE_ID}'
        `);

        // 4. 删除超级管理员角色
        await queryRunner.query(`
            DELETE FROM \`role\` WHERE \`id\` = '${this.SUPER_ADMIN_ROLE_ID}'
        `);

        // 5. 删除所有系统权限
        for (const perm of this.PERMISSIONS) {
            await queryRunner.query(`
                DELETE FROM \`permission\` WHERE \`id\` = '${perm.id}'
            `);
        }
    }
}
