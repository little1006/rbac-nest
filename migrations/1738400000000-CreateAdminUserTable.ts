import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAdminUserTable1738400000000 implements MigrationInterface {
    name = 'CreateAdminUserTable1738400000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 创建管理员用户表
        await queryRunner.query(`
            CREATE TABLE \`admin_user\` (
                \`id\` varchar(36) NOT NULL,
                \`username\` varchar(100) NOT NULL COMMENT '用户名',
                \`nickname\` varchar(100) NULL COMMENT '昵称',
                \`password\` varchar(64) NOT NULL COMMENT '密码',
                \`salt\` varchar(32) NOT NULL COMMENT '盐',
                \`email\` varchar(100) NOT NULL COMMENT '邮箱',
                \`avatar\` varchar(500) NULL COMMENT '头像URL',
                \`status\` enum('active', 'inactive', 'locked') NOT NULL DEFAULT 'active' COMMENT '状态',
                \`is_super\` tinyint NOT NULL DEFAULT 0 COMMENT '是否超级管理员',
                \`last_login_at\` datetime NULL COMMENT '最后登录时间',
                \`create_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`update_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                UNIQUE KEY \`IDX_admin_user_email\` (\`email\`),
                UNIQUE KEY \`IDX_admin_user_username\` (\`username\`)
            ) ENGINE=InnoDB
        `);

        // 创建管理员-角色关联表
        await queryRunner.query(`
            CREATE TABLE \`admin_user_roles_role\` (
                \`adminUserId\` varchar(36) NOT NULL,
                \`roleId\` varchar(36) NOT NULL,
                INDEX \`IDX_admin_user_roles_adminUserId\` (\`adminUserId\`),
                INDEX \`IDX_admin_user_roles_roleId\` (\`roleId\`),
                PRIMARY KEY (\`adminUserId\`, \`roleId\`),
                CONSTRAINT \`FK_admin_user_roles_adminUserId\` FOREIGN KEY (\`adminUserId\`) REFERENCES \`admin_user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT \`FK_admin_user_roles_roleId\` FOREIGN KEY (\`roleId\`) REFERENCES \`role\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
            ) ENGINE=InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`admin_user_roles_role\``);
        await queryRunner.query(`DROP TABLE \`admin_user\``);
    }
}
