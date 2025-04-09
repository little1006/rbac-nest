import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSaltLength1744108650217 implements MigrationInterface {
    name = 'UpdateSaltLength1744108650217'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` MODIFY COLUMN \`salt\` varchar(32) NOT NULL COMMENT '盐 每次更新密码时随机生成'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` MODIFY COLUMN \`salt\` varchar(8) NOT NULL COMMENT '盐 每次更新密码时随机生成'`);
    }
}
