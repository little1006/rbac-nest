import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedAdminSuperAdmin1738400000001 implements MigrationInterface {
    name = 'SeedAdminSuperAdmin1738400000001'

    // 使用与user表SuperAdmin相同的凭据
    // 密码: yuanjinghao0103
    // PBKDF2: 1000 iterations, SHA512, 32-byte output
    private readonly ADMIN_PASSWORD_HASH = '23af49a4c9ae8194f4cbbca31a6e85ee969606e2c3018ec35a5d0d5a57f5e305';
    private readonly ADMIN_SALT = '2469f638';
    private readonly ADMIN_EMAIL = '1837687575@qq.com';
    private readonly ADMIN_USERNAME = 'SuperAdmin';

    // 固定UUID - 用于admin_user表
    private readonly ADMIN_SUPER_USER_ID = 'd0000000-0000-0000-0000-000000000001';
    
    // 复用已存在的SuperAdmin角色ID
    private readonly SUPER_ADMIN_ROLE_ID = 'b0000000-0000-0000-0000-000000000001';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. 创建超级管理员到admin_user表
        await queryRunner.query(`
            INSERT INTO \`admin_user\` (\`id\`, \`username\`, \`password\`, \`salt\`, \`email\`, \`nickname\`, \`status\`, \`is_super\`)
            VALUES ('${this.ADMIN_SUPER_USER_ID}', '${this.ADMIN_USERNAME}', '${this.ADMIN_PASSWORD_HASH}', '${this.ADMIN_SALT}', '${this.ADMIN_EMAIL}', '超级管理员', 'active', 1)
        `);

        // 2. 为admin_user绑定SuperAdmin角色
        await queryRunner.query(`
            INSERT INTO \`admin_user_roles_role\` (\`adminUserId\`, \`roleId\`)
            VALUES ('${this.ADMIN_SUPER_USER_ID}', '${this.SUPER_ADMIN_ROLE_ID}')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 1. 删除admin_user-角色关联
        await queryRunner.query(`
            DELETE FROM \`admin_user_roles_role\` WHERE \`adminUserId\` = '${this.ADMIN_SUPER_USER_ID}'
        `);

        // 2. 删除admin_user
        await queryRunner.query(`
            DELETE FROM \`admin_user\` WHERE \`id\` = '${this.ADMIN_SUPER_USER_ID}'
        `);
    }
}
